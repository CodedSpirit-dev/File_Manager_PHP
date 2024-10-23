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

   // Relación con la tabla 'companies'
   public function company()
   {
       return $this->belongsTo(Company::class);
   }

   // Relación con la tabla 'positions' para obtener el nombre del puesto
   public function position()
   {
       return $this->belongsTo(Position::class, 'position_id', 'id');
   }

   // Relación con la tabla 'hierarchies' para obtener el nivel jerárquico
   public function hierarchy()
   {
       return $this->belongsTo(HierarchyLevel::class, 'hierarchy_level', 'level');
   }

   public function create()
   {
       // Obtener todas las empresas, posiciones y niveles jerárquicos
       $companies = Company::all(['id', 'name']); // Obtener solo los campos id y name de las empresas
       $positions = Position::all(['id', 'name']); // Obtener solo los campos id y name de los puestos
       $hierarchies = HierarchyLevel::all(['level', 'name']); // Obtener solo el nivel y nombre de la jerarquía

       // Pasar los datos de las empresas, posiciones y jerarquías a la vista
       return inertia('CreateEmployee', [
           'companies' => $companies,
           'positions' => $positions,
           'hierarchies' => $hierarchies,
       ]);
   }
}
