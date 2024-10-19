<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAllStarterTables extends Migration
{
    public function up()
    {
        // 1. Crear la tabla de Niveles de Jerarquía (hierarchy_levels)
        Schema::create('hierarchy_levels', function (Blueprint $table) {
            $table->unsignedInteger('level')->primary();  // Nivel de 0 a 100
            $table->string('name');  // Nombre de la jerarquía (Admin, Gerente)
            $table->timestamps();
        });

        // 2. Crear la tabla de Empresas (companies)
        Schema::create('companies', function (Blueprint $table) {
            $table->string('id')->primary();  // ID único con 4 letras del nombre
            $table->string('name');
            $table->timestamps();
        });

        // 3. Crear la tabla de Puestos (positions)
        Schema::create('positions', function (Blueprint $table) {
            $table->uuid('id')->primary();  // UUID como PK
            $table->string('name');  // Nombre del puesto
            $table->string('company_id');  // FK a la tabla empresas
            $table->unsignedInteger('hierarchy_level');  // FK a la tabla jerarquía
            $table->timestamps();

            // Definir FK
            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });

        // 4. Crear la tabla de Usuarios (users)
        Schema::create('users', function (Blueprint $table) {
            $table->id();  // Autogenerado, PK
            $table->string('first_name');
            $table->string('last_name_1');
            $table->string('last_name_2');
            $table->uuid('position_id');  // FK a la tabla puestos
            $table->unsignedInteger('hierarchy_level');  // Nivel de jerarquía
            $table->string('username')->unique();  // CURP o RFC único
            $table->string('password');
            $table->date('registered_at');
            $table->string('company_id');  // FK a la tabla empresas
            $table->timestamps();

            // Definir FK
            $table->foreign('position_id')->references('id')->on('positions');
            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });

        // 5. Crear la tabla de Permisos por Jerarquía (permissions)
        Schema::create('permissions', function (Blueprint $table) {
            $table->unsignedInteger('hierarchy_level');  // FK a la tabla jerarquía
            $table->boolean('can_view')->default(false);
            $table->boolean('can_download')->default(false);
            $table->boolean('can_view_files')->default(false);
            $table->boolean('can_upload_files')->default(false);
            $table->boolean('can_create_folders')->default(false);
            $table->timestamps();

            // Definir FK
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });
    }

    public function down()
    {
        // Eliminar tablas en orden inverso
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('users');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('hierarchy_levels');
    }
}
