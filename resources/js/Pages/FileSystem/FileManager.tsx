import React, { useState, useEffect, useCallback } from 'react';
import FileManagerToolbar from './Components/Toolbar';
import Modal from './Components/Modal';
import FileViewerModal from "@/Pages/FileSystem/Components/FileViewerModal";
import { FaFolder, FaFile } from 'react-icons/fa';
import {
    BsFiletypeAac,
    BsFiletypeAi,
    BsFiletypeBmp,
    BsFiletypeCs,
    BsFiletypeCss,
    BsFiletypeCsv,
    BsFiletypeDoc,
    BsFiletypeDocx,
    BsFiletypeExe,
    BsFiletypeGif,
    BsFiletypeHeic,
    BsFiletypeHtml,
    BsFiletypeJava,
    BsFiletypeJpg,
    BsFiletypeJs,
    BsFiletypeJson,
    BsFiletypeJsx,
    BsFiletypeKey,
    BsFiletypeM4P,
    BsFiletypeMd,
    BsFiletypeMdx,
    BsFiletypeMov,
    BsFiletypeMp3,
    BsFiletypeMp4,
    BsFiletypeOtf,
    BsFiletypePdf,
    BsFiletypePhp,
    BsFiletypePng,
    BsFiletypePpt,
    BsFiletypePptx,
    BsFiletypePsd,
    BsFiletypePy,
    BsFiletypeRaw,
    BsFiletypeRb,
    BsFiletypeSass,
    BsFiletypeScss,
    BsFiletypeSh,
    BsFiletypeSql,
    BsFiletypeSvg,
    BsFiletypeTiff,
    BsFiletypeTsx,
    BsFiletypeTtf,
    BsFiletypeTxt,
    BsFiletypeWav,
    BsFiletypeWoff,
    BsFiletypeXls,
    BsFiletypeXlsx,
    BsFiletypeXml,
    BsFiletypeYml,
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
import axios from "axios";

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
    const [currentPath, setCurrentPath] = useState<string>(''); // Ruta inicial a establecer
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [fileTree, setFileTree] = useState<FileSystemItem[]>([]); // Árbol completo

    const [hierarchyLevel, setHierarchyLevel] = useState<number>(1);

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);
    const [fileToView, setFileToView] = useState<{ url: string; type: 'pdf' | 'docx' | 'xlsx' } | null>(null);

    const [loading, setLoading] = useState<boolean>(true); // Estado de carga

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
    const [renameIsFile, setRenameIsFile] = useState<boolean>(true); // Indica si el elemento es un archivo

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Ejecutar ambas funciones en paralelo
                await Promise.all([
                    fetchHierarchyAndCompany(),
                    fetchFilesTree()
                ]);

                // Actualiza los items actuales después de haber obtenido el árbol y la ruta
                updateCurrentItems(fileTree, currentPath);
                setSelectedItem(null);
            } catch (error) {
                console.error("Error al inicializar datos:", error);
            } finally {
                setLoading(false); // Finalizar el estado de carga
            }
        };

        initializeData();
    }, []);

    // Este useEffect se encargará de actualizar los elementos cuando cambien `fileTree` o `currentPath`
    useEffect(() => {
        if (fileTree.length > 0) {
            updateCurrentItems(fileTree, currentPath);
        }
    }, [fileTree, currentPath]);

    const fetchHierarchyAndCompany = async () => {
        try {
            const response = await axios.get('/filemanager/hierarchy-company', { withCredentials: true });
            const { hierarchy_level, company_name } = response.data;

            setHierarchyLevel(hierarchy_level);
            setCompanyName(company_name);

            // Asigna la misma ruta para todas las jerarquías
            const initialPath = `public/${company_name}`;
            setCurrentPath(initialPath);
        } catch (error) {
            console.error('Error al obtener jerarquía y empresa:', error);
        }
    };


    /**
     * Función para obtener el árbol completo de archivos y carpetas.
     */
    const fetchFilesTree = async () => {
        try {
            const data = await getFilesTree();
            setFileTree([{ name: 'public', path: 'public', type: 'folder', children: data }]);
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
            case 'bmp':
                return <BsFiletypeBmp />;
            case 'cs':
                return <BsFiletypeCs />;
            case 'css':
                return <BsFiletypeCss />;
            case 'csv':
                return <BsFiletypeCsv />;
            case 'doc':
                return <BsFiletypeDoc />;
            case 'docx':
                return <BsFiletypeDocx />;
            case 'exe':
                return <BsFiletypeExe />;
            case 'gif':
                return <BsFiletypeGif />;
            case 'heic':
                return <BsFiletypeHeic />;
            case 'html':
                return <BsFiletypeHtml />;
            case 'java':
                return <BsFiletypeJava />;
            case 'jpg':
            case 'jpeg':
                return <BsFiletypeJpg />;
            case 'js':
                return <BsFiletypeJs />;
            case 'json':
                return <BsFiletypeJson />;
            case 'jsx':
                return <BsFiletypeJsx />;
            case 'key':
                return <BsFiletypeKey />;
            case 'm4p':
                return <BsFiletypeM4P />;
            case 'md':
                return <BsFiletypeMd />;
            case 'mdx':
                return <BsFiletypeMdx />;
            case 'mov':
                return <BsFiletypeMov />;
            case 'mp3':
                return <BsFiletypeMp3 />;
            case 'mp4':
                return <BsFiletypeMp4 />;
            case 'otf':
                return <BsFiletypeOtf />;
            case 'pdf':
                return <BsFiletypePdf />;
            case 'php':
                return <BsFiletypePhp />;
            case 'png':
                return <BsFiletypePng />;
            case 'ppt':
                return <BsFiletypePpt />;
            case 'pptx':
                return <BsFiletypePptx />;
            case 'psd':
                return <BsFiletypePsd />;
            case 'py':
                return <BsFiletypePy />;
            case 'raw':
                return <BsFiletypeRaw />;
            case 'rb':
                return <BsFiletypeRb />;
            case 'sass':
                return <BsFiletypeSass />;
            case 'scss':
                return <BsFiletypeScss />;
            case 'sh':
                return <BsFiletypeSh />;
            case 'sql':
                return <BsFiletypeSql />;
            case 'svg':
                return <BsFiletypeSvg />;
            case 'tiff':
                return <BsFiletypeTiff />;
            case 'tsx':
                return <BsFiletypeTsx />;
            case 'ttf':
                return <BsFiletypeTtf />;
            case 'txt':
                return <BsFiletypeTxt />;
            case 'wav':
                return <BsFiletypeWav />;
            case 'woff':
                return <BsFiletypeWoff />;
            case 'xls':
                return <BsFiletypeXls />;
            case 'xlsx':
                return <BsFiletypeXlsx />;
            case 'xml':
                return <BsFiletypeXml />;
            case 'yml':
                return <BsFiletypeYml />;
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
                const currentName = item.type === 'file'
                    ? item.name.slice(0, item.name.lastIndexOf('.')) || item.name
                    : item.name; // Para carpetas, nombre completo

                setRenameNewName(currentName);
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

        // Obtener la extensión original si es un archivo
        let newFilename = renameNewName;
        if (renameIsFile) {
            const item = items.find((i) => i.name === selectedItem);
            if (item) {
                const extensionIndex = item.name.lastIndexOf('.');
                const extension = extensionIndex !== -1 ? item.name.slice(extensionIndex) : '';
                newFilename += extension;
            }
        }

        try {
            if (selectedItem != null) {
                const response = await renameFile(selectedItem, newFilename, currentPath);
            }
            showModal('Éxito', 'Elemento renombrado exitosamente.', 'success');
            fetchFilesTree(); // Refrescar el árbol
            setSelectedItem(null);
            setRenameModalOpen(false);
            setRenameNewName('');
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
    const canGoBack = currentPath !== `public/${companyName}` || hierarchyLevel <= 1;

    return (
        <>
            {hierarchyLevel !== null && companyName && !loading && (
                <Breadcrumb
                    currentPath={currentPath}
                    onNavigateTo={setCurrentPath}
                    hierarchyLevel={hierarchyLevel}
                    companyName={companyName}
                />
            )}
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
                    onBack={handleGoBack} // Pasar `onBack`
                    canGoBack={canGoBack} // Pasar `canGoBack` actualizado
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
                            {/* Eliminado: Campo para la extensión */}
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
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <span className="loading loading-dots loading-lg text-primary"></span>
                        </div>
                    ) : items.length === 0 ? (
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
