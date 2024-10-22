<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use Notifiable;

    protected $table = 'employees'; // Indica que utilizarás la tabla 'employees'

    // Define qué campos pueden ser llenados
    protected $fillable = [
        'first_name',
        'last_name_1',
        'last_name_2',
        'position_id',
        'hierarchy_level',
        'username',
        'password',
        'registered_at',
        'company_id',
    ];

    // Campos que se ocultan en el JSON de salida
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
