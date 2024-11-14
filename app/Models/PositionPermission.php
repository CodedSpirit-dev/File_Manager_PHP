<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PositionPermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'position_id',
        'permission_id',
    ];

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
