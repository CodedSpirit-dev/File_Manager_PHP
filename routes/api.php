
<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin1\RegisterEmployeeController;


use App\Http\Controllers\CounterController;

Route::post('/increment', [CounterController::class, 'increment']);

