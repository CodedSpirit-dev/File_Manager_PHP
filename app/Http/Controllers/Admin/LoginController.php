<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Employee;
use App\Models\Log;

class LoginController extends Controller
{
    /**
     * Show the login form.
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Handle an authentication attempt.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::guard('employee')->attempt($credentials)) {
            $request->session()->regenerate();

            // Obtener el empleado autenticado y actualizar last_login_at
            $employee = Auth::guard('employee')->user();
            $employee->last_login_at = now();
            $employee->save();

            // Registrar log de inicio de sesión
            Log::create([
                'user_id' => $employee->id,
                'transaction_id' => 'login',
                'description' => 'Inicio de sesión exitoso',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return redirect()->intended('index');
        }

        // Registrar log de intento de inicio de sesión fallido
        Log::create([
            'user_id' => null, // Usuario desconocido
            'transaction_id' => 'login_failed',
            'description' => 'Intento de inicio de sesión fallido para el usuario ' . $request->username,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->withErrors([
            'username' => 'Estas credenciales no coinciden con nuestros registros.',
        ]);
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request)
    {
        $employee = Auth::guard('employee')->user();

        if ($employee) {
            // Registrar log de cierre de sesión
            Log::create([
                'user_id' => $employee->id,
                'transaction_id' => 'logout',
                'description' => 'Cierre de sesión exitoso',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::guard('employee')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
