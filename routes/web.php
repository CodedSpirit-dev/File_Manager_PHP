<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\DirectorioController;
use App\Http\Controllers\HierarchyLevelController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\PositionPermissionsController; // Añadido
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Ruta principal /home después del login (requiere autenticación)
Route::get('/', function () {
    return Inertia::render('Home');
})->middleware(['auth:employee', 'verified'])->name('home');

// Ruta de prueba
Route::get('/test', function () {
    return Inertia::render('Test');
})->name('test');

// Rutas para el perfil del usuario (requiere autenticación)
Route::middleware('auth:employee')->group(function () {
    Route::get('/profile', [EmployeeController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [EmployeeController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [EmployeeController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [EmployeeController::class, 'destroy'])->name('profile.destroy');
});

// Rutas para el directorio
Route::post('/directorio', [DirectorioController::class, 'store'])->name('directorio.store');

// Rutas de autenticación para empleados
Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.submit');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

// Grupo de rutas API
Route::prefix('api')->name('api.')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::patch('/positions/{position}', [PositionController::class, 'update'])->name('positions.update'); // Añadido
    Route::get('/hierarchylevels', [HierarchyLevelController::class, 'index'])->name('hierarchylevels.index');
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');

    // Rutas para PositionPermissionsController
    Route::post('/positionpermissions', [PositionPermissionsController::class, 'store'])
        ->middleware('auth:employee')
        ->name('positionpermissions.store');

    Route::delete('/positionpermissions/{position_id}', [PositionPermissionsController::class, 'destroy'])
        ->middleware('auth:employee')
        ->name('positionpermissions.destroy');

    //Logs
    Route::get('/logs', [LogController::class, 'index'])->name('logs.index');
});


// Ruta para el perfil del empleado
Route::get('/admin/employees/profile', [EmployeeController::class, 'profile'])
    ->middleware('auth:employee')
    ->name('admin.employees.profile');

// Ruta para obtener la jerarquía del usuario
Route::middleware('auth:employee')->get('/user/hierarchy', [EmployeeController::class, 'getUserHierarchy'])->name('user.hierarchy');

// Rutas para la gestión de archivos
require base_path('routes/filemanager.php');
require base_path('routes/admin.php');
require base_path('routes/auth.php');
