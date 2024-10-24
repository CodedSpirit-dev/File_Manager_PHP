
<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\RegisterEmployeeController;


use App\Http\Controllers\CounterController;

Route::post('/increment', [CounterController::class, 'increment']);

