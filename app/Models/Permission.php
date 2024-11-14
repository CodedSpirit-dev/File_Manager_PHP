<?php
/**
 * Class Permission
 *
 * Este modelo representa una entidad de permiso en la aplicación.
 * Define los atributos rellenables y la relación con el modelo PositionPermission.
 *
 * @package App\Models
 *
 * @property string $name
 * @property string $description
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission query()
 *
 * @mixin \Eloquent
 */
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    // Relación con PositionPermission
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'position_permissions', 'position_id', 'permission_id');
    }
}
