<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileManagerController extends Controller
{
    public function index(Request $request)
    {
        $path = $request->input('path', 'public');

        // Obtener carpetas y archivos en la ruta especificada
        $directories = Storage::disk('local')->directories($path);
        $files = Storage::disk('local')->files($path);

        return response()->json([
            'directories' => $directories,
            'files' => $files,
            'path' => $path
        ]);
    }


    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:2048',
        ]);

        $path = $request->file('file')->store('public');

        return response()->json(['message' => 'Archivo subido exitosamente.', 'path' => $path]);
    }

    public function delete($filename)
    {
        Storage::disk('local')->delete('public/'.$filename);

        return response()->json(['message' => 'Archivo eliminado.']);
    }

    public function createFolder(Request $request)
    {
        $request->validate([
            'folder_name' => 'required|string',
            'path' => 'nullable|string' // Ruta opcional
        ]);

        // Determinar la ruta de la carpeta
        $path = $request->input('path', 'public') . '/' . $request->input('folder_name');

        // Crear la carpeta
        if (!Storage::disk('local')->exists($path)) {
            Storage::disk('local')->makeDirectory($path);
            return response()->json(['message' => 'Carpeta creada exitosamente.']);
        } else {
            return response()->json(['message' => 'La carpeta ya existe.'], 400);
        }
    }

}
