<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        // Validar las credenciales
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'username' => 'Las credenciales proporcionadas son incorrectas.',
            ]);
        }

        $request->session()->regenerate();

        // Cargar relaciones necesarias
        $employee = Auth::user()->load(['permissions', 'position.company', 'position.hierarchy_level_detail']);

        // Enviar datos al frontend
        return Inertia::render('Home', [
            'auth' => [
                'employee' => [
                    'id' => $employee->id,
                    'first_name' => $employee->first_name,
                    'last_name_1' => $employee->last_name_1,
                    'last_name_2' => $employee->last_name_2,
                    'position_id' => $employee->position_id,
                    'username' => $employee->username,
                    'registered_at' => $employee->registered_at,
                    'last_login_at' => $employee->last_login_at,
                    'company_id' => $employee->position->company_id ?? null,
                    'position' => [
                        'id' => $employee->position->id,
                        'name' => $employee->position->name,
                        'company_id' => $employee->position->company_id,
                        'hierarchy_level' => $employee->position->hierarchy_level,
                        'company' => [
                            'id' => $employee->position->company->id,
                            'name' => $employee->position->company->name,
                        ],
                        'hierarchy_level_detail' => [
                            'level' => $employee->position->hierarchy_level_detail->level,
                            'name' => $employee->position->hierarchy_level_detail->name,
                        ],
                    ],
                    'permissions' => $employee->permissions->pluck('name'), // Array de nombres de permisos
                ],
                'user' => [
                    'id' => Auth::user()->id,
                    'name' => Auth::user()->name,
                    'email' => Auth::user()->email,
                    'email_verified_at' => Auth::user()->email_verified_at,
                ],
            ],
        ]);
    }


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Cerrar sesión usando el guard 'employee'
        Auth::guard('employee')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
