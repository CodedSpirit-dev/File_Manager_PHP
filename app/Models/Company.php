<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Class Company
 *
 * This model represents a company entity in the application.
 * It defines the fillable attributes and the relationships with the User and Position models.
 *
 * @package App\Models
 *
 * @property string $id
 * @property string $name
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Company newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Company newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Company query()
 *
 * @mixin \Eloquent
 */
class Company extends Model
{
    use HasFactory;

    protected $table = 'companies'; // Indica que utilizarás la tabla 'companies'

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
    protected $fillable = ['id', 'name'];

    /**
     * Get the users associated with the company.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function employees()
    {
        return $this->hasManyThrough(Employee::class, Position::class, 'company_id', 'position_id', 'id', 'id');
    }


    /**
     * Get the positions associated with the company.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function positions()
    {
        return $this->hasMany(Position::class, 'company_id', 'id');
    }

    /**
     * Cascade delete positions when a company is deleted.
     *
     * @return void
     */
    protected static function booted()
    {
        static::deleting(function ($company) {
            $company->positions()->delete();
        });
    }
}
