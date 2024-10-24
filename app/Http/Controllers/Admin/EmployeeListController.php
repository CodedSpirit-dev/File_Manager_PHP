<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;

class EmployeeListController extends Controller
{
    public function index()
    {
        $employees = Employee::all();
        return response()->json($employees);
    }
}
