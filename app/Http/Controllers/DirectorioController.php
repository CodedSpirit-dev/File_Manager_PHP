<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Directorio; // Asegúrate de que el modelo Directorio exista

class DirectorioController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validar los datos del request
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:40',
            'apellido' => 'required|string|max:40',
        ]);

        // Crear un nuevo registro en la tabla Directorio
        $directorio = new Directorio();
        $directorio->nombre = $validatedData['nombre'];
        $directorio->apellido = $validatedData['apellido'];
        $directorio->save(); // Guarda el registro en la base de datos

        // Retornar una respuesta exitosa o redireccionar
        return response()->json(['message' => 'Registro creado exitosamente'], 201);
    }
}
