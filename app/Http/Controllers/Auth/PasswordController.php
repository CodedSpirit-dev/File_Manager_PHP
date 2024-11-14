<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\Log;

class PasswordController extends Controller
{
    /**
     * Actualiza la contraseña del usuario.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.current_password' => 'La contraseña actual es incorrecta.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            // Otros mensajes de error personalizados...
        ]);

        $user = $request->user();

        // Actualizar la contraseña del usuario
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Registrar el cambio de contraseña en logs
        Log::create([
            'user_id' => $user->id,
            'transaction_id' => 'password_update',
            'description' => 'Actualización de contraseña',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Contraseña actualizada con éxito.'], 200);
    }
}
