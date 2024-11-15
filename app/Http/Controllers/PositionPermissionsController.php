<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Position;
use App\Models\Permission;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PositionPermissionsController extends Controller
{
    /**
     * Constructor para aplicar middleware de autenticación.
     */
    public function __construct()
    {
        $this->middleware('auth:employee');
    }

    /**
     * Registra una acción en la tabla de logs.
     *
     * @param int $userId
     * @param string $transaction_id Identificador de la transacción (e.g., 'assign_permissions_position')
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
     * Asignar permisos a una posición.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Obtener el empleado autenticado
        $employee = Auth::guard('employee')->user();

        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'position_id' => 'required|exists:positions,id', // Verifica que la posición existe
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

        // Obtener el position_id y los permisos seleccionados
        $positionId = $request->input('position_id');
        $permissions = $request->input('permissions');

        // Obtener la posición usando Eloquent
        $position = Position::findOrFail($positionId);

        // Asignar los permisos utilizando la relación Eloquent 'permissions'
        // Esto eliminará los permisos anteriores y asignará los nuevos
        $position->permissions()->sync($permissions);

        // Obtener las descripciones de los permisos asignados para la descripción
        $permissionDescriptions = Permission::whereIn('id', $permissions)->pluck('description')->toArray();
        $permissionList = implode(', ', $permissionDescriptions);

        // Registrar log
        $transaction_id = 'assign_permissions_position';
        $description = "Permisos asignados a la posición ID: {$position->id} - {$position->name}. Permisos asignados: {$permissionList}.";
        $this->registerLog($employee->id, $transaction_id, $description, $request);

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos asignados exitosamente a la posición']);
    }

    /**
     * Desasignar todos los permisos de una posición.
     *
     * @param int $position_id
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($position_id, Request $request)
    {
        // Obtener el empleado autenticado
        $employee = Auth::guard('employee')->user();

        // Validar que la posición existe
        $position = Position::findOrFail($position_id);

        // Obtener los permisos antes de desasignarlos para la descripción
        $previousPermissions = $position->permissions()->pluck('description')->toArray();
        $previousPermissionList = implode(', ', $previousPermissions);

        // Desasignar todos los permisos
        $position->permissions()->detach();

        // Registrar log
        $transaction_id = 'unassign_permissions_position';
        $description = "Permisos desasignados de la posición ID: {$position->id} - {$position->name}. Permisos desasignados: {$previousPermissionList}.";
        $this->registerLog($employee->id, $transaction_id, $description, $request);

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos desasignados exitosamente de la posición']);
    }
}
