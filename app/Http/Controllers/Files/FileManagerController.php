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
    public function __construct()
    {
        $this->middleware('auth:employee'); // Usar el guard 'employee'
    }

    public function index(Request $request)
    {
        $employee = Auth::guard('employee')->user(); // Usar el guard 'employee'
        $path = $request->input('path', '');

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        if (!$employee->hasPermission('can_read_folders') || !$employee->hasPermission('can_read_files')) {
            return response()->json(['error' => 'No tienes permiso para ver los archivos o carpetas.'], 403);
        }

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
        $employee = Auth::guard('employee')->user();

        if (!$employee->hasPermission('can_create_files')) {
            return response()->json(['error' => 'No tienes permiso para subir archivos.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
            'path' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $path = $request->input('path');

        if (!$this->isValidPath($path)) {
            return response()->json(['error' => 'Ruta inválida.'], 400);
        }

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store($path, 'local');
            return response()->json(['message' => 'Archivo subido exitosamente.', 'path' => $filePath]);
        }

        return response()->json(['error' => 'No se proporcionó ningún archivo.'], 400);
    }

    public function delete(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee->hasPermission('can_delete_files')) {
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
        $path = $request->input('path');

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

    // Otros métodos se mantienen igual, pero sin los encabezados CORS
    // ...

    private function isValidPath($path)
    {
        return !Str::contains($path, ['..', './', '../']);
    }
}
