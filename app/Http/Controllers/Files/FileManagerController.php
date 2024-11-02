<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use ZipArchive;

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
        $employee = Auth::guard('employee')->user();
        $path = $request->input('path', 'public');

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        // Verificar permisos
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
     * Sube un nuevo archivo a una ruta específica sin cambiar el nombre.
     */
    public function upload(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$employee->hasPermission('can_create_files')) {
            return response()->json(['error' => 'No tienes permiso para subir archivos.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // Máximo 10MB
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

        // Subir el archivo a la ruta especificada sin cambiar el nombre
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $filePath = $file->storeAs($path, $originalName, 'local'); // Usar storeAs para mantener el nombre original
            return response()->json(['message' => 'Archivo subido exitosamente.', 'path' => $filePath]);
        }

        return response()->json(['error' => 'No se proporcionó ningún archivo.'], 400);
    }

    /**
     * Sube una carpeta como un directorio.
     */

    public function uploadDirectory(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos correctamente
        if (
            !$employee->hasPermission('can_create_folders') ||
            !$employee->hasPermission('can_create_files')
        ) {
            return response()->json(['error' => 'No tienes permiso para crear archivos o carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'files' => 'required|array',
            'files.*' => 'required|file|max:10240', // Máximo 10MB por archivo
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

        // Manejar cada archivo
        foreach ($request->file('files') as $file) {
            // Obtener la ruta relativa desde el nombre original del archivo
            $relativePath = $file->getClientOriginalName();

            // Subir el archivo a la ruta completa sin cambiar el nombre
            $file->storeAs($path, $relativePath, 'local');
        }

        return response()->json(['message' => 'Carpeta subida exitosamente.', 'path' => $path]);
    }

    /**
     * Sube una carpeta como un archivo zip y la extrae en la ruta especificada.
     */
    public function uploadFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$employee->hasPermission('can_create_folders')) {
            return response()->json(['error' => 'No tienes permiso para subir carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:zip|max:10240', // Solo archivos zip, máximo 10MB
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

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $zipPath = $file->store($path, 'local'); // Almacenar el archivo zip
            $fullPath = Storage::disk('local')->path($zipPath);

            // Extraer el archivo zip
            try {
                $zip = new ZipArchive;
                if ($zip->open($fullPath) === TRUE) {
                    $zip->extractTo(Storage::disk('local')->path($path));
                    $zip->close();

                    // Eliminar el archivo zip después de extraerlo
                    Storage::disk('local')->delete($zipPath);

                    return response()->json(['message' => 'Carpeta subida y extraída exitosamente.']);
                } else {
                    return response()->json(['error' => 'No se pudo abrir el archivo zip.'], 400);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error al extraer el archivo zip.', 'details' => $e->getMessage()], 500);
            }
        }

        return response()->json(['error' => 'No se proporcionó ningún archivo.'], 400);
    }

    /**
     * Elimina un archivo específico en una ruta dada.
     */
    public function delete(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
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
     * Elimina una carpeta específica en una ruta dada.
     */
    public function deleteFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$employee->hasPermission('can_delete_folders')) {
            return response()->json(['error' => 'No tienes permiso para eliminar carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'folder_name' => 'required|string',
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

        $folderPath = rtrim($path, '/') . '/' . ltrim($folderName, '/');

        if (!Storage::disk('local')->exists($folderPath)) {
            return response()->json(['error' => 'La carpeta no existe.'], 404);
        }

        // Eliminar la carpeta de forma recursiva
        Storage::disk('local')->deleteDirectory($folderPath);

        return response()->json(['message' => 'Carpeta eliminada exitosamente.']);
    }

    /**
     * Crea una nueva carpeta en una ruta específica.
     */
    public function createFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
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

        // Crear la carpeta
        Storage::disk('local')->makeDirectory($newFolderPath);

        return response()->json(['message' => 'Carpeta creada exitosamente.', 'path' => $newFolderPath]);
    }

    /**
     * Actualiza (renombra) una carpeta específica.
     */
    public function updateFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
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
