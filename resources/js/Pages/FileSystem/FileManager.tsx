// src/components/FileManager/FileManager.tsx

import React, { useState, useEffect } from 'react';
import FileManagerToolbar from './Components/Toolbar';
import Modal from './Components/Modal';
import FileViewer from './Components/FileViewer';
import { FaFolder, FaFile } from 'react-icons/fa';
import {
    getFiles,
    uploadFile,
    deleteFile,
    createFolder,
    uploadDirectory,
    deleteFolder, updateFolder,
} from './api';
import { usePage } from '@inertiajs/react';
import axios from "axios";

interface Item {
    id: number;
    name: string;
    type: 'file' | 'folder';
    date: Date;
}

const FileManager: React.FC = () => {
    const { auth } = usePage().props;
    const userPermissions: string[] = auth.user?.permissions || [];

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('public'); // Ruta inicial
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);
    const [fileToView, setFileToView] = useState<{ url: string; type: 'pdf' | 'docx' | 'xlsx' | null } | null>(null);

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

    // Mover esta función dentro de FileManager para acceder al estado
    const handleNavigateBack = () => {
        const paths = currentPath.split('/');
        if (paths.length > 1) {
            paths.pop(); // Elimina el último segmento de la ruta
            setCurrentPath(paths.join('/')); // Actualiza el estado con la nueva ruta
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
            // Obtener la extensión del archivo
            const extension = item.name.split('.').pop()?.toLowerCase();
            let fileType: 'pdf' | 'docx' | 'xlsx' | null = null;

            if (extension === 'pdf') {
                fileType = 'pdf';
            } else if (extension === 'docx') {
                fileType = 'docx';
            } else if (extension === 'xlsx') {
                fileType = 'xlsx';
            } else {
                alert('Tipo de archivo no soportado para visualización.');
                return;
            }

            // Construir la URL del archivo
            const fileUrl = `/filemanager/files/view?filename=${encodeURIComponent(item.name)}&path=${encodeURIComponent(currentPath)}`;

            // Establecer el estado para mostrar el FileViewer
            setFileToView({ url: fileUrl, type: fileType });
            setIsFileViewerOpen(true);
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
        folderInput.webkitdirectory = true; // Habilita la selección de directorio
        folderInput.onchange = async () => {
            if (folderInput.files && folderInput.files.length > 0) {
                try {
                    const response = await uploadDirectory(folderInput.files, currentPath);
                    alert(response.message);
                    fetchFiles(); // Actualizar lista de ítems
                } catch (error) {
                    alert('Error al subir la carpeta.');
                    console.error(error);
                }
            }
        };
        folderInput.click();
    };

    const handleUploadFileAction = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files[0]) {
                try {
                    const response = await uploadFile(fileInput.files[0], currentPath);
                    alert(response.message);
                    fetchFiles(); // Actualizar lista de ítems
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
                        params: { filename: selectedItem, path: currentPath },
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
                        let response;
                        if (item.type === 'file') {
                            response = await deleteFile(selectedItem, currentPath);
                        } else if (item.type === 'folder') {
                            response = await deleteFolder(selectedItem, currentPath);
                        }
                        alert(response.message);
                        fetchFiles(); // Actualizar lista de ítems
                        setSelectedItem(null);
                    }
                } catch (error) {
                    alert('Error al eliminar el elemento.');
                    console.error(error);
                }
            }
        }
    };

    const handleCopy = async () => {
        if (selectedItem) {
            alert('Funcionalidad de copiar aún no implementada.');
            // Aquí podrías implementar la lógica para copiar el archivo
        }
    };

    const handleMove = async () => {
        if (selectedItem) {
            alert('Funcionalidad de mover aún no implementada.');
            // Aquí podrías implementar la lógica para mover el archivo
        }
    };

    const handleRename = async () => {
        if (selectedItem) {
            const newName = prompt(`Ingresa el nuevo nombre para "${selectedItem}":`);
            if (newName && newName.trim() !== '') {
                try {
                    const item = items.find(i => i.name === selectedItem);
                    if (item) {
                        let response;
                        if (item.type === 'folder') {
                            response = await updateFolder(item.name, newName, currentPath);
                        } else {
                            alert('Renombrar archivos aún no está implementado.');
                            return;
                        }
                        alert(response.message);
                        fetchFiles(); // Actualizar lista de ítems
                        setSelectedItem(null);
                    }
                } catch (error) {
                    alert('Error al renombrar el elemento.');
                    console.error(error);
                }
            }
        }
    };

    const handleSort = (criteria: 'date' | 'name') => {
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
                onCopy={handleCopy}
                onMove={handleMove}
                onRename={handleRename}
            />

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

            {/* Modal para Visualizar Archivos */}
            {isFileViewerOpen && fileToView && fileToView.type && (
                <Modal
                    isOpen={isFileViewerOpen}
                    title={`Visualizando: ${selectedItem}`}
                    onClose={() => setIsFileViewerOpen(false)}
                >
                    <div className="h-96 overflow-auto">
                        <FileViewer fileUrl={fileToView.url} fileType={fileToView.type} />
                    </div>
                </Modal>
            )}

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
