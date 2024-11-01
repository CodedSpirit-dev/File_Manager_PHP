<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Datos del puesto
        $positions = [
            [
                'id' => 1,
                'name' => 'Admin',
                'company_id' => 1,
                'hierarchy_level' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        // Insertar datos en la tabla positions
        DB::table('positions')->insert($positions);
    }
}
