<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class CreateAllStarterTables
 *
 * Esta migración crea las tablas iniciales para la aplicación, incluyendo niveles de jerarquía,
 * empresas, puestos, empleados y permisos.
 */
class CreateAllStarterTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hierarchy_levels', function (Blueprint $table) {
            $table->unsignedInteger('level')->primary();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('positions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('company_id');
            $table->unsignedInteger('hierarchy_level');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name_1');
            $table->string('last_name_2');
            $table->uuid('position_id');
            $table->unsignedInteger('hierarchy_level');
            $table->string('username')->unique();
            $table->string('password');
            $table->date('registered_at');
            $table->string('company_id');
            $table->timestamps();

            $table->foreign('position_id')->references('id')->on('positions');
            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->unsignedInteger('hierarchy_level');
            $table->boolean('can_view')->default(false);
            $table->boolean('can_download')->default(false);
            $table->boolean('can_view_files')->default(false);
            $table->boolean('can_upload_files')->default(false);
            $table->boolean('can_create_folders')->default(false);
            $table->timestamps();

            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('hierarchy_levels');
    }
}