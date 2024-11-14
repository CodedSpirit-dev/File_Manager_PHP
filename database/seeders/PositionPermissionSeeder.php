<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Class PositionPermissionSeeder
 *
 * Seeder class to populate the position_permissions table with initial data.
 */
class PositionPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This method inserts a predefined set of permissions for a position into the position_permissions table.
     *
     * @return void
     */
    public function run(): void
    {
        // Lista de permisos ordenada del 1 al 20 para la posición con ID 1
        $permissions = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
        ];

        // Construir array para insertar en la tabla position_permissions
        $positionPermissions = array_map(function ($permissionId) {
            return [
                'position_id' => 1,
                'permission_id' => $permissionId,
            ];
        }, $permissions);

        // Insertar datos en la tabla position_permissions
        DB::table('position_permissions')->insert($positionPermissions);
    }
}
