<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Datos del empleado
        $employees = [
            [
                'id' => 1,
                'first_name' => 'admin',
                'last_name_1' => 'admin',
                'last_name_2' => 'admin',
                'position_id' => 1,  // Asume que el puesto Admin tiene ID 1 en la tabla positions
                'username' => 'VSP',
                'password' => Hash::make('admin123'), // Encripta la contraseña
                'registered_at' => Carbon::now()->toDateString(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        // Insertar datos en la tabla employees
        DB::table('employees')->insert($employees);
    }
}
