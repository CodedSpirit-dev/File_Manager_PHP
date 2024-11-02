// src/components/FileManager/FileManager.tsx

import React, { useState, useEffect } from 'react';
import FileManagerToolbar from './Components/Toolbar';
import Modal from './Components/Modal';
import { FaFolder, FaFile } from 'react-icons/fa';
import {
    getFiles,
    uploadFile,
    deleteFile,
    createFolder,
    uploadDirectory,
    deleteFolder,
} from './api';
import { usePage } from '@inertiajs/react';
import axios from "axios";

interface Item {
    id: number;
    name: string;
    type: 'file' | 'folder';
    date: Date;
}

async function copyItem(name: string, currentPath: string) {

}

async function renameItem(name: string, currentPath: string) {

}

async function moveItem(name: string, currentPath: string) {

}
const FileManager: React.FC = () => {
    const { auth } = usePage().props;
    const userPermissions: string[] = auth.user?.permissions || [];

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('public'); // Ruta inicial
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');

    // Obtener archivos y carpetas al cargar o cambiar de ruta
    useEffect(() => {
        fetchFiles();
    }, [currentPath]);

    const fetchFiles = async () => {
        try {
            const data = await getFiles(currentPath);
            const formattedItems = formatItems(data.directories, data.files);
            setItems(formattedItems);
        } catch (error) {
            console.error('Error al obtener archivos:', error);
            alert('Error al obtener archivos.');
        }
    };

    // Formatear los datos recibidos del servidor
    const formatItems = (directories: string[], files: string[]): Item[] => {
        let idCounter = 1;
        const formattedDirectories = directories.map(dir => ({
            id: idCounter++,
            name: dir.split('/').pop() || dir,
            type: 'folder' as 'folder',
            date: new Date(), // Ajusta si tienes la fecha real
        }));

        const formattedFiles = files.map(file => ({
            id: idCounter++,
            name: file.split('/').pop() || file,
            type: 'file' as 'file',
            date: new Date(), // Ajusta si tienes la fecha real
        }));

        return [...formattedDirectories, ...formattedFiles];
    };

    // Función para verificar permisos
    const hasPermission = (permission: string): boolean => {
        return userPermissions.includes(permission);
    };

    // Manejo de selección de ítems
    const handleSelectItem = (itemName: string) => {
        setSelectedItem(prev => (prev === itemName ? null : itemName));
    };

    // Manejo de doble clic para abrir carpeta o archivo
    const handleDoubleClickItem = (item: Item) => {
        if (item.type === 'folder') {
            setCurrentPath(`${currentPath}/${item.name}`);
        } else {
            // Implementar lógica para abrir o visualizar el archivo si es necesario
            alert(`Abrir archivo: ${item.name}`);
        }
    };

    // Manejo de navegación hacia atrás
    const handleNavigateBack = () => {
        const paths = currentPath.split('/');
        if (paths.length > 1) {
            paths.pop();
            setCurrentPath(paths.join('/'));
        }
    };

    // Funciones de manejo de acciones desde la toolbar
    const handleCreateFolderAction = () => {
        setIsCreateFolderOpen(true);
    };

    const handleConfirmCreateFolder = async () => {
        if (newFolderName.trim() === '') {
            alert('El nombre de la carpeta no puede estar vacío.');
            return;
        }

        try {
            const response = await createFolder(newFolderName, currentPath);
            alert(response.message);

            // Actualizar la lista de ítems
            fetchFiles();

            setNewFolderName('');
            setIsCreateFolderOpen(false);
        } catch (error) {
            alert('Error al crear la carpeta.');
            console.error(error);
        }
    };

    const handleUploadFolderAction = async () => {
        const folderInput = document.createElement('input');
        folderInput.type = 'file';
        folderInput.webkitdirectory = true; // Habilitar selección de directorio
        folderInput.onchange = async () => {
            if (folderInput.files && folderInput.files.length > 0) {
                try {
                    const response = await uploadDirectory(folderInput.files, currentPath);
                    alert(response.message);
                    // Actualizar la lista de ítems
                    fetchFiles();
                } catch (error) {
                    alert('Error al subir la carpeta.');
                    console.error(error);
                }
            }
        };
        folderInput.click();
    };

    const handleCopy = async () => {
        if (selectedItem) {
            const item = items.find(i => i.name === selectedItem);
            if (item) {
                try {
                    const response = await copyItem(item.name, currentPath);
                    alert('No se ha implementado la copia de elementos.');
                } catch (error) {
                    alert('Error al copiar el elemento.');
                    console.error(error);
                }
            }
        }
    }

    const handleMove = async () => {
        if (selectedItem) {
            const item = items.find(i => i.name === selectedItem);
            if (item) {
                try {
                    const response = await moveItem(item.name, currentPath);
                    alert('No se ha implementado el movimiento de elementos.');
                } catch (error) {
                    alert('Error al mover el elemento.');
                    console.error(error);
                }
            }
        }
    }

    const handleRename = async () => {
        if (selectedItem) {
            const item = items.find(i => i.name === selectedItem);
            if (item) {
                try {
                    const response = await renameItem(item.name, currentPath);
                    alert('No se ha implementado la renombrar elementos.');
                } catch (error) {
                    alert('Error al renombrar el elemento.');
                    console.error(error);
                }
            }
        }
    }
    const handleUploadFileAction = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files[0]) {
                try {
                    const response = await uploadFile(fileInput.files[0], currentPath);
                    alert(response.message);
                    // Actualizar la lista de ítems
                    fetchFiles();
                } catch (error) {
                    alert('Error al subir el archivo.');
                    console.error(error);
                }
            }
        };
        fileInput.click();
    };

    const handleDownloadFileAction = async () => {
        if (selectedItem) {
            const item = items.find(i => i.name === selectedItem);
            if (item && item.type === 'file') {
                try {
                    const response = await axios.get(`/filemanager/files/download`, {
                        params: {
                            filename: selectedItem,
                            path: currentPath,
                        },
                        responseType: 'blob',
                    });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', selectedItem);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                } catch (error) {
                    alert('Error al descargar el archivo.');
                    console.error(error);
                }
            } else {
                alert('Por favor, selecciona un archivo para descargar.');
            }
        }
    };

    const handleDeleteAction = async () => {
        if (selectedItem) {
            const confirmDelete = window.confirm(`¿Estás seguro de eliminar "${selectedItem}"?`);
            if (confirmDelete) {
                try {
                    const item = items.find(i => i.name === selectedItem);
                    if (item) {
                        if (item.type === 'file') {
                            const response = await deleteFile(selectedItem, currentPath);
                            alert(response.message);
                        } else if (item.type === 'folder') {
                            const response = await deleteFolder(selectedItem, currentPath);
                            alert(response.message);
                        }

                        // Actualizar la lista de ítems
                        fetchFiles();
                        setSelectedItem(null);
                    }
                } catch (error) {
                    alert('Error al eliminar el elemento.');
                    console.error(error);
                }
            }
        }
    };

    const handleSort = (criteria: 'date' | 'name') => {
        // Ordenar en el frontend
        const sortedItems = [...items].sort((a, b) => {
            if (criteria === 'date') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        setItems(sortedItems);
    };

    return (
        <div className="file-manager bg-white">
            {/* Barra de navegación para volver */}
            <div className="flex items-center p-4 bg-gray-100 shadow">
                <button
                    className={`btn btn-secondary mr-2 ${currentPath === 'public' ? 'btn-disabled' : ''}`}
                    onClick={handleNavigateBack}
                    disabled={currentPath === 'public'}
                >
                    Volver
                </button>
                <span className="text-lg font-semibold">Ruta: /{currentPath}</span>
            </div>

            {/* Cinta de opciones */}
            <FileManagerToolbar
                onCreateFolder={handleCreateFolderAction}
                onUploadFolder={handleUploadFolderAction}
                onUploadFile={handleUploadFileAction}
                onDownloadFile={handleDownloadFileAction}
                onDelete={handleDeleteAction}
                onSort={handleSort}
                isItemSelected={selectedItem !== null}
                hasPermission={hasPermission}
             onCopy={handleCopy} onMove={handleMove} onRename={handleRename}/>

            {/* Modal para Crear Nueva Carpeta */}
            <Modal
                isOpen={isCreateFolderOpen}
                title="Crear Nueva Carpeta"
                onClose={() => setIsCreateFolderOpen(false)}
            >
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nombre de la carpeta"
                    className="input input-bordered w-full"
                />
                <div className="flex justify-end mt-4 space-x-2">
                    <button className="btn btn-secondary" onClick={() => setIsCreateFolderOpen(false)}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={handleConfirmCreateFolder}>
                        Crear
                    </button>
                </div>
            </Modal>

            {/* Lista de ítems */}
            <div className="p-4">
                {items.length === 0 ? (
                    <p>No hay archivos o carpetas disponibles.</p>
                ) : (
                    <ul className="grid grid-cols-4 gap-4">
                        {items.map(item => (
                            <li
                                key={item.id}
                                className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${
                                    selectedItem === item.name ? 'bg-blue-100' : 'bg-white'
                                } hover:bg-gray-200 transition-colors duration-200`}
                                onClick={() => handleSelectItem(item.name)}
                                onDoubleClick={() => handleDoubleClickItem(item)}
                            >
                                {/* Ícono representativo */}
                                <span className="text-4xl">
                                    {item.type === 'folder' ? <FaFolder /> : <FaFile />}
                                </span>
                                <span className="mt-2 text-center truncate w-full">{item.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FileManager;
