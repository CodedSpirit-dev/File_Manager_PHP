<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDirectorioTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('directorio', function (Blueprint $table) {
            $table->id(); // ID autoincremental
            $table->string('nombre', 40); // Texto de 40 caracteres para nombre
            $table->string('apellido', 40); // Texto de 40 caracteres para apellido
            $table->timestamps(); // Fecha de creación y actualización automáticas
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('directorio');
    }
}
