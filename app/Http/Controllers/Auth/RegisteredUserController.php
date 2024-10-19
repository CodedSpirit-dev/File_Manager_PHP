<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class RegisteredUserController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name_1' => 'required|string|max:255',
            'last_name_2' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:employees',
            'password' => 'required|string|confirmed|min:8',
        ]);

        $employee = Employee::create([
            'first_name' => $request->first_name,
            'last_name_1' => $request->last_name_1,
            'last_name_2' => $request->last_name_2,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'position_id' => $request->position_id,  // Debes pasar este valor en el formulario
            'hierarchy_level' => 0,  // Establece nivel por defecto si aplica
            'company_id' => $request->company_id,  // Debes pasar este valor en el formulario
            'registered_at' => now(),
        ]);

        event(new Registered($employee));

        auth()->login($employee);

        return redirect(route('dashboard', absolute: false));
    }
}
