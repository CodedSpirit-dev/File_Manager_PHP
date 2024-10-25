<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator; // Para validación de datos
use App\Models\Company; // Modelo Company


class RegisterCompanyController extends Controller
{
    /**
     * Muestra el formulario para crear una nueva empresa.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        // Devuelve una vista para registrar una nueva empresa
        return view('admin.companies.create');
    }

    /**
     * Almacena una nueva empresa en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:companies,name',
        ]);

        // Si el nombre ya existe, devolver un error
        if (Company::where('name', $request->name)->exists()) {
            return response()->json([
                'errors' => [
                    'name' => ['El nombre de la empresa ya existe.'],
                ],
            ], 450); // Devuelve un estado 422 en caso de error de validación
        }

        // Si otros campos no cumplen con las reglas de validación, devolver un error
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 425); // Devuelve un estado 422 en caso de error de validación
        }

        // Crear una nueva empresa con los datos validados
        $company = new Company();
        $company->id = $request->id; // ID único de la empresa
        $company->name = $request->name;
        $company->save();
    }
}
