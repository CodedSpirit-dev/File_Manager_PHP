<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Permission;

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
        $request->validate([
            'employee_id' => 'required|exists:employees,id', // Verifica que el empleado existe
            'permissions' => 'required|array', // Verifica que 'permissions' es un array
            'permissions.*' => 'exists:permissions,id', // Cada permiso debe existir en la tabla permissions
        ]);

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
}
