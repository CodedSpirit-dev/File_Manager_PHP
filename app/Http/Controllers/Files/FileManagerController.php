<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileManagerController extends Controller
{
    /**
     * Constructor para aplicar middleware de autenticación.
     */
    public function __construct()
    {
        $this->middleware('auth:employee'); // Usar el guard 'employee'
    }

    /**
     * Muestra la lista de carpetas y archivos en una ruta específica.
     */
    public function index(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'
        $path = $request->input('path', 'public');

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        // Verificar permisos (ajusta según tus necesidades)
        if (!$employee->hasPermission('can_read_folders') || !$employee->hasPermission('can_read_files')) {
            return response()->json(['error' => 'No tienes permiso para ver los archivos o carpetas.'], 403);
        }

        // Obtener las carpetas y archivos en la ruta actual
        $directories = Storage::disk('local')->directories($path);
        $files = Storage::disk('local')->files($path);

        return response()->json([
            'directories' => $directories,
            'files' => $files,
            'path' => $path
        ]);
    }

    /**
     * Sube un nuevo archivo a una ruta específica.
     */
    public function upload(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'

        // Validar permisos
        if (!$employee->hasPermission('can_create_files')) {
            return response()->json(['error' => 'No tienes permiso para subir archivos.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:2048',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->input('path');

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        // Subir el archivo a la ruta especificada
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store($path, 'local'); // Usar el disco 'local'

            return response()->json(['message' => 'Archivo subido exitosamente.', 'path' => $filePath]);
        }

        return response()->json(['error' => 'No se proporcionó ningún archivo.'], 400);
    }

    /**
     * Elimina un archivo específico en una ruta dada.
     */
    public function delete(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'

        // Validar permisos
        if (!$employee->hasPermission('can_delete_files')) {
            return response()->json(['error' => 'No tienes permiso para eliminar archivos.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $path = $request->input('path');

        // Validar la ruta
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $filePath = rtrim($path, '/') . '/' . ltrim($filename, '/');

        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['error' => 'El archivo no existe.'], 404);
        }

        Storage::disk('local')->delete($filePath);

        return response()->json(['message' => 'Archivo eliminado exitosamente.']);
    }

    /**
     * Crea una nueva carpeta en una ruta específica.
     */
    public function createFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'

        // Validar permisos
        if (!$employee->hasPermission('can_create_folders')) {
            return response()->json(['error' => 'No tienes permiso para crear carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'folder_name' => 'required|string|max:255',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $folderName = $request->input('folder_name');
        $path = $request->input('path');

        // Validar la ruta
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $newFolderPath = rtrim($path, '/') . '/' . ltrim($folderName, '/');

        if (Storage::disk('local')->exists($newFolderPath)) {
            return response()->json(['error' => 'La carpeta ya existe.'], 400);
        }

        Storage::disk('local')->makeDirectory($newFolderPath);

        return response()->json(['message' => 'Carpeta creada exitosamente.', 'path' => $newFolderPath]);
    }

    /**
     * Actualiza el nombre de una carpeta específica.
     */
    public function updateFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'

        // Validar permisos
        if (!$employee->hasPermission('can_update_folders')) {
            return response()->json(['error' => 'No tienes permiso para editar carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'old_folder_name' => 'required|string',
            'new_folder_name' => 'required|string|max:255',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldFolderName = $request->input('old_folder_name');
        $newFolderName = $request->input('new_folder_name');
        $path = $request->input('path');

        // Validar la ruta
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $oldPath = rtrim($path, '/') . '/' . ltrim($oldFolderName, '/');
        $newPath = rtrim($path, '/') . '/' . ltrim($newFolderName, '/');

        if (!Storage::disk('local')->exists($oldPath)) {
            return response()->json(['error' => 'La carpeta original no existe.'], 404);
        }

        if (Storage::disk('local')->exists($newPath)) {
            return response()->json(['error' => 'La nueva carpeta ya existe.'], 400);
        }

        Storage::disk('local')->move($oldPath, $newPath);

        return response()->json(['message' => 'Carpeta renombrada exitosamente.', 'path' => $newPath]);
    }

    /**
     * Validar que la ruta proporcionada no contenga patrones de Path Traversal.
     */
    private function isValidPath($path)
    {
        // Evitar rutas que suban a directorios superiores
        return !Str::contains($path, ['..', './', '../']);
    }
}
