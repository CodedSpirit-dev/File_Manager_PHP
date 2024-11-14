<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class CreateAllStarterTables
 *
 * Esta migración crea las tablas iniciales para la aplicación, incluyendo niveles jerárquicos,
 * empresas, posiciones, empleados y permisos.
 */
class CreateAllStarterTables extends Migration
{
    /**
     * Ejecutar las migraciones.
     *
     * Este método crea las tablas necesarias para la aplicación.
     *
     * @return void
     */
    public function up()
    {
        // Tabla para niveles jerárquicos
        Schema::create('hierarchy_levels', function (Blueprint $table) {
            $table->unsignedInteger('level')->primary();
            $table->string('name');
            $table->timestamps();
        });

        // Tabla para empresas
        Schema::create('companies', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        // Tabla para posiciones
        Schema::create('positions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->unsignedInteger('company_id');
            $table->unsignedInteger('hierarchy_level');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels')->onDelete('cascade');
        });

        // Tabla para empleados
        Schema::create('employees', function (Blueprint $table) {
            $table->increments('id');
            $table->string('first_name');
            $table->string('last_name_1');
            $table->string('last_name_2')->nullable();
            $table->string('phone_number')->nullable(); // Nuevo campo de teléfono
            $table->unsignedInteger('position_id')->nullable();
            $table->string('username')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->date('registered_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->foreign('position_id')->references('id')->on('positions')->onDelete('set null');
        });

        // Tabla para permisos
        Schema::create('permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });

        // Tabla pivote para permisos de posiciones
        Schema::create('position_permissions', function (Blueprint $table) {
            $table->unsignedInteger('position_id'); // ID de la posición
            $table->unsignedInteger('permission_id'); // ID del permiso

            $table->foreign('position_id')->references('id')->on('positions')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');

            $table->primary(['position_id', 'permission_id']);
        });

        // Tabla para logs de transacciones
        Schema::create('logs', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('user_id')->nullable(); // ID del usuario, ahora nullable
            $table->string('transaction_id'); // Identificador de la transacción
            $table->text('description')->nullable(); // Descripción detallada
            $table->timestamp('date')->default(DB::raw('CURRENT_TIMESTAMP')); // Fecha y hora de la transacción
            $table->string('ip_address')->nullable(); // Dirección IP
            $table->string('user_agent')->nullable(); // Información del agente de usuario

            // Relación con el empleado
            $table->foreign('user_id')->references('id')->on('employees')->onDelete('cascade');
        });
    }

    /**
     * Revertir las migraciones.
     *
     * Este método elimina las tablas creadas por el método up().
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('logs');
        Schema::dropIfExists('position_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('hierarchy_levels');
    }
}
