<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Position;
use Illuminate\Http\Request;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    // Method to get the authenticated employee's profile
    public function show()
    {
        // Get the authenticated employee
        $employee = auth()->user();

        if (!$employee) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        // Load specific relationships and attributes
        $employee->load('position', 'position.company'); // Load position and associated company

        // Format the employee's profile data
        $profileData = [
            'first_name' => $employee->first_name,
            'last_name_1' => $employee->last_name_1,
            'last_name_2' => $employee->last_name_2,
            'username' => $employee->username,
            'position' => $employee->position ? $employee->position->name : 'Unassigned',
            'company' => $employee->position && $employee->position->company ? $employee->position->company->name : 'Unassigned',
            'registered_at' => $employee->registered_at->format('Y-m-d H:i:s'),
            'last_login_at' => $employee->last_login_at ? $employee->last_login_at->format('Y-m-d H:i:s') : 'Never'
        ];

        // Return the profile data as JSON
        return response()->json($profileData);
    }

    /**
     * Display a list of all employees.
     */
    public function index()
    {
        $employees = Employee::with('position.company')->get(); // Cargar posición y compañía
        return response()->json($employees);
    }



    /**
     * Return the view to create a new employee.
     */
    public function create()
    {
        return view('admin.employees.create');
    }

    /**
     * Store a new employee in the database.
     */
    public function store(Request $request)
    {
        // Validate the input data
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'position_id' => 'required|integer',
            'username' => 'required|string|unique:employees,username|max:255',
            'password' => 'required|string|min:4|confirmed',
        ]);

        // If validation fails, return with errors
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        // Create a new employee
        $employee = new Employee();
        $employee->first_name = $request->first_name;
        $employee->last_name_1 = $request->last_name_1;
        $employee->last_name_2 = $request->last_name_2;
        $employee->position_id = $request->position_id;
        $employee->username = $request->username;
        $employee->password = Hash::make($request->password);
        $employee->registered_at = now();
        $employee->save();

        // Return the ID of the created employee
        return response()->json(['id' => $employee->id]);
    }

    // En tu controlador de usuarios o de autenticación
    public function getUserHierarchy()
    {
        $employee = auth()->user();
        if (!$employee) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $hierarchyLevel = $employee->position->hierarchy_level;
        $companyName = $employee->position->company->name;

        return response()->json([
            'hierarchy_level' => $hierarchyLevel,
            'company_name' => $companyName,
        ]);
    }

    public function edit($id)
    {
        // Buscar el empleado por ID
        $employee = Employee::find($id);

        // Verificar si el empleado existe
        if (!$employee) {
            return redirect()->back()->withErrors(['error' => 'Empleado no encontrado']);
        }

        // Obtener las posiciones y las empresas disponibles
        $positions = Position::all();
        $companies = Company::all();

        $companyId = $employee->position->company_id;

        return inertia('EditEmployee', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name_1' => $employee->last_name_1,
                'last_name_2' => $employee->last_name_2,
                'username' => $employee->username,
                'position_id' => $employee->position_id,
                'company_id' => $companyId,
            ],
            'positions' => $positions,
            'companies' => $companies,
        ]);
    }



    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        // Validación
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'position_id' => 'required|integer',
            'company_id' => 'required|integer',
            'username' => 'required|string|unique:employees,username,' . $id . '|max:255',
            'password' => 'nullable|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualizar los campos del empleado solo si se proporciona el valor
        $employee->first_name = $request->first_name;
        $employee->last_name_1 = $request->last_name_1;
        $employee->last_name_2 = $request->last_name_2;
        $employee->username = $request->username;
        $employee->position_id = $request->position_id;

        // Actualizar la contraseña solo si se proporciona
        if ($request->filled('password')) {
            $employee->password = Hash::make($request->password);
        }

        $employee->save();

        return response()->json(['message' => 'Empleado actualizado con éxito']);
    }


    public function getPermissions($id)
    {
        $employee = Employee::with('permissions')->find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        return response()->json($employee->permissions);
    }



}
