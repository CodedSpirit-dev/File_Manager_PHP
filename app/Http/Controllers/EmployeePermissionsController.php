<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Permission;
use Illuminate\Support\Facades\Validator;

class EmployeePermissionsController extends Controller
{
    /**
     * Asignar permisos a un empleado.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id', // Verifica que el empleado existe
            'permissions' => 'required|array', // Verifica que 'permissions' es un array
            'permissions.*' => 'exists:permissions,id', // Cada permiso debe existir en la tabla permissions
        ]);

        // Si la validación falla, retornar errores
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Los datos proporcionados son inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Obtener el employee_id y los permisos seleccionados
        $employeeId = $request->input('employee_id');
        $permissions = $request->input('permissions');

        // Obtener el empleado usando Eloquent
        $employee = Employee::findOrFail($employeeId);

        // Asignar los permisos utilizando la relación Eloquent 'permissions'
        // Esto eliminará los permisos anteriores y asignará los nuevos
        $employee->permissions()->sync($permissions);

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos asignados exitosamente']);
    }

    /**
     * Desasignar todos los permisos de un empleado.
     *
     * @param int $employee_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($employee_id)
    {
        // Validar que el empleado existe
        $employee = Employee::findOrFail($employee_id);

        // Desasignar todos los permisos
        $employee->permissions()->detach();

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos desasignados exitosamente']);
    }
}
