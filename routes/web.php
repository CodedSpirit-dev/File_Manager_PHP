<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DirectorioController;
use App\Http\Controllers\admin\RegisterEmployeeController;

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/home', function () {
    return Inertia::render('Home');
}) ->name('home');

Route::get('/createemployee', function () {
    return Inertia::render('Admin/CreateEmployee');
}) ->name('createemployee');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/test', function () {
    return Inertia::render('Test');
}) ->name('test');

use App\Http\Controllers\Admin\LoginController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::group(['middleware' => 'auth'], function () {
    Route::get('/admin/employees/create', [RegisterEmployeeController::class, 'create'])->name('admin.employees.create');
    Route::post('/admin/employees/store', [RegisterEmployeeController::class, 'store'])->name('admin.employees.store');
    Route::post('/sgi/login', [LoginController::class, 'login'])->name('sgi.login');
});

Route::post('/directorio', [DirectorioController::class, 'store'])->name('directorio.store');


Route::get('/admin/employees/create', [\App\Http\Controllers\admin\RegisterEmployeeController::class, 'create'])->name('admin.employees.create');
Route::post('/admin/employees/store', [\App\Http\Controllers\admin\RegisterEmployeeController::class, 'store'])->name('admin.employees.store');

use App\Http\Controllers\Admin\EmployeeListController;

Route::get('/api/employeelist', [EmployeeListController::class,'index']);

require __DIR__.'/auth.php';
