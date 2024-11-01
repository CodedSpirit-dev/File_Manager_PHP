<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Class EmployeePermissionSeeder
 *
 * Seeder class to populate the employee_permissions table with initial data.
 */
class EmployeePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * This method inserts a predefined set of permissions for an employee into the employee_permissions table.
     *
     * @return void
     */
    public function run(): void
    {
        // Lista de permisos ordenada del 1 al 24 para el empleado con ID 1
        $permissions = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24
        ];

        // Construir array para insertar en la tabla employee_permission
        $employeePermissions = array_map(function ($permissionId) {
            return [
                'employee_id' => 1,
                'permission_id' => $permissionId,
            ];
        }, $permissions);

        // Insertar datos en la tabla employee_permission
        DB::table('employee_permissions')->insert($employeePermissions);
    }
}
