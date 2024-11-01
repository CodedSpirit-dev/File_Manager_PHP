// src/api/fileManagerApi.ts
import axios from "axios";

const FILEMANAGER_PREFIX = '/filemanager';

/**
 * Obtener archivos y carpetas.
 * @param {string} path - Ruta para listar archivos y carpetas.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const getFiles = async (path: string): Promise<any> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/files`, {
            params: { path }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener archivos:', error);
        throw error;
    }
};

/**
 * Subir un archivo.
 * @param {File} file - Archivo a subir.
 * @param {string} path - Ruta donde se subirá el archivo.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const uploadFile = async (file: File, path: string): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        const response = await axios.post(`${FILEMANAGER_PREFIX}/files/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
    }
};

/**
 * Eliminar un archivo.
 * @param {string} filename - Nombre del archivo a eliminar.
 * @param {string} path - Ruta donde se encuentra el archivo.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const deleteFile = async (filename: string, path: string): Promise<any> => {
    try {
        const response = await axios.delete(`${FILEMANAGER_PREFIX}/files/delete`, {
            data: { filename, path }
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        throw error;
    }
};

/**
 * Crear una carpeta.
 * @param {string} folderName - Nombre de la carpeta a crear.
 * @param {string} path - Ruta donde se creará la carpeta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const createFolder = async (folderName: string, path: string): Promise<any> => {
    try {
        const response = await axios.post(`${FILEMANAGER_PREFIX}/folders/create`, {
            folder_name: folderName,
            path
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear carpeta:', error);
        throw error;
    }
};

/**
 * Actualizar (renombrar) una carpeta.
 * @param {string} oldFolderName - Nombre actual de la carpeta.
 * @param {string} newFolderName - Nuevo nombre para la carpeta.
 * @param {string} path - Ruta donde se encuentra la carpeta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const updateFolder = async (oldFolderName: string, newFolderName: string, path: string): Promise<any> => {
    try {
        const response = await axios.put(`${FILEMANAGER_PREFIX}/folders/update`, {
            old_folder_name: oldFolderName,
            new_folder_name: newFolderName,
            path
        });
        return response.data;
    } catch (error) {
        console.error('Error al renombrar carpeta:', error);
        throw error;
    }
};

/**
 * Obtener permisos del usuario.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const getUserPermissions = async (): Promise<any> => {
    try {
        const response = await axios.get('/api/user/permissions');
        return response.data;
    } catch (error) {
        console.error('Error al obtener permisos del usuario:', error);
        throw error;
    }
};
