<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LogController extends Controller
{
    /**
     * Mostrar una lista de logs ordenados por fecha.
     */
    public function index()
    {
        // Obtener todos los logs ordenados por la columna 'date' en orden descendente
        $logs = Log::orderBy('date', 'desc')->get()->map(function ($log) {
            // Formatear la fecha usando Carbon en un formato compatible con JavaScript (ISO 8601)
            $log->date = Carbon::parse($log->date)->toIso8601String();
            return $log;
        });

        return response()->json($logs);
    }
}
