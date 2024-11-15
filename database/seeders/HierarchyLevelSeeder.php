<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HierarchyLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Datos de niveles de jerarquía
        $hierarchyLevels = [
            ['level' => 0, 'name' => 'Administrador de sistema'],
            ['level' => 1, 'name' => 'Nivel 1'],
            ['level' => 2, 'name' => 'Nivel 2'],
            ['level' => 3, 'name' => 'Nivel 3'],
            ['level' => 4, 'name' => 'Nivel 4'],
            ['level' => 5, 'name' => 'Nivel 5'],
            ['level' => 6, 'name' => 'Nivel 6'],
            ['level' => 7, 'name' => 'Nivel 7'],
            ['level' => 8, 'name' => 'Nivel 8'],
            ['level' => 9, 'name' => 'Nivel 9'],
            ['level' => 10, 'name' => 'Nivel 10'],
        ];

        // Insertar datos en la tabla hierarchy_levels
        DB::table('hierarchy_levels')->insert($hierarchyLevels);
    }
}
