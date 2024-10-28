<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Company;
use App\Models\Position;
use App\Models\HierarchyLevel;

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

    public static function find(int $int)
    {
        return parent::find($int);
    }

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

   // Relación con la tabla 'positions' para obtener el nombre del puesto
   public function position()
   {
       return $this->belongsTo(Position::class, 'position_id', 'id');
   }

   public function company()
    {
         return $this->hasOneThrough(Company::class, Position::class, 'id', 'id', 'position_id', 'company_id');
    }
    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class, 'employee_id', 'id');
    }

   public function create()
   {
       $positions = Position::all(['id', 'name']);

       return inertia('CreateEmployee', [
           'positions' => $positions
       ]);
   }
}
