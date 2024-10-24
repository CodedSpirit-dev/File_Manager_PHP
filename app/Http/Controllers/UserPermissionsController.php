<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserPermissionsController extends Controller
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

        // Eliminar permisos anteriores del empleado si existen
        DB::table('user_permissions')->where('employee_id', $employeeId)->delete();

        // Insertar nuevos permisos asignados
        $data = [];
        foreach ($permissions as $permissionId) {
            $data[] = [
                'employee_id' => $employeeId,
                'permission_id' => $permissionId,
            ];
        }

        DB::table('user_permissions')->insert($data);

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos asignados exitosamente']);
    }
}
