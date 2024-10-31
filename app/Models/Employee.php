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

    // Relación con la tabla 'companies' (Asegúrate de que esto no cause bucles)
    public function company()
    {
        return $this->hasOneThrough(Company::class, Position::class, 'id', 'id', 'position_id', 'company_id');
    }

    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class, 'employee_id', 'id');
    }
}
