<?php
// app/Http/Controllers/PositionController.php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Employee;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    /**
     * Muestra una lista de todas las posiciones con la información de la empresa y el conteo de empleados.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $positions = Position::with('company')
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        // Transformar los datos para incluir company_name y employees_count
        $positions = $positions->map(function ($position) {
            return [
                'id' => $position->id,
                'name' => $position->name,
                'company_id' => $position->company_id,
                'company_name' => $position->company->name ?? 'N/A',
                'employees_count' => $position->employees_count,
                'hierarchy_level' => $position->hierarchy_level,
            ];
        });

        return response()->json($positions);
    }

    /**
     * Almacena una nueva posición.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company_id' => 'required|integer|exists:companies,id',
            'hierarchy_level' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar si la compañía ya tiene un puesto con el mismo nombre
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

        // Cargar la relación con la empresa para incluir el nombre en la respuesta
        $position->load('company');

        return response()->json([
            'id' => $position->id,
            'name' => $position->name,
            'company_id' => $position->company_id,
            'company_name' => $position->company->name ?? 'N/A',
            'employees_count' => 0, // Al crearlo, no tiene empleados asociados
            'hierarchy_level' => $position->hierarchy_level,
        ]);
    }

    /**
     * Actualiza una posición existente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar si la compañía ya tiene un puesto con el mismo nombre, excluyendo el puesto actual
        $positionInCompany = Position::where('name', $request->name)
            ->where('company_id', $position->company_id)
            ->where('id', '!=', $position->id)
            ->first();

        if ($positionInCompany) {
            return response()->json([
                'message' => 'La compañía ya tiene un puesto con el mismo nombre'
            ], 480);
        }

        $position->name = $request->name;
        $position->save();

        // Cargar la relación con la empresa para incluir el nombre en la respuesta
        $position->load('company');

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
     * Elimina una posición y reasigna a los empleados.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        // Reasignar a los empleados: establecer position_id a null
        Employee::where('position_id', $id)->update(['position_id' => null]);

        // Eliminar la posición
        $position->delete();

        return response()->json(['message' => 'Posición eliminada exitosamente.']);
    }

    /**
     * Obtiene el conteo de empleados asociados a una posición.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function counts($id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        $employeesCount = Employee::where('position_id', $id)->count();

        return response()->json(['employees_count' => $employeesCount]);
    }
}
