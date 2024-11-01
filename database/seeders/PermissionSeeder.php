<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'can_create_users', 'description' => 'Crear usuarios'],
            ['name' => 'can_read_users', 'description' => 'Leer usuarios'],
            ['name' => 'can_update_users', 'description' => 'Editar usuarios'],
            ['name' => 'can_delete_users', 'description' => 'Eliminar usuarios'],
            ['name' => 'can_create_employees', 'description' => 'Crear empleados'],
            ['name' => 'can_read_employees', 'description' => 'Leer empleados'],
            ['name' => 'can_update_employees', 'description' => 'Editar a otros empleados'],
            ['name' => 'can_delete_employees', 'description' => 'Eliminar empleados'],
            ['name' => 'can_create_companies', 'description' => 'Crear empresas'],
            ['name' => 'can_read_companies', 'description' => 'Leer empresas'],
            ['name' => 'can_update_companies', 'description' => 'Editar empresas'],
            ['name' => 'can_delete_companies', 'description' => 'Eliminar empresas'],
            ['name' => 'can_create_positions', 'description' => 'Crear puestos'],
            ['name' => 'can_read_positions', 'description' => 'Leer puestos'],
            ['name' => 'can_update_positions', 'description' => 'Editar puestos'],
            ['name' => 'can_delete_positions', 'description' => 'Eliminar puestos'],
            ['name' => 'can_create_files', 'description' => 'Crear archivos'],
            ['name' => 'can_read_files', 'description' => 'Leer archivos'],
            ['name' => 'can_update_files', 'description' => 'Editar archivos'],
            ['name' => 'can_delete_files', 'description' => 'Eliminar archivos'],
            ['name' => 'can_create_folders', 'description' => 'Crear carpetas'],
            ['name' => 'can_read_folders', 'description' => 'Leer carpetas'],
            ['name' => 'can_update_folders', 'description' => 'Editar carpetas'],
            ['name' => 'can_delete_folders', 'description' => 'Eliminar carpetas'],
        ];

        // Insert permissions into the database
        foreach ($permissions as $permission) {
            \DB::table('permissions')->insert($permission);
        }
    }
}
