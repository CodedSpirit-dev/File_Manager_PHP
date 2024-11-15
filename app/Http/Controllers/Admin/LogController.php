<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LogController extends Controller
{
    /**
     * Constructor para aplicar middleware de autenticación.
     */
    public function __construct()
    {
        $this->middleware('auth:employee');
    }

    /**
     * Mostrar una lista de logs ordenados por fecha.
     */
    public function index()
    {
        // Obtener todos los logs ordenados por la columna 'date' en orden descendente, incluyendo la relación 'user'
        $logs = Log::with('user')->orderBy('date', 'desc')->get()->map(function ($log) {
            // Formatear la fecha usando Carbon en un formato compatible con JavaScript (ISO 8601)
            $log->date = Carbon::parse($log->date)->toIso8601String();

            // Agregar el nombre de usuario; si no existe, mostrar 'N/A'
            $log->user_name = $log->user ? $log->user->username : 'N/A';

            return $log;
        });

        return response()->json($logs);
    }
}
