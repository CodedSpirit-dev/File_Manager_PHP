<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use Notifiable;

    protected $table = 'employees';

    protected $fillable = [
        'first_name',
        'last_name_1',
        'last_name_2',
        'phone_number', // Nuevo campo de teléfono
        'position_id',
        'username',
        'password',
        'registered_at',
        'last_login_at'
    ];

    protected $casts = [
        'registered_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relación con la tabla 'positions'
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Relación con los permisos a través de la posición.
     */
    public function permissions()
    {
        return $this->position->permissions();
    }

    // Relación con la tabla 'companies'
    public function company()
    {
        return $this->hasOneThrough(Company::class, Position::class, 'id', 'id', 'position_id', 'company_id');
    }

    // Relación con la tabla 'logs'
    public function logs()
    {
        return $this->hasMany(Log::class, 'user_id');
    }

    /**
     * Acceso directo al nivel de jerarquía.
     */
    public function getHierarchyAttribute()
    {
        return $this->position->hierarchy_level_detail->level;
    }
}
