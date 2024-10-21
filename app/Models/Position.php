<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Position
 *
 * This model represents a position entity in the application.
 * It defines the fillable attributes and the relationships with the Company, HierarchyLevel, and User models.
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

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey  = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['id', 'name', 'company_id', 'hierarchy_level'];

    /**
     * Get the company that owns the position.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    /**
     * Get the hierarchy level that owns the position.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hierarchyLevel()
    {
        return $this->belongsTo(HierarchyLevel::class, 'hierarchy_level', 'level');
    }

    /**
     * Get the users associated with the position.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function employees()
    {
        return $this->hasMany(Employee::class, 'position_id', 'id');
    }
}