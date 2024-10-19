<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Directorio extends Model
{
    use HasFactory;

    // Especifica la tabla asociada con este modelo
    protected $table = 'directorio';

    // Permitir la asignación masiva para los campos especificados
    protected $fillable = ['nombre', 'apellido'];
}
