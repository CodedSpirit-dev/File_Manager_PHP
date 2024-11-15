<?php
// app/Http/Controllers/PositionController.php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Employee;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PositionController extends Controller
{
    /**
     * Constructor para aplicar middleware de autenticación.
     */
    public function __construct()
    {
        $this->middleware('auth:employee');
    }

    /**
     * Normaliza una ruta eliminando redundancias y asegurando que no suba a directorios superiores.
     */
    private function normalizePath($path)
    {
        $path = rtrim(preg_replace('#/+#', '/', $path), '/'); // Eliminar barras redundantes
        return Str::startsWith($path, 'public') ? $path : "public/$path"; // Asegurar prefijo 'public'
    }

    /**
     * Verificar si la ruta proporcionada es válida.
     */
    private function isValidPath($path)
    {
        // Evitar rutas que suban a directorios superiores
        return !Str::contains($path, ['..', './', '../']);
    }

    /**
     * Verifica si el empleado tiene el permiso especificado.
     *
     * @param string $permission
     * @return bool
     */
    private function hasPermission(string $permission): bool
    {
        $employee = Auth::guard('employee')->user();

        // Asegúrate de que la relación 'permissions' esté cargada
        if (!$employee->relationLoaded('permissions')) {
            $employee->load('permissions');
        }

        return $employee->permissions->contains('name', $permission);
    }

    /**
     * Registra una acción en la tabla de logs.
     *
     * @param int $userId
     * @param string $transaction_id Identificador de la transacción (e.g., 'create_position')
     * @param string $description Descripción detallada de la acción
     * @param \Illuminate\Http\Request $request
     * @return void
     */
    private function registerLog(int $userId, string $transaction_id, string $description, Request $request): void
    {
        // Obtener la dirección IP y el agente de usuario
        $ipAddress = $request->ip();
        $userAgent = $request->header('User-Agent');

        // Inserta el log en la base de datos
        \DB::table('logs')->insert([
            'user_id' => $userId,
            'transaction_id' => $transaction_id,
            'description' => $description,
            'date' => now(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }

    /**
     * Obtener todas las posiciones con su información relacionada.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Obtener el empleado autenticado
        $employee = Auth::guard('employee')->user();
        $hierarchyLevel = $employee->position->hierarchy_level;
        $companyId = $employee->position->company_id;

        // Condicional basado en la jerarquía del empleado
        if ($hierarchyLevel === 0) {
            // Si el usuario tiene jerarquía 0, ver todas las posiciones de todas las empresas
            $positions = Position::with(['company', 'permissions'])
                ->withCount('employees')
                ->orderBy('name')
                ->get();
        } else {
            // Si el usuario tiene jerarquía mayor a 0, ver solo posiciones de su empresa y de jerarquía igual o mayor
            $positions = Position::with(['company', 'permissions'])
                ->where('company_id', $companyId)
                ->where('hierarchy_level', '>=', $hierarchyLevel)
                ->withCount('employees')
                ->orderBy('name')
                ->get();
        }

        // Transformar los datos de la posición para incluir información adicional
        $positions = $positions->map(function ($position) {
            return [
                'id' => $position->id,
                'name' => $position->name,
                'company_id' => $position->company_id,
                'company_name' => $position->company->name ?? 'N/A',
                'employees_count' => $position->employees_count,
                'hierarchy_level' => $position->hierarchy_level,
                'permissions' => $position->permissions,
            ];
        });

        return response()->json($positions);
    }

    /**
     * Crear una nueva posición.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Verificar permisos
        if (!$this->hasPermission('can_create_positions')) {
            return response()->json(['error' => 'No tienes permiso para crear posiciones.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company_id' => 'required|integer|exists:companies,id',
            'hierarchy_level' => 'required|integer|min:0'
        ], [
            'name.unique' => 'La compañía ya tiene un puesto con el mismo nombre.',
            'company_id.exists' => 'La compañía especificada no existe.',
            'hierarchy_level.min' => 'El nivel de jerarquía debe ser al menos 0.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $positionInCompany = Position::where('name', $request->name)
            ->where('company_id', $request->company_id)
            ->first();

        if ($positionInCompany) {
            return response()->json([
                'message' => 'La compañía ya tiene un puesto con el mismo nombre'
            ], 480);
        }

        $position = Position::create([
            'name' => $request->name,
            'company_id' => $request->company_id,
            'hierarchy_level' => $request->hierarchy_level
        ]);

        $position->load('company');

        // Registrar log
        $employee = Auth::guard('employee')->user();
        $transaction_id = 'create_position';
        $description = "Posición creada: {$position->name} en la empresa {$position->company->name}";
        $this->registerLog($employee->id, $transaction_id, $description, $request);

        return response()->json([
            'id' => $position->id,
            'name' => $position->name,
            'company_id' => $position->company_id,
            'company_name' => $position->company->name ?? 'N/A',
            'employees_count' => 0,
            'hierarchy_level' => $position->hierarchy_level,
        ], 201);
    }

    /**
     * Actualizar una posición existente.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Verificar permisos
        if (!$this->hasPermission('can_update_positions')) {
            return response()->json(['error' => 'No tienes permiso para actualizar posiciones.'], 403);
        }

        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        // Validar solo los campos presentes
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer|exists:companies,id',
            'hierarchy_level' => 'sometimes|required|integer|min:0'
        ], [
            'name.unique' => 'La compañía ya tiene un puesto con el mismo nombre.',
            'company_id.exists' => 'La compañía especificada no existe.',
            'hierarchy_level.min' => 'El nivel de jerarquía debe ser al menos 0.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Si se proporciona 'name' o 'company_id', verificar la unicidad del nombre dentro de la compañía correspondiente
        if ($request->has('name') || $request->has('company_id')) {
            $newName = $request->input('name', $position->name);
            $newCompanyId = $request->input('company_id', $position->company_id);

            $positionInCompany = Position::where('name', $newName)
                ->where('company_id', $newCompanyId)
                ->where('id', '!=', $position->id)
                ->first();

            if ($positionInCompany) {
                return response()->json([
                    'message' => 'La compañía ya tiene un puesto con el mismo nombre.'
                ], 480);
            }
        }

        // Guardar los cambios solamente en los campos proporcionados
        $fieldsToUpdate = $request->only(['name', 'company_id', 'hierarchy_level']);

        foreach ($fieldsToUpdate as $key => $value) {
            $position->$key = $value;
        }

        $position->save();

        $position->load('company');

        // Registrar log
        $employee = Auth::guard('employee')->user();
        $transaction_id = 'update_position';
        $description = "Posición actualizada de '{$position->getOriginal('name')}' a '{$position->name}' en la empresa {$position->company->name}";
        $this->registerLog($employee->id, $transaction_id, $description, $request);

        return response()->json([
            'id' => $position->id,
            'name' => $position->name,
            'company_id' => $position->company_id,
            'company_name' => $position->company->name ?? 'N/A',
            'employees_count' => $position->employees()->count(),
            'hierarchy_level' => $position->hierarchy_level,
        ]);
    }

    /**
     * Eliminar una posición existente.
     *
     * @param int $id
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id, Request $request)
    {
        // Verificar permisos
        if (!$this->hasPermission('can_delete_positions')) {
            return response()->json(['error' => 'No tienes permiso para eliminar posiciones.'], 403);
        }

        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        $positionName = $position->name;
        $companyName = $position->company->name ?? 'N/A';

        // Reasignar empleados a null
        Employee::where('position_id', $id)->update(['position_id' => null]);

        $position->delete();

        // Registrar log
        $employee = Auth::guard('employee')->user();
        $transaction_id = 'delete_position';
        $description = "Posición eliminada: $positionName de la empresa $companyName";
        $this->registerLog($employee->id, $transaction_id, $description, $request);

        return response()->json(['message' => 'Posición eliminada exitosamente.']);
    }

    /**
     * Obtener el conteo de empleados en una posición específica.
     *
     * @param int $id
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function counts($id, Request $request)
    {
        // Verificar permisos
        if (!$this->hasPermission('can_view_employee_counts')) {
            return response()->json(['error' => 'No tienes permiso para ver conteos de empleados.'], 403);
        }

        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        $employeesCount = Employee::where('position_id', $id)->count();

        return response()->json(['employees_count' => $employeesCount]);
    }
}
