<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\HierarchyLevel;

/**
 * Class Position
 *
 * Este modelo representa una posición en la aplicación.
 * Define los atributos rellenables y las relaciones con Company, HierarchyLevel, Employee y Permission.
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $name
 * @property int $company_id
 * @property int $hierarchy_level
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Position newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Position newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Position query()
 *
 * @mixin \Eloquent
 */
class Position extends Model
{
    use HasFactory;

    protected $table = 'positions';

    /**
     * La clave primaria asociada con la tabla.
     *
     * @var string
     */
    protected $primaryKey  = 'id';

    /**
     * Indica si las claves son auto-incrementales.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * Los atributos que se pueden asignar en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = ['id', 'name', 'company_id', 'hierarchy_level'];

    /**
     * Obtener la empresa asociada con la posición.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    /**
     * Obtener el nivel jerárquico asociado con la posición.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hierarchy_level_detail()
    {
        return $this->belongsTo(HierarchyLevel::class, 'hierarchy_level', 'level');
    }

    /**
     * Obtener los empleados asociados con la posición.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function employees()
    {
        return $this->hasMany(Employee::class, 'position_id', 'id');
    }

    /**
     * Obtener los permisos asociados con la posición.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'position_permissions', 'position_id', 'permission_id');
    }
}
