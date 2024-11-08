<?php

use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\EmployeeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:employee')->prefix('admin')->name('admin.')->group(function () {
    // Administración de empleados
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{id}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::put('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');
    // O puedes usar PATCH si prefieres actualizaciones parciales:
    // Route::patch('/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');

    // Administración de empresas
    Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
    Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
    Route::get('/companies/{id}/edit', [CompanyController::class, 'edit'])->name('companies.edit');
    Route::put('/companies/{id}', [CompanyController::class, 'update'])->name('companies.update');
    Route::delete('/companies/{id}', [CompanyController::class, 'destroy'])->name('companies.destroy');
    // O puedes usar PATCH si prefieres actualizaciones parciales:
    // Route::patch('/companies/{id}', [CompanyController::class, 'update'])->name('companies.update');
});
