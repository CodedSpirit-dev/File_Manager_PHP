<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Company;

class CompanyController extends Controller
{
    /**
     * Muestra una lista de todas las compañías.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $companies = Company::withCount('employees')->orderBy("name", "asc")->get();
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
        $validationRules = [
            'name' => 'required|string|max:255|unique:companies,name',
        ];

        // Mensajes de error personalizados
        $customMessages = [
            'name.unique' => 'El nombre de la empresa ya está en uso. Por favor, elige otro.',
            'name.required' => 'El nombre es obligatorio.',
            // Puedes agregar más mensajes personalizados si lo deseas
        ];

        $validator = Validator::make($request->all(), $validationRules, $customMessages);

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
     * Solo empleados con jerarquía mayor a 1 pueden editar empresas.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $employee = auth()->user();

        // Verificar si el empleado tiene jerarquía mayor a 1
        if ($employee->hierarchy >= 1) {
            return response()->json(['message' => 'No tienes permiso para editar empresas.'], 403);
        }

        $company = Company::findOrFail($id);

        $validationRules = [
            'name' => 'required|string|max:255|unique:companies,name,' . $company->id,
        ];

        $validator = Validator::make($request->all(), $validationRules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldName = $company->name;
        $company->name = $request->name;
        $company->save();

        $oldFolderPath = 'public/' . $oldName;
        $newFolderPath = 'public/' . $company->name;

        // Renombrar carpeta de la compañía si existe
        if (Storage::exists($oldFolderPath)) {
            Storage::move($oldFolderPath, $newFolderPath);
        } else {
            // Si la carpeta no existe, crearla
            Storage::makeDirectory($newFolderPath);
        }

        return response()->json([
            'message' => 'Compañía actualizada exitosamente.',
            'company' => $company,
        ]);
    }

    /**
     * Elimina una compañía de la base de datos.
     * Solo empleados con jerarquía 0 pueden eliminar empresas.
     * La empresa SGI no puede ser eliminada.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $employee = auth()->user();

        // Verificar si el empleado tiene jerarquía 0
        if ($employee->hierarchy != 0) {
            return response()->json(['message' => 'No tienes permiso para eliminar empresas.'], 403);
        }

        $company = Company::findOrFail($id);

        // No permitir eliminar la empresa SGI
        if ($company->name === 'SGI') {
            return response()->json(['message' => 'No se debe eliminar SGI.'], 403);
        }

        $companyFolderPath = 'public/' . $company->name;

        // Eliminar carpeta de la compañía si existe
        if (Storage::exists($companyFolderPath)) {
            Storage::deleteDirectory($companyFolderPath);
        }

        $company->delete();

        return response()->json(['message' => 'Compañía eliminada exitosamente.']);
    }

    public function getCounts($id)
    {
        $company = Company::withCount('positions')->with(['positions' => function ($query) {
            $query->withCount('employees');
        }])->findOrFail($id);

        // Contar todos los empleados asociados a las posiciones de la empresa
        $employeesCount = $company->positions->sum('employees_count');

        return response()->json([
            'positions_count' => $company->positions_count,
            'employees_count' => $employeesCount,
        ]);
    }

}
