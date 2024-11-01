<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'permission_id',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }
}
