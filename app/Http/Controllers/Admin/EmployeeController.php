<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
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
        $employees = Employee::all();
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
}
