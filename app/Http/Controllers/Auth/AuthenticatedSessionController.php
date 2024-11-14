<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Muestra la vista de inicio de sesión.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Maneja una solicitud de autenticación entrante.
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::guard('employee')->attempt($credentials, $request->boolean('remember'))) {
            // Registrar log de intento de inicio de sesión fallido
            Log::create([
                'user_id' => null, // Usuario desconocido
                'transaction_id' => 'login_failed',
                'description' => 'Intento de inicio de sesión fallido para el usuario ' . $request->username,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'date' => now(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'errors' => [
                        'username' => ['Las credenciales proporcionadas son incorrectas.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'username' => 'Las credenciales proporcionadas son incorrectas.',
            ]);
        }

        $request->session()->regenerate();

        // Actualizar la columna last_login_at
        $user = Auth::guard('employee')->user();
        $user->last_login_at = now();
        $user->save();

        // Registrar log de inicio de sesión exitoso
        Log::create([
            'user_id' => $user->id,
            'transaction_id' => 'login',
            'description' => 'Inicio de sesión exitoso',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'date' => now(),
        ]);

        return redirect()->intended('/');
    }

    /**
     * Destruye una sesión autenticada.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::guard('employee')->user();

        if ($user) {
            // Registrar log de cierre de sesión
            Log::create([
                'user_id' => $user->id,
                'transaction_id' => 'logout',
                'description' => 'Cierre de sesión exitoso',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'date' => now(),
            ]);
        }

        Auth::guard('employee')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
