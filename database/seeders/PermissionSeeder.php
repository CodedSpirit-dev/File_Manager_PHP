<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Permisos para Empresas
            ['name' => 'can_create_companies', 'description' => 'Crear empresas'],
            ['name' => 'can_delete_companies', 'description' => 'Eliminar empresas'],
            ['name' => 'can_update_companies', 'description' => 'Modificar empresas'],

            // Permisos para Puestos
            ['name' => 'can_create_positions', 'description' => 'Crear nuevos puestos'],
            ['name' => 'can_update_positions', 'description' => 'Editar puestos'],
            ['name' => 'can_delete_positions', 'description' => 'Eliminar puestos'],

            // Permisos para Usuarios
            ['name' => 'can_create_users', 'description' => 'Crear usuarios'],
            ['name' => 'can_delete_users', 'description' => 'Eliminar usuarios'],
            ['name' => 'can_update_users', 'description' => 'Modificar usuarios'],
            ['name' => 'can_view_company_users', 'description' => 'Ver compañeros de la empresa'],

            // Permisos para Gestión de Archivos y Carpetas
            ['name' => 'can_view_file_explorer', 'description' => 'Ver explorador de archivos'],
            ['name' => 'can_open_files', 'description' => 'Abrir archivos'],
            ['name' => 'can_upload_files_and_folders', 'description' => 'Subir archivos y carpetas'],
            ['name' => 'can_create_folders', 'description' => 'Crear carpetas'],
            ['name' => 'can_download_files_and_folders', 'description' => 'Descargar archivos y carpetas'],
            ['name' => 'can_copy_files', 'description' => 'Copiar archivos'],
            ['name' => 'can_move_files', 'description' => 'Mover archivos'],
            ['name' => 'can_rename_files_and_folders', 'description' => 'Cambiar nombre de archivos y carpetas'],
            ['name' => 'can_delete_files_and_folders', 'description' => 'Eliminar archivos y carpetas'],
        ];

        // Insert permissions into the database
        foreach ($permissions as $permission) {
            DB::table('permissions')->insert($permission);
        }
    }
}
