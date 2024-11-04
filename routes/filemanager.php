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

Route::prefix('filemanager')->name('filemanager.')->middleware('auth:employee')->group(function () {
    // Ruta para listar archivos y carpetas
    Route::get('/files', [FileManagerController::class, 'index'])->name('files.index');

    // Ruta para subir archivos
    Route::post('/files/upload', [FileManagerController::class, 'upload'])->name('files.upload');

    // Ruta para eliminar archivos
    Route::delete('/files/delete', [FileManagerController::class, 'delete'])->name('files.delete');

    // Ruta para crear carpetas
    Route::post('/folders/create', [FileManagerController::class, 'createFolder'])->name('folders.create');

    // Ruta para actualizar (renombrar) carpetas
    Route::put('/folders/update', [FileManagerController::class, 'updateFolder'])->name('folders.update');

    // Ruta para descargar archivos
    Route::get('/files/download', [FileManagerController::class, 'download'])->name('files.download');

    // Ruta para subir directorios
    Route::post('/folders/upload-directory', [FileManagerController::class, 'uploadDirectory'])->name('folders.uploadDirectory');

    // Ruta para eliminar carpetas
    Route::delete('/folders/delete', [FileManagerController::class, 'deleteFolder'])->name('folders.delete');

    // Ruta para ver archivos
    Route::get('/filemanager/files/view', [FileManagerController::class, 'view']);

});
