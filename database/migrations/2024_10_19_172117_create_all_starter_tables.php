<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Class CreateAllStarterTables
 *
 * This migration creates the initial tables for the application, including hierarchy levels,
 * companies, positions, employees, and permissions.
 */
class CreateAllStarterTables extends Migration
{
    /**
     * Run the migrations.
     *
     * This method creates the necessary tables for the application.
     *
     * @return void
     */
    public function up()
    {
        // Table for hierarchy levels
        Schema::create('hierarchy_levels', function (Blueprint $table) {
            $table->unsignedInteger('level')->primary();
            $table->string('name');
            $table->timestamps();
        });

        // Table for companies
        Schema::create('companies', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->timestamps();
        });

        // Table for positions
        Schema::create('positions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->unsignedInteger('company_id');
            $table->unsignedInteger('hierarchy_level');
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies');
            $table->foreign('hierarchy_level')->references('level')->on('hierarchy_levels');
        });

        // Table for employees
        Schema::create('employees', function (Blueprint $table) {
            $table->increments('id');
            $table->string('first_name');
            $table->string('last_name_1');
            $table->string('last_name_2')->nullable();
            $table->unsignedInteger('position_id')->nullable();
            $table->string('username')->unique();
            $table->string('password');
            $table->date('registered_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();

            $table->foreign('position_id')->references('id')->on('positions');
        });

        // Table for permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');
            $table->string('description');
            $table->timestamps();
        });

        // Pivot table for employee permissions
        Schema::create('employee_permissions', function (Blueprint $table) {
            $table->unsignedInteger('employee_id'); // Employee ID
            $table->unsignedInteger('permission_id'); // Permission ID

            $table->foreign('employee_id')->references('id')->on('employees');
            $table->foreign('permission_id')->references('id')->on('permissions');
        });
    }

    /**
     * Reverse the migrations.
     *
     * This method drops the tables created by the up() method.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('employee_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('positions');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('hierarchy_levels');
    }
}
