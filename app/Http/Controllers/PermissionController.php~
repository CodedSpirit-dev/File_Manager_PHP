<?php

namespace App\Http\Controllers;

use App\Models\Permission; // Asegúrate de tener el modelo
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * Obtener todos los permisos con su ID, nombre y descripción.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Obtener todos los permisos desde la base de datos
        $permissions = Permission::select('id', 'name', 'description')->get();

        // Retornar los permisos en formato JSON
        return response()->json($permissions);
    }
}
