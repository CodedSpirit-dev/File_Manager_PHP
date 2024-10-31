<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    /**
     * Maneja una solicitud entrante.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string    $permission
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        $employee = Auth::user();

        if (!$employee || !$employee->hasPermission($permission)) {
            return response()->json(['error' => 'No tienes permiso para realizar esta acción.'], 403);
        }

        return $next($request);
    }
}
