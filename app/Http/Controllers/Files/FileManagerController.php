<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Normaliza una ruta eliminando redundancias y asegurando que no suba a directorios superiores.
     */
    private function normalizePath($path)
    {
        $path = rtrim(preg_replace('#/+#', '/', $path), '/'); // Eliminar barras redundantes
        return Str::startsWith($path, 'public') ? $path : "public/$path"; // Asegurar prefijo 'public'
    }

    /**
     * Obtiene la jerarquía y empresa del usuario autenticado.
     */
    public function fetchHierarchyAndCompany()
    {
        $employee = Auth::guard('employee')->user();

        $companyName = $employee->company->name ?? null;
        $hierarchyLevel = $employee->hierarchy ?? null;

        if (is_null($companyName) || is_null($hierarchyLevel)) {
            Log::warning('No se pudo obtener la empresa o nivel de jerarquía del usuario: ' . $employee->id);
            return response()->json(['error' => 'No se pudo obtener la empresa o nivel de jerarquía del usuario.'], 500);
        }

        // Ajustar la ruta: Cualquier jerarquía mayor o igual a 1 redirige a la carpeta de la empresa
        $path = $this->normalizePath("public/$companyName"); // Ruta directa a la carpeta de la empresa

        return response()->json([
            'hierarchy_level' => $hierarchyLevel,
            'company_name' => $companyName,
            'redirect_path' => $path,
        ]);
    }

    /**
     * Renombra un archivo o carpeta.
     */
    /**
     * Renombra un archivo o carpeta.
     */
    public function renameItem(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$this->hasPermission('can_rename_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para renombrar archivos o carpetas.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'old_name' => 'required|string|max:255',
            'new_name' => 'required|string|max:255',
            'path' => 'required|string',
            'type' => 'required|in:file,folder',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldName = $request->input('old_name');
        $newName = $request->input('new_name');
        $path = $this->normalizePath($request->input('path'));
        $type = $request->input('type');

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        // Determinar las rutas completas
        $oldPath = rtrim($path, '/') . '/' . ltrim($oldName, '/');
        $newPath = rtrim($path, '/') . '/' . ltrim($newName, '/');

        // Verificar existencia del elemento original
        if (!Storage::disk('local')->exists($oldPath)) {
            return response()->json(['error' => "El elemento original '$oldName' no existe."], 404);
        }

        // Verificar si ya existe un elemento con el nuevo nombre
        if (Storage::disk('local')->exists($newPath)) {
            return response()->json(['error' => "Ya existe un elemento con el nombre '$newName' en esta ubicación."], 400);
        }

        try {
            Storage::disk('local')->move($oldPath, $newPath);
        } catch (\Exception $e) {
            Log::error("Error al renombrar elemento: " . $e->getMessage());
            return response()->json(['error' => 'Error al renombrar el elemento.'], 500);
        }

        // Mapeo de tipo a texto y adjetivo en español
        $typeTextMap = [
            'file' => ['Archivo', 'renombrado'],
            'folder' => ['Carpeta', 'renombrada'],
        ];

        // Obtener el texto y adjetivo correspondiente al tipo
        $typeText = $typeTextMap[$type][0] ?? 'Elemento';
        $typeAdjective = $typeTextMap[$type][1] ?? 'renombrado';

        // Registrar log
        $transactionId = $type === 'file' ? 'rename_file' : 'rename_folder';
        $description = "$typeText renombrado de '$oldName' a '$newName' en '$path'";
        $this->registerLog($employee->id, $transactionId, $description, $request);

        // Responder con éxito usando el texto en español con concordancia de género
        return response()->json([
            'message' => "$typeText $typeAdjective exitosamente.",
            'old_path' => $oldPath,
            'new_path' => $newPath
        ], 200);
    }

    /**
     * Muestra la lista de carpetas y archivos en una ruta específica.
     */
    public function index(Request $request)
    {
        $employee = Auth::guard('employee')->user();
        $requestedPath = $this->normalizePath($request->input('path', 'public'));

        $companyName = $employee->company->name ?? null;
        $hierarchyLevel = $employee->hierarchy ?? null;

        if (is_null($companyName) || is_null($hierarchyLevel)) {
            return response()->json(['error' => 'No se pudo obtener la empresa o nivel de jerarquía del usuario.'], 500);
        }

        $basePath = $this->normalizePath($hierarchyLevel <= 1 ? "public/$companyName" : "public/$companyName/{$employee->username}");

        if (!$this->isWithinBasePath($requestedPath, $basePath)) {
            return response()->json(['error' => 'No tienes permiso para acceder a esta ruta.'], 403);
        }

        $directories = Storage::disk('local')->directories($requestedPath);
        $files = Storage::disk('local')->files($requestedPath);

        return response()->json([
            'directories' => $directories,
            'files' => $files,
            'path' => $requestedPath
        ]);
    }

    /**
     * Verificar si el camino solicitado está dentro de la ruta base permitida para el usuario.
     */
    private function isWithinBasePath($requestedPath, $basePath)
    {
        $requestedRealPath = realpath(Storage::disk('local')->path($this->normalizePath($requestedPath)));
        $baseRealPath = realpath(Storage::disk('local')->path($this->normalizePath($basePath)));

        return str_starts_with($requestedRealPath, $baseRealPath);
    }

    /**
     * Sube un nuevo archivo a una ruta específica sin cambiar el nombre.
     */
    public function upload(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_upload_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para subir archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $this->normalizePath($request->input('path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $filePath = "$path/$originalName";

            if (!$overwrite && Storage::disk('local')->exists($filePath)) {
                return response()->json(['error' => "El archivo '$originalName' ya existe."], 400);
            }

            // Si overwrite es true y el archivo existe, eliminarlo
            if ($overwrite && Storage::disk('local')->exists($filePath)) {
                Storage::disk('local')->delete($filePath);
            }

            $file->storeAs($path, $originalName, 'local');

            // Registrar log
            $this->registerLog($employee->id, 'upload_file', "Archivo subido: $originalName a $path", $request);

            return response()->json(['message' => 'Archivo subido exitosamente.', 'path' => $filePath]);
        }

        return response()->json(['error' => 'No se proporcionó ningún archivo.'], 400);
    }


    /**
     * Sube una carpeta completa, incluyendo subcarpetas y archivos.
     */
    public function uploadDirectory(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_upload_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para subir carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'files.*' => 'required|file|max:10240',
            'path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $this->normalizePath($request->input('path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        if ($request->hasFile('files')) {
            $files = $request->file('files');
            foreach ($files as $file) {
                // Obtener la ruta relativa del archivo
                $relativePath = $file->getClientOriginalName();

                // En caso de que se envíe 'files[]' en lugar de 'files[0]', usar 'getClientOriginalName' no devolverá el path completo.
                // Por lo tanto, necesitamos obtener el nombre original del archivo incluyendo su ruta relativa.

                $fullPath = $file->getClientOriginalName(); // Esto incluye el webkitRelativePath
                $destinationPath = $this->normalizePath($path . '/' . $fullPath);

                if (!$this->isValidPath($destinationPath)) {
                    return response()->json(['error' => 'Ruta inválida en uno de los archivos.'], 400);
                }

                // Verificar si el archivo ya existe
                if (!$overwrite && Storage::disk('local')->exists($destinationPath)) {
                    return response()->json(['error' => "El archivo '$fullPath' ya existe."], 400);
                }

                // Si overwrite es true y el archivo existe, eliminarlo
                if ($overwrite && Storage::disk('local')->exists($destinationPath)) {
                    Storage::disk('local')->delete($destinationPath);
                }

                // Crear los directorios necesarios
                $directory = pathinfo($destinationPath, PATHINFO_DIRNAME);
                if (!Storage::disk('local')->exists($directory)) {
                    Storage::disk('local')->makeDirectory($directory, 0755, true);
                }

                // Almacenar el archivo en la ruta correcta
                Storage::disk('local')->putFileAs($directory, $file, $file->getClientOriginalName());
            }

            // Registrar log
            $this->registerLog($employee->id, 'upload_directory', "Carpeta subida a $path", $request);

            return response()->json(['message' => 'Carpeta subida exitosamente.']);
        }

        return response()->json(['error' => 'No se proporcionaron archivos.'], 400);
    }

    /**
     * Sube una carpeta como un archivo zip y la extrae en la ruta especificada.
     */
    public function uploadFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (
            !$this->hasPermission('can_upload_files_and_folders') ||
            !$this->hasPermission('can_create_folders')
        ) {
            return response()->json(['error' => 'No tienes permiso para subir carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:zip|max:10240',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $this->normalizePath($request->input('path'));

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $zipPath = $file->store($path, 'local');
            $fullPath = Storage::disk('local')->path($zipPath);

            try {
                $zip = new ZipArchive;
                if ($zip->open($fullPath) === TRUE) {
                    $zip->extractTo(Storage::disk('local')->path($path));
                    $zip->close();
                    Storage::disk('local')->delete($zipPath);

                    // Registrar log
                    $this->registerLog($employee->id, 'upload_folder', "Carpeta subida y extraída: {$file->getClientOriginalName()} a $path", $request);

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

        if (!$this->hasPermission('can_delete_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para eliminar archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $path = $this->normalizePath($request->input('path'));

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $filePath = "$path/$filename";

        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['error' => 'El archivo no existe.'], 404);
        }

        Storage::disk('local')->delete($filePath);

        // Registrar log
        $this->registerLog($employee->id, 'delete_file', "Archivo eliminado: $filename de $path", $request);

        return response()->json(['message' => 'Archivo eliminado exitosamente.']);
    }

    /**
     * Elimina una carpeta específica en una ruta dada.
     */
    public function deleteFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_delete_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para eliminar carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'folder_name' => 'required|string',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $folderName = $request->input('folder_name');
        $path = $this->normalizePath($request->input('path'));

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $folderPath = "$path/$folderName";

        if (!Storage::disk('local')->exists($folderPath)) {
            return response()->json(['error' => 'La carpeta no existe.'], 404);
        }

        Storage::disk('local')->deleteDirectory($folderPath);

        // Registrar log
        $this->registerLog($employee->id, 'delete_folder', "Carpeta eliminada: $folderName de $path", $request);

        return response()->json(['message' => 'Carpeta eliminada exitosamente.']);
    }

    /**
     * Crea una nueva carpeta en una ruta específica.
     */
    public function createFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_create_folders')) {
            return response()->json(['error' => 'No tienes permiso para crear carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'folder_name' => 'required|string|max:255',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $folderName = $request->input('folder_name');
        $path = $this->normalizePath($request->input('path'));

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $newFolderPath = "$path/$folderName";

        if (Storage::disk('local')->exists($newFolderPath)) {
            return response()->json(['error' => 'La carpeta ya existe.'], 400);
        }

        Storage::disk('local')->makeDirectory($newFolderPath);

        // Registrar log
        $this->registerLog($employee->id, 'create_folder', "Carpeta creada: $folderName en $path", $request);

        return response()->json(['message' => 'Carpeta creada exitosamente.', 'path' => $newFolderPath]);
    }

    /**
     * Actualiza (renombra) una carpeta específica.
     */
    public function updateFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_rename_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para editar carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'old_folder_name' => 'required|string|max:255|regex:/^[\w\- ]+$/',
            'new_folder_name' => 'required|string|max:255|regex:/^[\w\- ]+$/',
            'path' => 'required|string',
        ], [
            'old_folder_name.regex' => 'El nombre de la carpeta original contiene caracteres inválidos.',
            'new_folder_name.regex' => 'El nuevo nombre de la carpeta contiene caracteres inválidos.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldFolderName = $request->input('old_folder_name');
        $newFolderName = $request->input('new_folder_name');
        $path = $this->normalizePath($request->input('path'));

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $oldPath = "$path/$oldFolderName";
        $newPath = "$path/$newFolderName";

        if (!Storage::disk('local')->exists($oldPath)) {
            return response()->json(['error' => 'La carpeta original no existe.'], 404);
        }

        if (Storage::disk('local')->exists($newPath)) {
            return response()->json(['error' => 'La nueva carpeta ya existe.'], 400);
        }

        Storage::disk('local')->move($oldPath, $newPath);

        // Registrar log
        $this->registerLog($employee->id, 'rename_folder', "Carpeta renombrada de $oldFolderName a $newFolderName en $path", $request);

        return response()->json([
            'message' => 'Carpeta renombrada exitosamente.',
            'old_path' => $oldPath,
            'new_path' => $newPath
        ]);
    }

    /**
     * Muestra el contenido de un archivo.
     */
    public function view(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (
            !$this->hasPermission('can_view_file_explorer') ||
            !$this->hasPermission('can_open_files')
        ) {
            return response()->json(['error' => 'No tienes permiso para ver archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $path = $this->normalizePath($request->input('path'));

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $filePath = "$path/$filename";

        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['error' => 'El archivo no existe.'], 404);
        }

        $fullPath = Storage::disk('local')->path($filePath);
        $mimeType = mime_content_type($fullPath);

        // Registrar log
        $this->registerLog($employee->id, 'view_file', "Archivo visto: $filename en $path", $request);

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ]);
    }

    /**
     * Sirve el archivo directamente para ser accedido públicamente.
     */
    public function getPublicFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $path = $request->input('path');
        $filePath = rtrim($path, '/') . '/' . ltrim($filename, '/');

        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['error' => 'El archivo no existe.'], 404);
        }

        // Registrar log
        $employee = Auth::guard('employee')->user();
        $this->registerLog($employee->id, 'get_public_file', "Archivo público accedido: $filename en $path", $request);

        return response()->file(Storage::disk('local')->path($filePath), [
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    /**
     * Descarga un archivo específico.
     */
    public function downloadFile(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$this->hasPermission('can_download_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para descargar archivos.'], 403);
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
        $path = $this->normalizePath($request->input('path'));

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $filePath = rtrim($path, '/') . '/' . ltrim($filename, '/');

        if (!Storage::disk('local')->exists($filePath)) {
            return response()->json(['error' => 'El archivo no existe.'], 404);
        }

        // Registrar log
        $this->registerLog($employee->id, 'download_file', "Archivo descargado: $filename de $path", $request);

        return Storage::disk('local')->download($filePath, $filename);
    }

    /**
     * Copia múltiples elementos (archivos y carpetas) a otra carpeta.
     */
    public function copyItems(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_copy_files')) {
            return response()->json(['error' => 'No tienes permiso para copiar archivos o carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.name' => 'required|string',
            'items.*.type' => 'required|in:file,folder',
            'source_path' => 'required|string',
            'target_path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $items = $request->input('items');
        $sourcePath = $this->normalizePath($request->input('source_path'));
        $targetPath = $this->normalizePath($request->input('target_path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($sourcePath) || !$this->isValidPath($targetPath)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $errors = [];
        foreach ($items as $item) {
            $itemName = $item['name'];
            $itemType = $item['type'];
            $sourceItemPath = "$sourcePath/$itemName";
            $targetItemPath = "$targetPath/$itemName";

            if (!Storage::disk('local')->exists($sourceItemPath)) {
                $errors[] = "El elemento original $itemName no existe.";
                continue;
            }

            if (Storage::disk('local')->exists($targetItemPath)) {
                if ($overwrite) {
                    if ($itemType === 'file') {
                        Storage::disk('local')->delete($targetItemPath);
                    } else {
                        Storage::disk('local')->deleteDirectory($targetItemPath);
                    }
                } else {
                    $errors[] = "Ya existe un elemento con el mismo nombre $itemName en la carpeta de destino.";
                    continue;
                }
            }

            if ($itemType === 'file') {
                Storage::disk('local')->copy($sourceItemPath, $targetItemPath);
            } else {
                $this->copyFolder($sourceItemPath, $targetItemPath);
            }

            // Registrar log por cada elemento copiado
            $transactionId = $itemType === 'file' ? 'copy_file' : 'copy_folder';
            $description = "Elemento copiado: $itemName de $sourcePath a $targetPath";
            $this->registerLog($employee->id, $transactionId, $description, $request);
        }

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 400);
        }

        return response()->json(['message' => 'Elementos copiados exitosamente.']);
    }

    /**
     * Mueve múltiples elementos (archivos y carpetas) a otra carpeta.
     */
    public function moveItems(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_move_files')) {
            return response()->json(['error' => 'No tienes permiso para mover archivos o carpetas.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.name' => 'required|string',
            'items.*.type' => 'required|in:file,folder',
            'source_path' => 'required|string',
            'target_path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $items = $request->input('items');
        $sourcePath = $this->normalizePath($request->input('source_path'));
        $targetPath = $this->normalizePath($request->input('target_path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($sourcePath) || !$this->isValidPath($targetPath)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $errors = [];
        foreach ($items as $item) {
            $itemName = $item['name'];
            $itemType = $item['type'];
            $sourceItemPath = "$sourcePath/$itemName";
            $targetItemPath = "$targetPath/$itemName";

            if (!Storage::disk('local')->exists($sourceItemPath)) {
                $errors[] = "El elemento original $itemName no existe.";
                continue;
            }

            if (Storage::disk('local')->exists($targetItemPath)) {
                if ($overwrite) {
                    if ($itemType === 'file') {
                        Storage::disk('local')->delete($targetItemPath);
                    } else {
                        Storage::disk('local')->deleteDirectory($targetItemPath);
                    }
                } else {
                    $errors[] = "Ya existe un elemento con el mismo nombre $itemName en la carpeta de destino.";
                    continue;
                }
            }

            if ($itemType === 'file') {
                Storage::disk('local')->move($sourceItemPath, $targetItemPath);
            } else {
                $this->moveFolder($sourceItemPath, $targetItemPath);
            }

            // Registrar log por cada elemento movido
            $transactionId = $itemType === 'file' ? 'move_file' : 'move_folder';
            $description = "Elemento movido: $itemName de $sourcePath a $targetPath";
            $this->registerLog($employee->id, $transactionId, $description, $request);
        }

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 400);
        }

        return response()->json(['message' => 'Elementos movidos exitosamente.']);
    }


    /**
     * Copia un archivo a otra carpeta.
     */
    public function copyFile(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_copy_files')) {
            return response()->json(['error' => 'No tienes permiso para copiar archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'source_path' => 'required|string',
            'target_path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $sourcePath = $this->normalizePath($request->input('source_path'));
        $targetPath = $this->normalizePath($request->input('target_path'));

        if (!$this->isValidPath($sourcePath) || !$this->isValidPath($targetPath)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $sourceFilePath = "$sourcePath/$filename";
        $targetFilePath = "$targetPath/$filename";

        if (!Storage::disk('local')->exists($sourceFilePath)) {
            return response()->json(['error' => 'El archivo original no existe.'], 404);
        }

        if (Storage::disk('local')->exists($targetFilePath)) {
            return response()->json(['error' => 'Ya existe un archivo con el mismo nombre en la carpeta de destino.'], 400);
        }

        Storage::disk('local')->copy($sourceFilePath, $targetFilePath);

        // Registrar log
        $this->registerLog($employee->id, 'copy_file', "Archivo copiado: $filename de $sourcePath a $targetPath", $request);

        return response()->json(['message' => 'Archivo copiado exitosamente.', 'path' => $targetFilePath]);
    }

    /**
     * Copia una carpeta de origen a destino de forma recursiva.
     */
    public function copyFolder($source, $destination)
    {
        $directories = Storage::disk('local')->allDirectories($source);
        $files = Storage::disk('local')->allFiles($source);

        // Crear directorios en destino
        foreach ($directories as $dir) {
            $relativePath = substr($dir, strlen($source) + 1);
            Storage::disk('local')->makeDirectory($destination . '/' . $relativePath);
        }

        // Copiar archivos
        foreach ($files as $file) {
            $relativePath = substr($file, strlen($source) + 1);
            Storage::disk('local')->copy($file, $destination . '/' . $relativePath);
        }
    }


    /**
     * Mueve una carpeta de origen a destino de forma recursiva.
     */
    public function moveFolder($source, $destination)
    {
        $this->copyFolder($source, $destination);
        Storage::disk('local')->deleteDirectory($source);
    }

    /**
     * Validar que la ruta proporcionada no contenga patrones de Path Traversal.
     */
    private function isValidPath($path)
    {
        // Evitar rutas que suban a directorios superiores
        return !Str::contains($path, ['..', './', '../']);
    }

    /**
     * Verifica si el empleado tiene el permiso especificado.
     *
     * @param string $permission
     * @return bool
     */
    private function hasPermission(string $permission): bool
    {
        $employee = Auth::guard('employee')->user();

        // Asegúrate de que la relación 'permissions' esté cargada
        if (!$employee->relationLoaded('permissions')) {
            $employee->load('permissions');
        }

        return $employee->permissions->contains('name', $permission);
    }



    /**
     * Copia múltiples archivos a otra carpeta.
     */
    public function copyFiles(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_copy_files')) {
            return response()->json(['error' => 'No tienes permiso para copiar archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'filenames' => 'required|array',
            'filenames.*' => 'required|string',
            'source_path' => 'required|string',
            'target_path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filenames = $request->input('filenames');
        $sourcePath = $this->normalizePath($request->input('source_path'));
        $targetPath = $this->normalizePath($request->input('target_path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($sourcePath) || !$this->isValidPath($targetPath)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $errors = [];
        foreach ($filenames as $filename) {
            $sourceFilePath = "$sourcePath/$filename";
            $targetFilePath = "$targetPath/$filename";

            if (!Storage::disk('local')->exists($sourceFilePath)) {
                $errors[] = "El archivo original $filename no existe.";
                continue;
            }

            if (Storage::disk('local')->exists($targetFilePath)) {
                if ($overwrite) {
                    Storage::disk('local')->delete($targetFilePath);
                } else {
                    $errors[] = "Ya existe un archivo con el mismo nombre $filename en la carpeta de destino.";
                    continue;
                }
            }

            Storage::disk('local')->copy($sourceFilePath, $targetFilePath);

            // Registrar log por cada archivo copiado
            $this->registerLog($employee->id, 'copy_file', "Archivo copiado: $filename de $sourcePath a $targetPath", $request);
        }

        if (!empty($errors)) {
            return response()->json(['errors' => $errors], 400);
        }

        return response()->json(['message' => 'Archivos copiados exitosamente.']);
    }

    /**
     * Mueve un archivo a otra carpeta.
     */
    public function moveFile(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$this->hasPermission('can_move_files')) {
            return response()->json(['error' => 'No tienes permiso para mover archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'source_path' => 'required|string',
            'target_path' => 'required|string',
            'overwrite' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $filename = $request->input('filename');
        $sourcePath = $this->normalizePath($request->input('source_path'));
        $targetPath = $this->normalizePath($request->input('target_path'));
        $overwrite = $request->input('overwrite', false);

        if (!$this->isValidPath($sourcePath) || !$this->isValidPath($targetPath)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $sourceFilePath = "$sourcePath/$filename";
        $targetFilePath = "$targetPath/$filename";

        if (!Storage::disk('local')->exists($sourceFilePath)) {
            return response()->json(['error' => 'El archivo original no existe.'], 404);
        }

        if (Storage::disk('local')->exists($targetFilePath)) {
            if ($overwrite) {
                Storage::disk('local')->delete($targetFilePath);
            } else {
                return response()->json(['error' => 'Ya existe un archivo con el mismo nombre en la carpeta de destino.'], 400);
            }
        }

        Storage::disk('local')->move($sourceFilePath, $targetFilePath);

        // Registrar log
        $this->registerLog($employee->id, 'move_file', "Archivo movido: $filename de $sourcePath a $targetPath", $request);

        return response()->json(['message' => 'Archivo movido exitosamente.', 'path' => $targetFilePath]);
    }

    /**
     * Renombra un archivo específico.
     */
    public function renameFile(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$this->hasPermission('can_rename_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para renombrar archivos.'], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'old_filename' => 'required|string',
            'new_filename' => 'required|string|max:255',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $oldFilename = $request->input('old_filename');
        $newFilename = $request->input('new_filename');
        $path = $this->normalizePath($request->input('path'));

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $oldFilePath = rtrim($path, '/') . '/' . ltrim($oldFilename, '/');
        $newFilePath = rtrim($path, '/') . '/' . ltrim($newFilename, '/');

        if (!Storage::disk('local')->exists($oldFilePath)) {
            return response()->json(['error' => 'El archivo original no existe.'], 404);
        }

        if (Storage::disk('local')->exists($newFilePath)) {
            return response()->json(['error' => 'Ya existe un archivo con el nuevo nombre.'], 400);
        }

        // Renombrar el archivo
        Storage::disk('local')->move($oldFilePath, $newFilePath);

        // Registrar log
        $this->registerLog($employee->id, 'rename_file', "Archivo renombrado de $oldFilename a $newFilename en $path", $request);

        return response()->json(['message' => 'Archivo renombrado exitosamente.', 'path' => $newFilePath]);
    }

    /**
     * Descarga una carpeta específica como un archivo ZIP.
     */
    public function downloadFolder(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$this->hasPermission('can_download_files_and_folders')) {
            return response()->json(['error' => 'No tienes permiso para descargar carpetas.'], 403);
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
        $path = $this->normalizePath($request->input('path'));

        // Validar la ruta para prevenir ataques de Path Traversal
        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        $folderPath = rtrim($path, '/') . '/' . ltrim($folderName, '/');

        if (!Storage::disk('local')->exists($folderPath)) {
            return response()->json(['error' => 'La carpeta no existe.'], 404);
        }

        // Ruta completa en el sistema de archivos
        $fullFolderPath = Storage::disk('local')->path($folderPath);

        // Nombre del archivo ZIP
        $zipFileName = Str::slug($folderName) . '-' . time() . '.zip';

        // Ruta temporal para almacenar el archivo ZIP
        $temporaryZipPath = storage_path('app/temp/' . $zipFileName);

        // Asegurarse de que el directorio temporal exista
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Crear el archivo ZIP
        $zip = new ZipArchive;
        if ($zip->open($temporaryZipPath, ZipArchive::CREATE) === TRUE) {
            // Agregar la carpeta al ZIP
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($fullFolderPath),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $name => $file) {
                // Saltar directorios
                if (!$file->isDir()) {
                    // Obtener la ruta relativa para el ZIP
                    $filePath = $file->getRealPath();
                    $relativePath = substr($filePath, strlen($fullFolderPath) + 1);

                    // Añadir archivo al ZIP
                    $zip->addFile($filePath, $folderName . '/' . $relativePath);
                }
            }

            $zip->close();

            // Verificar si el archivo ZIP se creó correctamente
            if (!file_exists($temporaryZipPath)) {
                return response()->json(['error' => 'Error al crear el archivo ZIP.'], 500);
            }

            // Registrar log
            $this->registerLog($employee->id, 'download_folder', "Carpeta descargada como ZIP: $folderName de $path", $request);

            // Descargar el archivo ZIP
            return response()->download($temporaryZipPath, $zipFileName)->deleteFileAfterSend(true);
        } else {
            return response()->json(['error' => 'No se pudo crear el archivo ZIP.'], 500);
        }
    }

    /**
     * Obtener toda la estructura de archivos y carpetas.
     */
    public function getFilesTree(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        // Verificar permisos
        if (!$this->hasPermission('can_view_file_explorer')) {
            return response()->json(['error' => 'No tienes permiso para ver archivos.'], 403);
        }

        // Directorio raíz (puede ser 'public' u otro según tu estructura)
        $rootPath = 'public';

        // Obtener el árbol de archivos y carpetas
        $tree = $this->getDirectoryTree($rootPath);

        // Registrar log
        //$this->registerLog($employee->id, 'view_files_tree', "Árbol de archivos y carpetas visualizado desde $rootPath", $request);

        return response()->json($tree);
    }

    /**
     * Función recursiva para obtener el árbol de directorios y archivos.
     */
    private function getDirectoryTree($path)
    {
        $items = [];

        $directories = Storage::disk('local')->directories($path);
        $files = Storage::disk('local')->files($path);

        foreach ($directories as $directory) {
            $items[] = [
                'name' => basename($directory),
                'path' => $directory,
                'type' => 'folder',
                'children' => $this->getDirectoryTree($directory),
            ];
        }

        foreach ($files as $file) {
            $items[] = [
                'name' => basename($file),
                'path' => $file,
                'type' => 'file',
            ];
        }

        return $items;
    }

    /**
     * Registra una acción en la tabla de logs.
     *
     * @param int $userId
     * @param string $transaction_idNombre de la acción (e.g., "view_files_tree")
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
            'transaction_id' => $transaction_id, // Asegúrate de que el campo 'action' exista en tu tabla 'logs'
            'description' => $description,
            'date' => now(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }


}
