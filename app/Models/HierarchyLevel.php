<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class HierarchyLevel
 *
 * This model represents a hierarchy level entity in the application.
 * It defines the fillable attributes and the relationships with the User and Position models.
 *
 * @package App\Models
 *
 * @property int $level
 * @property string $name
 *
 * @method static \Illuminate\Database\Eloquent\Builder|HierarchyLevel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|HierarchyLevel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|HierarchyLevel query()
 *
 * @mixin \Eloquent
 */
class HierarchyLevel extends Model
{
    use HasFactory;

    protected $table = 'hierarchy_levels';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey  = 'level';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['level', 'name'];

    /**
     * Get the users associated with the hierarchy level.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function employees()
    {
        return $this->hasMany(Employee::class, 'hierarchy_level', 'level');
    }

    /**
     * Get the positions associated with the hierarchy level.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function positions()
    {
        return $this->hasMany(Position::class, 'hierarchy_level', 'level');
    }
}
