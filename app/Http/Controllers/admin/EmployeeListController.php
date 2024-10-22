<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;

class EmployeeListController extends Controller
{
    public function index()
    {
        //Obtener todos los empleados
        $employees = Employee::all();

        return response()->json($employees);
    }
}
