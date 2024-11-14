<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Position;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * Constructor para aplicar middleware de autenticación y autorización.
     */
    public function __construct()
    {
        $this->middleware('auth:employee'); // Aplicar middleware al guard 'employee'
    }

    /**
     * Mostrar el perfil del empleado autenticado.
     */
    public function show()
    {
        $employee = Auth::guard('employee')->user();

        if (!$employee) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Cargar relaciones necesarias
        $employee->load('position.company');

        $profileData = [
            'first_name' => $employee->first_name,
            'last_name_1' => $employee->last_name_1,
            'last_name_2' => $employee->last_name_2,
            'phone_number' => $employee->phone_number,
            'username' => $employee->username,
            'position' => $employee->position ? $employee->position->name : 'Sin asignar',
            'company' => $employee->position && $employee->position->company ? $employee->position->company->name : 'Sin asignar',
            'registered_at' => $employee->registered_at->format('Y-m-d H:i:s'),
            'last_login_at' => $employee->last_login_at ? $employee->last_login_at->format('Y-m-d H:i:s') : 'Nunca'
        ];

        return response()->json($profileData);
    }

    /**
     * Mostrar una lista de todos los empleados.
     */
    public function index()
    {
        $employees = Employee::with('position.company')->get();
        return response()->json($employees);
    }

    /**
     * Mostrar la vista para crear un nuevo empleado.
     */
    public function create()
    {
        $positions = Position::with('company')->get();
        $companies = Company::all();

        return inertia('Admin/CreateEmployee', [
            'positions' => $positions,
            'companies' => $companies,
        ]);
    }

    /**
     * Almacenar un nuevo empleado en la base de datos.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:15',
            'position_id' => 'required|integer|exists:positions,id',
            'username' => 'required|string|unique:employees,username|max:255',
            'password' => 'required|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $employee = new Employee();
        $employee->first_name = $request->first_name;
        $employee->last_name_1 = $request->last_name_1;
        $employee->last_name_2 = $request->last_name_2;
        $employee->phone_number = $request->phone_number;
        $employee->position_id = $request->position_id;
        $employee->username = $request->username;
        $employee->password = Hash::make($request->password);
        $employee->registered_at = now();
        $employee->save();

        Log::create([
            'user_id' => auth()->id(),
            'transaction_id' => 'create_employee',
            'description' => "Empleado '{$employee->username}' creado",
        ]);

        return response()->json(['id' => $employee->id]);
    }

    /**
     * Obtener la jerarquía del usuario autenticado.
     */
    public function getUserHierarchy()
    {
        $employee = Auth::guard('employee')->user();
        if (!$employee) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $hierarchyLevel = $employee->position->hierarchy_level;
        $companyName = $employee->position->company->name;

        return response()->json([
            'hierarchy_level' => $hierarchyLevel,
            'company_name' => $companyName,
        ]);
    }

    /**
     * Mostrar la vista para editar un empleado específico.
     */
    public function edit($id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        $positions = Position::with('company')->get();
        $companies = Company::all();

        $companyId = $employee->position->company_id;

        return inertia('Admin/EditEmployee', [
            'employee' => [
                'id' => $employee->id,
                'first_name' => $employee->first_name,
                'last_name_1' => $employee->last_name_1,
                'last_name_2' => $employee->last_name_2,
                'phone_number' => $employee->phone_number,
                'username' => $employee->username,
                'position_id' => $employee->position_id,
                'company_id' => $companyId,
            ],
            'positions' => $positions,
            'companies' => $companies,
        ]);
    }

    /**
     * Actualizar un empleado específico en la base de datos.
     */
    public function update(Request $request, $id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'nullable|string|max:255',
            'phone_number' => 'required|string|max:15',
            'position_id' => 'required|integer|exists:positions,id',
            'username' => 'required|string|unique:employees,username,' . $id . '|max:255',
            'password' => 'nullable|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee->first_name = $request->first_name;
        $employee->last_name_1 = $request->last_name_1;
        $employee->last_name_2 = $request->last_name_2;
        $employee->phone_number = $request->phone_number;
        $employee->username = $request->username;
        $employee->position_id = $request->position_id;

        if ($request->filled('password')) {
            $employee->password = Hash::make($request->password);
        }

        $employee->save();

        Log::create([
            'user_id' => auth()->id(),
            'transaction_id' => 'update_employee',
            'description' => "Empleado '{$employee->username}' actualizado",
        ]);

        return response()->json(['message' => 'Empleado actualizado con éxito']);
    }

    /**
     * Obtener los permisos de un empleado específico.
     */
    public function getPermissions($id)
    {
        $employee = Employee::with('position.permissions')->find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        return response()->json($employee->position->permissions);
    }

    /**
     * Eliminar un empleado.
     */
    public function destroy($id)
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return response()->json(['error' => 'Empleado no encontrado'], 404);
        }

        $employee->delete();

        Log::create([
            'user_id' => auth()->id(),
            'transaction_id' => 'delete_employee',
            'description' => "Empleado '{$employee->username}' eliminado",
        ]);

        return response()->json(['message' => 'Empleado eliminado con éxito']);
    }
}
