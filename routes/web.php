<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DirectorioController;
use App\Http\Controllers\Admin\RegisterEmployeeController;
use App\Http\Controllers\Admin\LoginController;
use App\Http\Controllers\Admin\EmployeeListController;
use App\Http\Controllers\Admin\RegisterCompanyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Página de inicio
Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Ruta /home que se muestra después del login (requiere autenticación)
Route::get('/home', function () {
    return Inertia::render('Dashboard');  // Asegúrate de que tengas una vista llamada "Dashboard"
})->middleware(['auth', 'verified'])->name('home');

// Crear empleado (vista)
Route::get('/createemployee', function () {
    return Inertia::render('Admin/CreateEmployee');
})->name('createemployee');

// Ruta protegida para la página de inicio (requiere autenticación y verificación)
Route::get('/', function () {
    return Inertia::render('Home');
})->middleware(['auth', 'verified'])->name('login');

// Ruta de prueba
Route::get('/test', function () {
    return Inertia::render('Test');
})->name('test');

// Rutas para el perfil del usuario (requiere autenticación)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rutas para la administración de empleados (requiere autenticación)
Route::group(['middleware' => 'auth'], function () {
    Route::get('/admin/employees/create', [RegisterEmployeeController::class, 'create'])->name('admin.employees.create');
    Route::post('/admin/employees/store', [RegisterEmployeeController::class, 'store'])->name('admin.employees.store');
    Route::post('/sgi/login', [LoginController::class, 'login'])->name('sgi.login');
});

// Ruta para el directorio
Route::post('/directorio', [DirectorioController::class, 'store'])->name('directorio.store');

// Ruta para listar empleados (API)
Route::get('/api/employeelist', [EmployeeListController::class, 'index'])->name('api.employeelist');

// Ruta para registrar una nueva empresa
Route::post('/admin/companies/store', [RegisterCompanyController::class, 'store'])->name('admin.companies.store');

// Autenticación
require __DIR__ . '/auth.php';
