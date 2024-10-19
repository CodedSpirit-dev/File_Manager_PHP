<?php
/**
 * Class Permission
 *
 * This model represents a permission entity in the application.
 * It defines the fillable attributes and the relationship with the HierarchyLevel model.
 *
 * @package App\Models
 *
 * @property int $hierarchy_level
 * @property bool $can_view
 * @property bool $can_download
 * @property bool $can_view_files
 * @property bool $can_upload_files
 * @property bool $can_create_folders
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
        'hierarchy_level',
        'can_view',
        'can_download',
        'can_view_files',
        'can_upload_files',
        'can_create_folders',
    ];

    public function hierarchyLevel()
    {
        return $this->belongsTo(HierarchyLevel::class, 'hierarchy', 'level');
    }
}