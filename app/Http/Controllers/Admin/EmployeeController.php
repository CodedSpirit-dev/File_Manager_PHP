<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Position;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:employee'); // Aplicar middleware al guard 'employee'
    }

    /**
     * Mostrar el perfil del empleado autenticado.
     */
    public function show()
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Cargar relaciones necesarias
        $employee->load('position.company');

        $profileData = [
            'first_name' => $employee->first_name,
            'last_name_1' => $employee->last_name_1,
            'last_name_2' => $employee->last_name_2,
            'phone_number' => $employee->phone_number,
            'username' => $employee->username,
            'position' => $employee->position ? $employee->position->name : 'Sin asignar',
            'company' => $employee->position && $employee->position->company ? $employee->position->company->name : 'Sin asignar',
            'registered_at' => $employee->registered_at->format('Y-m-d H:i:s'),
            'last_login_at' => $employee->last_login_at ? $employee->last_login_at->format('Y-m-d H:i:s') : 'Nunca'
        ];

        return response()->json($profileData);
    }

    /**
     * Mostrar una lista de empleados de acuerdo con la jerarquía y empresa del usuario autenticado.
     */
    public function index()
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Verificar si el empleado tiene permiso para ver compañeros de la empresa
        if (!$employee->hasPermission('can_view_company_users')) {
            return response()->json(['error' => 'Permiso denegado'], 403);
        }

        // Si el nivel de jerarquía es 0, obtener todos los empleados sin restricciones
        if ($employee->position->hierarchy_level === 0) {
            $employees = Employee::with('position.company')->get();
        } else {
            // Filtrar empleados solo dentro de la misma empresa y jerarquía igual o menor
            $companyId = $employee->position->company_id;
            $hierarchyLevel = $employee->position->hierarchy_level;

            $employees = Employee::with('position.company')
                ->whereHas('position', function ($query) use ($companyId, $hierarchyLevel) {
                    $query->where('company_id', $companyId)
                        ->where('hierarchy_level', '>=', $hierarchyLevel);
                })
                ->get();
        }

        return response()->json($employees);
    }



    /**
     * Almacenar un nuevo empleado en la base de datos.
     */
    public function store(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee->hasPermission('can_create_users')) {
            return response()->json(['error' => 'Permiso denegado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:15',
            'position_id' => 'required|integer|exists:positions,id',
            'username' => 'required|string|unique:employees,username|max:255',
            'password' => 'required|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $newEmployee = new Employee();
        $newEmployee->first_name = $request->first_name;
        $newEmployee->last_name_1 = $request->last_name_1;
        $newEmployee->last_name_2 = $request->last_name_2;
        $newEmployee->phone_number = $request->phone_number;
        $newEmployee->position_id = $request->position_id;
        $newEmployee->username = $request->username;
        $newEmployee->password = Hash::make($request->password);
        $newEmployee->registered_at = now();
        $newEmployee->save();

        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'create_employee',
            'description' => "Empleado '{$newEmployee->username}' creado",
        ]);

        return response()->json(['id' => $newEmployee->id]);
    }

    /**
     * Actualizar un empleado específico en la base de datos.
     */
    public function update(Request $request, $id)
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee->hasPermission('can_update_users')) {
            return response()->json(['error' => 'Permiso denegado'], 403);
        }

        // No permitir que el empleado edite a sí mismo
        if ($employee->id == $id) {
            return response()->json(['error' => 'No se puede editar a sí mismo'], 403);
        }

        $updateEmployee = Employee::find($id);

        if (!$updateEmployee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        // No permitir editar empleados con la misma jerarquía o jerarquía menor, excepto si el nivel de jerarquía es 0
        if ($employee->position->hierarchy_level !== 0 && $updateEmployee->position->hierarchy_level <= $employee->position->hierarchy_level) {
            return response()->json(['error' => 'No tiene permiso para editar a este empleado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:15',
            'position_id' => 'required|integer|exists:positions,id',
            'username' => 'required|string|unique:employees,username,' . $id . '|max:255',
            'password' => 'nullable|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $updateEmployee->first_name = $request->first_name;
        $updateEmployee->last_name_1 = $request->last_name_1;
        $updateEmployee->last_name_2 = $request->last_name_2;
        $updateEmployee->phone_number = $request->phone_number;
        $updateEmployee->username = $request->username;
        $updateEmployee->position_id = $request->position_id;

        if ($request->filled('password')) {
            $updateEmployee->password = Hash::make($request->password);
        }

        $updateEmployee->save();

        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'update_employee',
            'description' => "Empleado '{$updateEmployee->username}' actualizado",
        ]);

        return response()->json(['message' => 'Empleado actualizado con éxito']);
    }


    /**
     * Eliminar un empleado.
     */
    public function destroy($id)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar el permiso para eliminar usuarios
        if (!$employee->hasPermission('can_delete_users')) {
            return response()->json(['error' => 'Permiso denegado'], 403);
        }

        $deleteEmployee = Employee::find($id);

        // Verificar si el empleado a eliminar existe
        if (!$deleteEmployee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        // Impedir que el usuario se elimine a sí mismo
        if ($employee->id === $deleteEmployee->id) {
            return response()->json(['error' => 'No puedes eliminar tu propio perfil'], 403);
        }

        // Verificar jerarquía: el usuario solo puede eliminar empleados de jerarquía inferior
        if ($deleteEmployee->position->hierarchy_level <= $employee->position->hierarchy_level) {
            return response()->json(['error' => 'No tienes permisos para eliminar este empleado debido a la jerarquía'], 403);
        }

        $deleteEmployee->delete();

        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'delete_employee',
            'description' => "Empleado '{$deleteEmployee->username}' eliminado",
        ]);

        return response()->json(['message' => 'Empleado eliminado con éxito']);
    }

}
