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
            ['level' => 1, 'name' => 'Director de empresa'],
            ['level' => 2, 'name' => 'Jefe de turno'],
            ['level' => 3, 'name' => 'Jefe de area'],
        ];

        // Insertar datos en la tabla hierarchy_levels
        DB::table('hierarchy_levels')->insert($hierarchyLevels);
    }
}
