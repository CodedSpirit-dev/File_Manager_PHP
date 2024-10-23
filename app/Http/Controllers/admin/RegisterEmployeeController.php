<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee; // Modelo Employee
use Illuminate\Support\Facades\Hash; // Para hashear la contraseña
use Illuminate\Support\Facades\Validator; // Para validación de datos

class RegisterEmployeeController extends Controller
{
    public function create()
    {
        // Devuelve una vista para registrar un nuevo empleado
        return view('admin.employees.create');
    }

    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'position_id' => 'required|integer',
            'hierarchy_level' => 'required|integer|min:0|max:100',
            'username' => 'required|string|unique:employees,username|max:255', // El nombre de usuario debe ser único
            'password' => 'required|string|min:8|confirmed', // La confirmación de contraseña
            'company_id' => 'required|integer',
        ]);

        // Si la validación falla, devolver con errores
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422); // Devuelve un estado 422 en caso de error de validación
        }

        // Crear un nuevo empleado con los datos validados
        $employee = new Employee();
        $employee->first_name = $request->first_name;
        $employee->last_name_1 = $request->last_name_1;
        $employee->last_name_2 = $request->last_name_2;
        $employee->position_id = $request->position_id;
        $employee->hierarchy_level = $request->hierarchy_level;
        $employee->username = $request->username;
        $employee->company_id = $request->company_id;
        $employee->password = Hash::make($request->password);
        $employee->registered_at = now(); // Agrega la fecha actual
        $employee->save();
    }
}
