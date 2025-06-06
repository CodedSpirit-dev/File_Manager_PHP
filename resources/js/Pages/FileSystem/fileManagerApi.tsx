// src/api/fileManagerApi.ts

import axios from "axios";

// Configurar Axios para incluir credenciales si estás utilizando cookies de sesión
axios.defaults.withCredentials = true;

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
 * @param {boolean} overwrite - Si se debe sobrescribir el archivo si ya existe.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const uploadFile = async (file: File, path: string, overwrite: boolean = false): Promise<any> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);
        formData.append('overwrite', overwrite ? '1' : '0');

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
 * Subir una carpeta como directorio.
 * @param {FileList} files - Lista de archivos a subir.
 * @param {string} path - Ruta donde se subirá la carpeta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const uploadDirectory = async (files: FileList, path: string, overwrite: boolean = false): Promise<any> => {
    try {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            // Append each file with its relative path
            formData.append('files[]', file, file.webkitRelativePath);
        });
        formData.append('path', path); // Agregar el campo path
        formData.append('overwrite', overwrite ? '1' : '0');

        const response = await axios.post(`${FILEMANAGER_PREFIX}/folders/upload-directory`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al subir carpeta:', error);
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
        const response = await axios.post(`${FILEMANAGER_PREFIX}/files/delete`, {
            filename,
            path
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        throw error;
    }
};

/**
 * Eliminar una carpeta.
 * @param {string} folderName - Nombre de la carpeta a eliminar.
 * @param {string} path - Ruta donde se encuentra la carpeta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const deleteFolder = async (folderName: string, path: string): Promise<any> => {
    try {
        const response = await axios.post(`${FILEMANAGER_PREFIX}/folders/delete`, {
            folder_name: folderName,
            path
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar carpeta:', error);
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
 * Renombrar un archivo o carpeta.
 * @param {Object} data - Datos para renombrar.
 * @param {string} data.old_name - Nombre actual del archivo o carpeta.
 * @param {string} data.new_name - Nuevo nombre para el archivo o carpeta.
 * @param {string} data.path - Ruta donde se encuentra el archivo o carpeta.
 * @param {'file' | 'folder'} data.type - Tipo de elemento a renombrar.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const renameItem = async (data: {
    old_name: string;
    new_name: string;
    path: string;
    type: 'file' | 'folder';
}): Promise<any> => {
    try {
        const response = await axios.post(`${FILEMANAGER_PREFIX}/rename`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error al renombrar elemento:', error);
        throw error;
    }
};

/**
 * Copiar múltiples elementos (archivos y carpetas) a otra carpeta.
 * @param {Array} items - Lista de elementos a copiar.
 * @param {string} sourcePath - Ruta actual de los elementos.
 * @param {string} targetPath - Ruta de destino donde se copiarán los elementos.
 * @param {boolean} overwrite - Si se debe sobrescribir si ya existen.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const copyItems = async (
    items: { name: string; type: string }[],
    sourcePath: string,
    targetPath: string,
    overwrite: boolean = false
): Promise<any> => {
    try {
        const response = await axios.post(`${FILEMANAGER_PREFIX}/items/copy`, {
            items,
            source_path: sourcePath,
            target_path: targetPath,
            overwrite: overwrite ? true : false
        });
        return response.data;
    } catch (error) {
        console.error('Error al copiar elementos:', error);
        throw error;
    }
};

/**
 * Mover múltiples elementos (archivos y carpetas) a otra carpeta.
 * @param {Array} items - Lista de elementos a mover.
 * @param {string} sourcePath - Ruta actual de los elementos.
 * @param {string} targetPath - Ruta de destino donde se moverán los elementos.
 * @param {boolean} overwrite - Si se debe sobrescribir si ya existen.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const moveItems = async (
    items: { name: string; type: string }[],
    sourcePath: string,
    targetPath: string,
    overwrite: boolean = false
): Promise<any> => {
    try {
        const response = await axios.post(`${FILEMANAGER_PREFIX}/items/move`, {
            items,
            source_path: sourcePath,
            target_path: targetPath,
            overwrite: overwrite ? true : false
        });
        return response.data;
    } catch (error) {
        console.error('Error al mover elementos:', error);
        throw error;
    }
};

/**
 * Ver el contenido de un archivo.
 * @param {string} filename - Nombre del archivo a ver.
 * @param {string} path - Ruta donde se encuentra el archivo.
 * @returns {Promise<Blob>} - Archivo visualizable como Blob.
 */
export const viewFile = async (filename: string, path: string): Promise<Blob> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/files/view`, {
            params: { filename, path },
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error al ver archivo:', error);
        throw error;
    }
};

/**
 * Obtener la URL pública de un archivo.
 * @param {string} filename - Nombre del archivo.
 * @param {string} path - Ruta donde se encuentra el archivo.
 * @returns {Promise<Object>} - Objeto con la URL pública.
 */
export const getPublicFileUrl = async (filename: string, path: string): Promise<any> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/public-file-url`, {
            params: { filename, path }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener URL pública del archivo:', error);
        throw error;
    }
};

/**
 * Servir un archivo públicamente accesible.
 * @param {string} filename - Nombre del archivo.
 * @param {string} path - Ruta donde se encuentra el archivo.
 * @returns {Promise<Blob>} - Archivo descargado como Blob.
 */
export const getPublicFile = async (filename: string, path: string): Promise<Blob> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/public-file`, {
            params: { filename, path },
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener archivo público:', error);
        throw error;
    }
};

/**
 * Descargar una carpeta como archivo ZIP.
 * @param {string} folderName - Nombre de la carpeta a descargar.
 * @param {string} path - Ruta donde se encuentra la carpeta.
 * @returns {Promise<Blob>} - Archivo ZIP descargado como Blob.
 */
export const downloadFolder = async (folderName: string, path: string): Promise<Blob> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/folders/download`, {
            params: { folder_name: folderName, path },
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error('Error al descargar carpeta:', error);
        throw error;
    }
};

/**
 * Descargar un archivo específico.
 * @param {string} filename - Nombre del archivo a descargar.
 * @param {string} path - Ruta donde se encuentra el archivo.
 * @returns {Promise<Blob>} - Archivo descargado como Blob.
 */
export const downloadFile = async (filename: string, path: string): Promise<Blob> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/files/download`, {
            params: { filename, path },
            responseType: 'blob' // Importante para manejar la respuesta como Blob
        });
        return response.data;
    } catch (error) {
        console.error('Error al descargar archivo:', error);
        throw error;
    }
};

/**
 * Obtener toda la estructura de archivos y carpetas.
 * @returns {Promise<Object>} - Estructura de archivos y carpetas.
 */
export const getFilesTree = async (): Promise<any> => {
    try {
        const response = await axios.get(`${FILEMANAGER_PREFIX}/files-tree`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el árbol de archivos:', error);
        throw error;
    }
};
