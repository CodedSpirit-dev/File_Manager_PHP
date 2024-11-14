<?php
// app/Http/Controllers/PositionController.php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Employee;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PositionController extends Controller
{
    public function index()
    {
        // Obtener el empleado autenticado
        $employee = auth()->user();
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


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company_id' => 'required|integer|exists:companies,id',
            'hierarchy_level' => 'required|integer|min:0'
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

        return response()->json([
            'id' => $position->id,
            'name' => $position->name,
            'company_id' => $position->company_id,
            'company_name' => $position->company->name ?? 'N/A',
            'employees_count' => 0,
            'hierarchy_level' => $position->hierarchy_level,
        ]);
    }

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

    public function destroy($id)
    {
        $position = Position::find($id);

        if (!$position) {
            return response()->json(['message' => 'Posición no encontrada.'], 404);
        }

        Employee::where('position_id', $id)->update(['position_id' => null]);

        $position->delete();

        return response()->json(['message' => 'Posición eliminada exitosamente.']);
    }

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
