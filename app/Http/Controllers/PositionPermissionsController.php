<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Position;
use App\Models\Permission;
use Illuminate\Support\Facades\Validator;

class PositionPermissionsController extends Controller
{
    /**
     * Asignar permisos a una posición.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
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

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos asignados exitosamente a la posición']);
    }

    /**
     * Desasignar todos los permisos de una posición.
     *
     * @param int $position_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($position_id)
    {
        // Validar que la posición existe
        $position = Position::findOrFail($position_id);

        // Desasignar todos los permisos
        $position->permissions()->detach();

        // Retornar respuesta exitosa
        return response()->json(['message' => 'Permisos desasignados exitosamente de la posición']);
    }
}
