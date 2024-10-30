<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FolderController extends Controller
{
    public function getFilesInDirectory($directory)
    {
        // Obtener todos los archivos en el directorio especificado
        $files = Storage::files($directory);
        // Obtener todos los archivos incluyendo subdirectorios
        $allFiles = Storage::allFiles($directory);

        return response()->json([
            'files' => $files,
            'allFiles' => $allFiles,
        ]);
    }

    public function getDirectoriesInDirectory($directory)
    {
        // Obtener todos los directorios en el directorio especificado
        $directories = Storage::directories($directory);
        // Obtener todos los directorios incluyendo subdirectorios
        $allDirectories = Storage::allDirectories($directory);

        return response()->json([
            'directories' => $directories,
            'allDirectories' => $allDirectories,
        ]);
    }

    public function createDirectory(Request $request)
    {
        $directory = $request->input('directory');

        if (Storage::makeDirectory($directory)) {
            return response()->json(['message' => 'Directory created successfully.'], 201);
        }

        return response()->json(['error' => 'Failed to create directory.'], 500);
    }

    public function deleteDirectory($directory)
    {
        if (Storage::deleteDirectory($directory)) {
            return response()->json(['message' => 'Directory deleted successfully.'], 200);
        }

        return response()->json(['error' => 'Failed to delete directory.'], 500);
    }
}
