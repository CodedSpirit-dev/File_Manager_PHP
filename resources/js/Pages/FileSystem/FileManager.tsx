// src/components/FileManager/FileManager.tsx

import React, { useState, useEffect, useCallback } from 'react';
import FileManagerToolbar from './Components/Toolbar';
import Modal from './Components/Modal';
import FileViewerModal from './Components/FileManagerModal';
import { FaFolder, FaFile } from 'react-icons/fa';
import {
    BsFiletypeAac,
    BsFiletypeAi,
    // ...otros iconos
} from 'react-icons/bs';
import {
    getFilesTree,
    uploadFile,
    deleteFile,
    createFolder,
    uploadDirectory,
    deleteFolder,
    downloadFile,
    renameFile,
    copyFile,
    moveFile,
    downloadFolder,
} from './fileManagerApi';
import { usePage } from '@inertiajs/react';
import Breadcrumb from "@/Pages/FileSystem/Components/Breadcrumb";

interface FileSystemItem {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileSystemItem[];
}

interface Item {
    id: number;
    name: string;
    type: 'file' | 'folder';
    date: Date;
    path: string;
}

interface SortPayload {
    criteria: 'name';
    order: 'asc' | 'desc';
}

const FileManager: React.FC = () => {
    const { auth } = usePage().props as any;
    const userPermissions: string[] = auth.user?.permissions || [];

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('public'); // Ruta inicial
    const [fileTree, setFileTree] = useState<FileSystemItem[]>([]); // Árbol completo

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);
    const [fileToView, setFileToView] = useState<{ url: string; type: 'pdf' | 'docx' | 'xlsx' } | null>(null);

    // Estados para manejar la acción de copiar
    const [isCopying, setIsCopying] = useState<boolean>(false);
    const [copySource, setCopySource] = useState<{ filename: string; path: string } | null>(null);

    // Estados para manejar la acción de mover
    const [isMoving, setIsMoving] = useState<boolean>(false);
    const [moveSource, setMoveSource] = useState<{ filename: string; path: string } | null>(null);

    // Estados para el Modal de Estado
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');

    // Estados para el Modal de Renombrar
    const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
    const [renameNewName, setRenameNewName] = useState<string>('');
    const [renameNewExtension, setRenameNewExtension] = useState<string>('');
    const [renameIsFile, setRenameIsFile] = useState<boolean>(true); // Indica si el elemento es un archivo

    // Cargar el árbol completo al montar el componente
    useEffect(() => {
        fetchFilesTree();
        setSelectedItem(null); // Deseleccionar cualquier elemento seleccionado al cambiar de carpeta
    }, []);

    // Actualizar los items del directorio actual cuando cambia currentPath o fileTree
    useEffect(() => {
        updateCurrentItems(fileTree, currentPath);
        setSelectedItem(null); // Deseleccionar cualquier elemento seleccionado al cambiar de carpeta
    }, [currentPath, fileTree]);

    /**
     * Función para obtener el árbol completo de archivos y carpetas.
     */
    const fetchFilesTree = async () => {
        try {
            const data = await getFilesTree();
            // Añadir un nodo raíz virtual si es necesario
            const virtualRoot: FileSystemItem = {
                name: 'public',
                path: 'public',
                type: 'folder',
                children: data,
            };
            setFileTree([virtualRoot]);
            // Los items se actualizarán automáticamente mediante el useEffect
        } catch (error) {
            console.error('Error fetching files tree:', error);
            showModal('Error', 'Error al obtener el árbol de archivos.', 'error');
        }
    };

    /**
     * Función para actualizar los items del directorio actual basado en el árbol completo.
     * @param tree Árbol completo de archivos y carpetas.
     * @param path Ruta actual.
     */
    const updateCurrentItems = (tree: FileSystemItem[], path: string) => {
        // Navegar hasta la ruta actual en el árbol
        const pathSegments = path.split('/').filter(Boolean);
        // @ts-ignore
        let currentNode: FileSystemItem = { children: tree };

        for (const segment of pathSegments) {
            const found = currentNode.children?.find(item => item.name === segment && item.type === 'folder');
            if (found) {
                currentNode = found;
            } else {
                // Ruta no encontrada en el árbol, manejar según sea necesario
                console.error('Ruta no encontrada en el árbol:', path);
                setItems([]);
                return;
            }
        }

        // Formatear los items del directorio actual para el estado 'items'
        let idCounter = 1;
        const formattedItems = currentNode.children?.map((item) => ({
            id: idCounter++,
            name: item.name,
            type: item.type,
            date: new Date(),
            path: item.path,
        })) || [];

        setItems(formattedItems);
    };

    const handleNavigateToPath = (path: string) => {
        setCurrentPath(path); // Actualiza el `currentPath` con la ruta seleccionada en el breadcrumb
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'aac':
                return <BsFiletypeAac />;
            case 'ai':
                return <BsFiletypeAi />;
            // ... otros casos
            default:
                return <FaFile />;
        }
    };

    // Verificar permisos del usuario
    const hasPermissionFunc = (permission: string): boolean => {
        return userPermissions.includes(permission);
    };

    // Manejar la selección de un elemento
    const handleSelectItem = (itemName: string) => {
        setSelectedItem((prev) => (prev === itemName ? null : itemName));
    };

    // Manejar doble clic en elementos (carpetas o archivos)
    const handleDoubleClickItem = (item: Item) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        } else {
            const extension = item.name.split('.').pop()?.toLowerCase();
            if (extension === 'pdf' || extension === 'docx' || extension === 'xlsx') {
                setFileToView({
                    url: `/filemanager/files/view?filename=${encodeURIComponent(item.name)}&path=${encodeURIComponent(currentPath)}`,
                    type: extension as 'pdf' | 'docx' | 'xlsx',
                });
                setIsFileViewerOpen(true);
            } else {
                showModal('Error', 'Tipo de archivo no soportado para visualización.', 'error');
            }
        }
    };

    // Función auxiliar para mostrar el modal de estado
    const showModal = (title: string, message: string, type: 'success' | 'error') => {
        setModalTitle(title);
        setModalMessage(message);
        setModalType(type);
        setModalOpen(true);
    };

    // Acciones del Toolbar

    const handleCreateFolderAction = () => {
        setIsCreateFolderOpen(true);
    };

    const handleConfirmCreateFolder = async () => {
        if (newFolderName.trim() === '') {
            showModal('Error', 'El nombre de la carpeta no puede estar vacío.', 'error');
            return;
        }

        try {
            const response = await createFolder(newFolderName, currentPath);
            showModal('Éxito', 'Carpeta creada exitosamente.', 'success');

            // Refrescar el árbol completo
            fetchFilesTree();

            setNewFolderName('');
            setIsCreateFolderOpen(false);
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                showModal('Error', 'No tienes permiso para crear carpetas.', 'error');
            } else {
                showModal('Error', 'Error al crear la carpeta.', 'error');
            }
            console.error(error);
        }
    };

    const handleUploadFolderAction = async () => {
        const folderInput = document.createElement('input');
        folderInput.type = 'file';
        (folderInput as any).webkitdirectory = true; // Habilitar selección de directorio
        folderInput.onchange = async () => {
            if (folderInput.files && folderInput.files.length > 0) {
                try {
                    const response = await uploadDirectory(folderInput.files, currentPath);
                    showModal('Éxito', 'Carpeta subida exitosamente.', 'success');
                    fetchFilesTree(); // Refrescar el árbol
                } catch (error: any) {
                    if (error.response && error.response.status === 403) {
                        showModal('Error', 'No tienes permiso para subir carpetas.', 'error');
                    } else {
                        showModal('Error', 'Error al subir la carpeta.', 'error');
                    }
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
                    showModal('Éxito', 'Archivo subido exitosamente.', 'success');
                    fetchFilesTree(); // Refrescar el árbol
                } catch (error: any) {
                    if (error.response && error.response.status === 403) {
                        showModal('Error', 'No tienes permiso para subir archivos.', 'error');
                    } else {
                        showModal('Error', 'Error al subir el archivo.', 'error');
                    }
                    console.error(error);
                }
            }
        };
        fileInput.click();
    };

    const handleDownloadAction = async () => {
        if (selectedItem) {
            const item = items.find((i) => i.name === selectedItem);
            if (item) {
                if (item.type === 'file') {
                    try {
                        const blob = await downloadFile(item.name, currentPath);
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', item.name);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                        showModal('Éxito', 'Archivo descargado exitosamente.', 'success');
                    } catch (error: any) {
                        if (error.response && error.response.status === 403) {
                            showModal('Error', 'No tienes permiso para descargar archivos.', 'error');
                        } else {
                            showModal('Error', 'Error al descargar el archivo.', 'error');
                        }
                        console.error(error);
                    }
                } else if (item.type === 'folder') {
                    try {
                        const blob = await downloadFolder(item.name, currentPath);
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${item.name}.zip`);
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode?.removeChild(link);
                        showModal('Éxito', 'Carpeta descargada exitosamente.', 'success');
                    } catch (error: any) {
                        if (error.response && error.response.status === 403) {
                            showModal('Error', 'No tienes permiso para descargar carpetas.', 'error');
                        } else {
                            showModal('Error', 'Error al descargar la carpeta.', 'error');
                        }
                        console.error(error);
                    }
                }
            }
        } else {
            showModal('Error', 'Por favor, selecciona un elemento para descargar.', 'error');
        }
    };

    const handleDeleteAction = async () => {
        if (selectedItem) {
            const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar "${selectedItem}"?`);
            if (confirmDelete) {
                try {
                    const item = items.find((i) => i.name === selectedItem);
                    if (item) {
                        let response;
                        if (item.type === 'file') {
                            response = await deleteFile(item.name, currentPath);
                        } else if (item.type === 'folder') {
                            response = await deleteFolder(item.name, currentPath);
                        }
                        showModal('Éxito', response.message || 'Elemento eliminado exitosamente.', 'success');
                        fetchFilesTree(); // Refrescar el árbol
                        setSelectedItem(null);
                    }
                } catch (error: any) {
                    if (error.response && error.response.status === 403) {
                        showModal('Error', 'No tienes permiso para eliminar este elemento.', 'error');
                    } else {
                        showModal('Error', 'Error al eliminar el elemento.', 'error');
                    }
                    console.error(error);
                }
            }
        }
    };

    const handleCopy = async () => {
        if (selectedItem) {
            const item = items.find((i) => i.name === selectedItem);
            if (item && item.type === 'file') {
                setCopySource({ filename: item.name, path: currentPath });
                setIsCopying(true);
            } else {
                showModal('Error', 'Solo se pueden copiar archivos.', 'error');
            }
        }
    };

    const handleConfirmCopy = async () => {
        if (copySource) {
            try {
                const response = await copyFile(copySource.filename, copySource.path, currentPath);
                showModal('Éxito', 'Archivo copiado exitosamente.', 'success');
                fetchFilesTree(); // Refrescar el árbol
                setIsCopying(false);
                setCopySource(null);
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    showModal('Error', 'No tienes permiso para copiar archivos.', 'error');
                } else {
                    showModal('Error', 'Error al copiar el archivo.', 'error');
                }
                console.error(error);
            }
        }
    };

    const handleCancelCopy = () => {
        setIsCopying(false);
        setCopySource(null);
    };

    const handleMove = async () => {
        if (selectedItem) {
            const item = items.find((i) => i.name === selectedItem);
            if (item && item.type === 'file') {
                setMoveSource({ filename: item.name, path: currentPath });
                setIsMoving(true);
            } else {
                showModal('Error', 'Solo se pueden mover archivos.', 'error');
            }
        }
    };

    const handleConfirmMove = async () => {
        if (moveSource) {
            try {
                const response = await moveFile(moveSource.filename, moveSource.path, currentPath);
                showModal('Éxito', 'Archivo movido exitosamente.', 'success');
                fetchFilesTree(); // Refrescar el árbol
                setIsMoving(false);
                setMoveSource(null);
                setSelectedItem(null); // Deseleccionar el elemento movido
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    showModal('Error', 'No tienes permiso para mover archivos.', 'error');
                } else {
                    showModal('Error', 'Error al mover el archivo.', 'error');
                }
                console.error(error);
            }
        }
    };

    const handleCancelMove = () => {
        setIsMoving(false);
        setMoveSource(null);
    };

    const handleRename = () => {
        if (selectedItem) {
            const item = items.find((i) => i.name === selectedItem);
            if (item) {
                const [currentName, currentExtension] = item.type === 'file'
                    ? [selectedItem.slice(0, selectedItem.lastIndexOf('.')) || selectedItem, selectedItem.slice(selectedItem.lastIndexOf('.') + 1)]
                    : [selectedItem, '']; // Para carpetas, extensión vacía

                setRenameNewName(currentName);
                setRenameNewExtension(currentExtension);
                setRenameIsFile(item.type === 'file');
                setRenameModalOpen(true);
            }
        }
    };

    const handleConfirmRename = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevenir comportamiento por defecto del formulario

        // Validaciones
        if (renameNewName.trim() === '') {
            showModal('Error', 'El nombre del elemento no puede estar vacío.', 'error');
            return;
        }

        if (renameIsFile) {
            // Validar la extensión
            if (renameNewExtension.trim() === '') {
                showModal('Error', 'La extensión del archivo no puede estar vacía.', 'error');
                return;
            }
        }

        // Combinar nombre y extensión si es un archivo
        const newFilename = renameIsFile ? `${renameNewName}.${renameNewExtension}` : renameNewName;

        try {
            if (selectedItem != null) {
                const response = await renameFile(selectedItem, newFilename, currentPath);
            }
            showModal('Éxito', 'Elemento renombrado exitosamente.', 'success');
            fetchFilesTree(); // Refrescar el árbol
            setSelectedItem(null);
            setRenameModalOpen(false);
            setRenameNewName('');
            setRenameNewExtension('');
            setRenameIsFile(true);
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                showModal('Error', 'No tienes permiso para renombrar este elemento.', 'error');
            } else {
                showModal('Error', 'Error al renombrar el elemento.', 'error');
            }
            console.error(error);
        }
    };

    const handleCancelRename = () => {
        setRenameModalOpen(false);
        setRenameNewName('');
        setRenameNewExtension('');
        setRenameIsFile(true);
    };

    const handleSort = ({ criteria, order }: SortPayload) => {
        const sortedItems = [...items].sort((a, b) => {
            let comparison = 0;
            if (criteria === 'name') {
                comparison = a.name.localeCompare(b.name);
            }

            return order === 'asc' ? comparison : -comparison;
        });

        setItems(sortedItems);
    };

    // Manejar el evento de tecla ESC para cancelar la copia, mover y renombrar
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (isCopying) {
                handleCancelCopy();
            }
            if (isMoving) {
                handleCancelMove();
            }
            if (renameModalOpen) {
                handleCancelRename();
            }
        }
    }, [isCopying, isMoving, renameModalOpen]);

    useEffect(() => {
        if (isCopying || isMoving || renameModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isCopying, isMoving, renameModalOpen, handleKeyDown]);

    // Manejar el botón de "Volver"
    const handleGoBack = () => {
        const pathSegments = currentPath.split('/').filter(Boolean);
        if (pathSegments.length > 1) {
            pathSegments.pop(); // Eliminar el último segmento
            const newPath = pathSegments.join('/');
            setCurrentPath(newPath);
        } else {
            // Si estamos en el nivel raíz, establecer 'public'
            setCurrentPath('public');
        }
    };

    // Determinar si se puede ir atrás
    const canGoBack = currentPath !== 'public';

    return (
        <>
            <Breadcrumb currentPath={currentPath} onNavigateTo={handleNavigateToPath} />
            <div className="file-manager bg-white min-h-fit">

                {/* Toolbar */}
                <FileManagerToolbar
                    onCreateFolder={handleCreateFolderAction}
                    onUploadFolder={handleUploadFolderAction}
                    onUploadFile={handleUploadFileAction}
                    onDownloadFile={handleDownloadAction}
                    onDelete={handleDeleteAction}
                    onCopy={handleCopy}
                    onRename={handleRename}
                    onMove={handleMove}
                    onSort={handleSort}
                    isItemSelected={selectedItem !== null}
                    onCopyHere={handleConfirmCopy}
                    onCancelCopy={handleCancelCopy}
                    isCopying={isCopying}
                    onMoveHere={handleConfirmMove}
                    onCancelMove={handleCancelMove}
                    isMoving={isMoving}
                    onBack={handleGoBack} // Passed onBack
                    canGoBack={canGoBack} // Passed canGoBack
                />

                {/* Modal para crear una nueva carpeta */}
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

                {/* Modal para visualizar archivos */}
                {isFileViewerOpen && fileToView && fileToView.type && (
                    <FileViewerModal
                        isOpen={isFileViewerOpen}
                        title={`Visualizando: ${selectedItem}`}
                        fileUrl={fileToView.url}
                        fileType={fileToView.type}
                        onClose={() => setIsFileViewerOpen(false)}
                    />
                )}

                {/* Modal de Renombrar Archivo o Carpeta */}
                <Modal
                    isOpen={renameModalOpen}
                    title={`Renombrar ${renameIsFile ? 'Archivo' : 'Carpeta'}`}
                    onClose={() => setRenameModalOpen(false)}
                >
                    <form onSubmit={handleConfirmRename}>
                        <div className="flex flex-col space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text">Nombre {renameIsFile ? 'de archivo' : 'de carpeta'}</span>
                                </label>
                                <input
                                    type="text"
                                    value={renameNewName}
                                    onChange={(e) => setRenameNewName(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="Nombre"
                                />
                            </div>
                            {renameIsFile && (
                                <div>
                                    <label className="label">
                                        <span className="label-text">Extensión del archivo</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={renameNewExtension}
                                        onChange={(e) => setRenameNewExtension(e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="Extensión (ej: txt, pdf)"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button type="button" className="btn btn-secondary" onClick={handleCancelRename}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Renombrar
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Lista de elementos */}
                <div className="p-4">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500">No hay archivos o carpetas disponibles.</p>
                    ) : (
                        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${
                                        selectedItem === item.name ? 'bg-blue-100' : 'bg-white'
                                    } hover:bg-gray-200 transition-colors duration-200`}
                                    onClick={() => handleSelectItem(item.name)}
                                    onDoubleClick={() => handleDoubleClickItem(item)}
                                >
                                    <span className="text-4xl">
                                        {item.type === 'folder' ? <FaFolder /> : getFileIcon(item.name)}
                                    </span>
                                    <span className="mt-2 text-center truncate w-full">{item.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Modal de Estado (Éxito/Error) */}
            <Modal
                isOpen={modalOpen}
                title={modalTitle}
                onClose={() => setModalOpen(false)}
            >
                <p>{modalMessage}</p>
                <div className="flex justify-end mt-4">
                    <button className="btn" onClick={() => setModalOpen(false)}>Aceptar</button>
                </div>
            </Modal>
        </>
    );

};

export default FileManager;
