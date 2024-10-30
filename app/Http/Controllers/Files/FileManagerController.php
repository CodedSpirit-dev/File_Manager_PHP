<?php

namespace App\Http\Controllers\Files;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileManagerController extends Controller
{
    public function index(Request $request)
    {
        $employee = auth()->user(); // Obtén el empleado autenticado
        $position = $employee->position; // Posición del empleado autenticado
        $path = $request->input('path', 'public');

        if (!$position) {
            return response()->json(['error' => 'Position not assigned to employee.'], 403);
        }

        // Si el empleado es de jerarquía 0 (Administrador), tiene acceso a todas las carpetas
        if ($position->hierarchy_level === 0) {
            $directories = Storage::disk('local')->directories($path);
        } else {
            // Los empleados solo ven su propia carpeta y las de subordinados de su jerarquía
            $companyFolder = 'public/' . $employee->position->company->name; // Nombre de la carpeta de la empresa
            $employeeFolder = $companyFolder . '/' . $position->name; // Carpeta del puesto del empleado

            $directories = Storage::disk('local')->directories($employeeFolder);
        }

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
        $employee = auth()->user(); // Empleado autenticado
        $request->validate(['folder_name' => 'required|string']);

        // Verifica el nivel de jerarquía del empleado
        $path = ($employee->position->hierarchy_level === 0)
            ? 'public/' . $request->input('folder_name') // Admin crea en raíz
            : 'public/' . $employee->position->company->name . '/' . $employee->position->name . '/' . $request->input('folder_name');

        if (!Storage::disk('local')->exists($path)) {
            Storage::disk('local')->makeDirectory($path);
            return response()->json(['message' => 'Carpeta creada exitosamente.']);
        } else {
            return response()->json(['message' => 'La carpeta ya existe.'], 400);
        }
    }


}
