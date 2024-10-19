<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Class User
 *
 * This model represents a user entity in the application.
 * It defines the fillable attributes and the relationships with the Position, Company, and HierarchyLevel models.
 *
 * @package App\Models
 *
 * @property string $first_name
 * @property string $last_name
 * @property int $position_id
 * @property int $hierarchy_level
 * @property string $username
 * @property string $password
 * @property \Illuminate\Support\Carbon $registered_at
 * @property int $company_id
 *
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 *
 * @mixin \Eloquent
 */
class Employee extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'position_id',
        'hierarchy_level',
        'username',
        'password',
        'registered_at',
        'company_id',
    ];

    /**
     * Get the position that owns the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id', 'id');
    }

    /**
     * Get the company that owns the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id', 'id');
    }

    /**
     * Get the hierarchy level that owns the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hierarchyLevel()
    {
        return $this->belongsTo(HierarchyLevel::class, 'hierarchy_level', 'level');
    }
}