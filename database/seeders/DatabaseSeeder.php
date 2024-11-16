<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Creación de un usuario de prueba
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Llamada a los seeders específicos
        $this->call([
            CompanySeeder::class,
            HierarchyLevelSeeder::class,
            PositionSeeder::class,
            PermissionSeeder::class,
            EmployeeSeeder::class,
            PositionPermissionSeeder::class, // Seeder actualizado para permisos de posición
        ]);
    }
}
