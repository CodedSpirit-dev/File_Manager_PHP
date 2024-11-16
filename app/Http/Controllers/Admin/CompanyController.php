<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Company;
use App\Models\Log;

class CompanyController extends Controller
{
    /**
     * Muestra una lista de todas las compañías.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $employee = auth()->user();
        $hierarchyLevel = $employee->position->hierarchy_level;
        $companyId = $employee->position->company_id;

        if ($hierarchyLevel === 0) {
            // Si el usuario tiene jerarquía 0, ver todas las compañías
            $companies = Company::withCount(['employees', 'positions'])
                ->orderBy("name", "asc")
                ->get();
        } else {
            // Si el usuario tiene jerarquía mayor a 0, solo ver su compañía
            $companies = Company::where('id', $companyId)
                ->withCount(['employees', 'positions'])
                ->orderBy("name", "asc")
                ->get();
        }

        return response()->json($companies);
    }

    /**
     * Muestra el formulario de registro de compañías.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        return view('admin.companies.create');
    }

    /**
     * Almacena una nueva compañía en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $employee = auth()->user();

        // Verificar si el empleado tiene permiso para crear empresas
        if (!$employee->position->permissions()->where('name', 'can_create_companies')->exists()) {
            return response()->json(['message' => 'No tienes permiso para crear empresas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:companies,name',
        ], [
            'name.unique' => 'El nombre de la empresa ya está en uso. Por favor, elige otro.',
            'name.required' => 'El nombre es obligatorio.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Crear la nueva compañía
        $company = new Company();
        $company->name = $request->name;
        $company->save();

        // Crear la carpeta para la compañía
        $companyFolderPath = 'public/' . $company->name;
        if (!Storage::exists($companyFolderPath)) {
            Storage::makeDirectory($companyFolderPath);
        }

        // Registrar en logs la creación de la compañía
        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'create_company',
            'description' => "Creación de la compañía '{$company->name}'",
            'date' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json([
            'message' => 'Compañía registrada y carpeta creada exitosamente.',
            'company' => $company,
        ], 201);
    }

    /**
     * Muestra el formulario para editar una compañía.
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function edit($id)
    {
        $company = Company::findOrFail($id);
        return view('admin.companies.edit', compact('company'));
    }

    /**
     * Actualiza una compañía en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $employee = auth()->user();

        // Verificar si el empleado tiene permiso para actualizar empresas
        if (!$employee->position->permissions()->where('name', 'can_update_companies')->exists()) {
            return response()->json(['message' => 'No tienes permiso para editar empresas.'], 403);
        }

        $company = Company::findOrFail($id);
        $oldName = $company->name;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:companies,name,' . $company->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company->name = $request->name;
        $company->save();

        // Renombrar carpeta de la compañía si existe
        $oldFolderPath = 'public/' . $oldName;
        $newFolderPath = 'public/' . $company->name;

        if (Storage::exists($oldFolderPath)) {
            Storage::move($oldFolderPath, $newFolderPath);
        } else {
            Storage::makeDirectory($newFolderPath);
        }

        // Registrar en logs la actualización de la compañía
        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'update_company',
            'description' => "Actualización de la compañía de '{$oldName}' a '{$company->name}'",
            'date' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        return response()->json([
            'message' => 'Compañía actualizada exitosamente.',
            'company' => $company,
        ]);
    }

    /**
     * Elimina una compañía de la base de datos.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $employee = auth()->user();

        // Verificar si el empleado tiene permiso para eliminar empresas
        if (!$employee->position->permissions()->where('name', 'can_delete_companies')->exists()) {
            return response()->json(['message' => 'No tienes permiso para eliminar empresas.'], 403);
        }

        $company = Company::findOrFail($id);

        // No permitir eliminar la empresa SGI
        if ($company->name === 'VSP') {
            return response()->json(['message' => 'No se debe eliminar VSP.'], 403);
        }

        $companyFolderPath = 'public/' . $company->name;

        if (Storage::exists($companyFolderPath)) {
            Storage::deleteDirectory($companyFolderPath);
        }

        $company->delete();

        // Registrar en logs la eliminación de la compañía
        Log::create([
            'user_id' => $employee->id,
            'transaction_id' => 'delete_company',
            'description' => "Eliminación de la compañía '{$company->name}'",
            'date' => now(),
            'ip_address' => request()->ip(), // Usando helper global
            'user_agent' => request()->header('User-Agent'),
        ]);

        return response()->json(['message' => 'Compañía eliminada exitosamente.']);
    }

    /**
     * Obtiene los conteos de posiciones y empleados para una compañía específica.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCounts($id)
    {
        $company = Company::withCount('positions')->with(['positions' => function ($query) {
            $query->withCount('employees');
        }])->findOrFail($id);

        $employeesCount = $company->positions->sum('employees_count');

        return response()->json([
            'positions_count' => $company->positions_count,
            'employees_count' => $employeesCount,
        ]);
    }
}
