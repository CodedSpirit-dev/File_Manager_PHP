<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ejemplo de registros en la tabla de logs
        DB::table('logs')->insert([
            [
                'user_id' => 1, // ID de un empleado
                'transaction_id' => 'TXN1001',
                'description' => 'Creación de un nuevo empleado',
                'date' => now(),
                'ip_address' => '192.168.0.1',
                'user_agent' => 'Mozilla/5.0',
            ]
        ]);
    }
}
