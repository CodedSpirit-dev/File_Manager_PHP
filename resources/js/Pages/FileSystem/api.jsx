import axios from 'axios';

// Configurar Axios para incluir credenciales si estás utilizando cookies de sesión
axios.defaults.withCredentials = true;

// Definir el prefijo para las rutas de FileManager
const FILEMANAGER_PREFIX = '/filemanager';

/**
 * Obtener archivos y carpetas.
 * @param {string} path - Ruta para listar archivos y carpetas.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const getFiles = async (path = 'public') => {
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
export const uploadFile = async (file, path) => {
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
export const deleteFile = async (filename, path) => {
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
export const createFolder = async (folderName, path) => {
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
 * Actualizar una carpeta (renombrar).
 * @param {string} oldFolderName - Nombre actual de la carpeta.
 * @param {string} newFolderName - Nuevo nombre para la carpeta.
 * @param {string} path - Ruta donde se encuentra la carpeta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const updateFolder = async (oldFolderName, newFolderName, path) => {
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
 * Obtener la jerarquía del usuario.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const getUserHierarchy = async () => {
    try {
        const response = await axios.get('/user/hierarchy');
        return response.data;
    } catch (error) {
        console.error('Error al obtener jerarquía del usuario:', error);
        throw error;
    }
};
