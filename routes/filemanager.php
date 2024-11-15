<?php

use App\Http\Controllers\Files\FileManagerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| File Manager Routes
|--------------------------------------------------------------------------
|
| Aquí se registran todas las rutas relacionadas con la gestión de
| archivos y carpetas. Estas rutas están agrupadas bajo el prefijo
| 'filemanager' y utilizan el controlador FileManagerController.
|
*/

// Rutas para archivos
Route::prefix('filemanager/files')->group(function () {
    Route::get('/', [FileManagerController::class, 'getFiles']);
    Route::post('/upload', [FileManagerController::class, 'upload']);
    Route::post('/delete', [FileManagerController::class, 'delete']);
    Route::get('/download', [FileManagerController::class, 'downloadFile']);
    Route::get('/view', [FileManagerController::class, 'view']);
});

// Rutas para carpetas
Route::prefix('filemanager/folders')->group(function () {
    Route::post('/create', [FileManagerController::class, 'createFolder']);
    Route::post('/delete', [FileManagerController::class, 'deleteFolder']);
    Route::post('/upload-directory', [FileManagerController::class, 'uploadDirectory']);
    Route::get('/download', [FileManagerController::class, 'downloadFolder']);
});

// Rutas para operaciones de renombrar, copiar y mover
Route::post('/filemanager/rename', [FileManagerController::class, 'renameItem']);
Route::post('/filemanager/items/copy', [FileManagerController::class, 'copyItems']);
Route::post('/filemanager/items/move', [FileManagerController::class, 'moveItems']);

// Ruta para obtener el árbol de archivos
Route::get('/filemanager/files-tree', [FileManagerController::class, 'getFilesTree']);

//Ruta para obtener la compa;ia y la jerarquia de la carpeta
Route::get('/filemanager/hierarchy-company', [FileManagerController::class, 'fetchHierarchyAndCompany']);
