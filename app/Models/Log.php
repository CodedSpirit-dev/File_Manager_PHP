<?php

// app/Models/Log.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $table = 'logs';

    /**
     * Indica si el modelo debe mantener las marcas de tiempo.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Desactiva los atributos CREATED_AT y UPDATED_AT.
     */
    const CREATED_AT = null;
    const UPDATED_AT = null;

    /**
     * Los atributos que se pueden asignar en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'transaction_id',
        'description',
        'ip_address',
        'user_agent',
        'date',
    ];

    /**
     * Obtener el usuario (empleado) asociado con el registro.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(Employee::class, 'user_id');
    }

    /**
     * Accesor para obtener una descripción resumida.
     *
     * @return string
     */
    public function getSummaryAttribute()
    {
        return $this->description ? substr($this->description, 0, 50) . '...' : 'Sin descripción';
    }
}
