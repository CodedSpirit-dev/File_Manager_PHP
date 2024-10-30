<?php

use App\Http\Controllers\Files\FileManagerController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DirectorioController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\RegisterCompanyController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\HierarchyLevelController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserPermissionsController;
use Illuminate\Foundation\Application;
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
})->middleware(['auth', 'verified'])->name('home');

// Ruta de prueba
Route::get('/test', function () {
    return Inertia::render('Test');
})->name('test');

// Rutas para el perfil del usuario (requiere autenticación)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [EmployeeController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [EmployeeController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [EmployeeController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [EmployeeController::class, 'destroy'])->name('profile.destroy');
});

// Rutas para el directorio
Route::post('/directorio', [DirectorioController::class, 'store'])->name('directorio.store');

// Rutas de autenticación
require __DIR__ . '/auth.php';

// Grupo de rutas de administración (requiere autenticación)
Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    // Administración de empleados
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees/store', [EmployeeController::class, 'store'])->name('employees.store');

    // Inicio de sesión SGI
    Route::post('/sgi/login', [LoginController::class, 'login'])->name('sgi.login');

    // Registro de empresa
    Route::post('/companies/store', [RegisterCompanyController::class, 'store'])->name('companies.store');
});

// Grupo de rutas API
Route::prefix('api')->name('api.')->group(function () {
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/positions', [PositionController::class, 'index'])->name('positions.index');
    Route::post('/positions', [PositionController::class, 'store'])->name('positions.store');
    Route::get('/hierarchylevels', [HierarchyLevelController::class, 'index'])->name('hierarchylevels.index');
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/userpermissions', [UserPermissionsController::class, 'store'])->name('userpermissions.store');
});

// Ruta para el perfil del empleado
Route::get('/admin/employees/profile', [EmployeeController::class, 'profile'])->middleware('auth');


Route::get('/files', [FileManagerController::class, 'index']);
Route::post('/files/upload', [FileManagerController::class, 'upload']);
Route::delete('/files/delete/{filename}', [FileManagerController::class, 'delete']);
Route::post('/files/createfolder', [FileManagerController::class, 'createFolder']);
Route::middleware('auth:sanctum')->get('/user/hierarchy', [EmployeeController::class, 'getUserHierarchy']);
