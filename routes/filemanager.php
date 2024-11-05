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
    Route::get('/files/download', [FileManagerController::class, 'downloadFile'])->name('files.download');

    // Ruta para renombrar archivos
    Route::post('/files/rename-file', [FileManagerController::class, 'renameFile'])->name('files.renameFile');

    // Ruta para copiar archivos
    Route::post('/files/copy-file', [FileManagerController::class, 'copyFile'])->name('files.copyFile');

    // Ruta para mover archivos
    Route::post('/files/move-file', [FileManagerController::class, 'moveFile'])->name('files.moveFile');

    // Ruta para subir directorios
    Route::post('/folders/upload-directory', [FileManagerController::class, 'uploadDirectory'])->name('folders.uploadDirectory');

    // Ruta para eliminar carpetas
    Route::delete('/folders/delete', [FileManagerController::class, 'deleteFolder'])->name('folders.delete');

    // Ruta para ver archivos
    Route::get('/files/view', [FileManagerController::class, 'view'])->name('files.view');

    // Ruta para obtener la URL pública de un archivo
    Route::get('/public-file-url', [FileManagerController::class, 'getPublicFileUrl'])->name('files.getPublicFileUrl');

    // Ruta para servir un archivo públicamente
    Route::get('/public-file', [FileManagerController::class, 'getPublicFile'])->name('files.getPublicFile');

    // Ruta para descargar carpetas como ZIP
    Route::get('/folders/download', [FileManagerController::class, 'downloadFolder'])->name('folders.download');

    // Ruta para obtener toda la estructura de archivos y carpetas
    Route::get('/files-tree', [FileManagerController::class, 'getFilesTree'])->name('files.tree');

});
