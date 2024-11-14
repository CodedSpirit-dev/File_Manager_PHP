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
        'phone_number',
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

    // Relación con la posición
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    // Relación con los permisos a través de la posición
    public function permissions()
    {
        return $this->position ? $this->position->permissions() : collect();
    }

    // Verifica si el empleado tiene un permiso específico
    public function hasPermission($permissionName)
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }

    // Relación con la empresa a través de la posición
    public function company()
    {
        return $this->hasOneThrough(Company::class, Position::class, 'id', 'id', 'position_id', 'company_id');
    }

    // Relación con la tabla 'logs'
    public function logs()
    {
        return $this->hasMany(Log::class, 'user_id');
    }

    // Acceso directo al nivel de jerarquía
    public function getHierarchyAttribute()
    {
        return $this->position->hierarchy_level_detail->level;
    }
}
