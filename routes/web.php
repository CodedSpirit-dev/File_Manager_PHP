<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\DirectorioController;
use App\Http\Controllers\EmployeePermissionsController;
use App\Http\Controllers\HierarchyLevelController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PositionController;
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

// Grupo de rutas de administración (requiere autenticación)
Route::middleware('auth:employee')->prefix('admin')->name('admin.')->group(function () {
    // Administración de empleados
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees/store', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{id}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update'); // o usar PUT

    // Administración de empresas
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies/store', [CompanyController::class, 'store'])->name('companies.store');
});

// Grupo de rutas API
Route::prefix('api')->name('api.')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::get('/hierarchylevels', [HierarchyLevelController::class, 'index'])->name('hierarchylevels.index');
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/userpermissions', [EmployeePermissionsController::class, 'store'])->name('userpermissions.store');
    Route::get('/employees/{id}/permissions', [EmployeeController::class, 'getPermissions'])->name('employees.permissions');
});

// Ruta para el perfil del empleado
Route::get('/admin/employees/profile', [EmployeeController::class, 'profile'])->middleware('auth:employee')->name('admin.employees.profile');

// Ruta para obtener la jerarquía del usuario
Route::middleware('auth:employee')->get('/user/hierarchy', [EmployeeController::class, 'getUserHierarchy'])->name('user.hierarchy');

// Rutas para la gestión de archivos
require base_path('routes/filemanager.php');
