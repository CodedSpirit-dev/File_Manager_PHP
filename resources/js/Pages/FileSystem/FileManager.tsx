// src/components/FileManager/FileManager.tsx

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
    downloadFolder, copyFiles,
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
    children?: Item[];
}
interface SortPayload {
    criteria: 'name' | 'type';
    order: 'asc' | 'desc';
}

const FileManager: React.FC = () => {
    const { auth } = usePage().props as any;
    const userPermissions: string[] = auth.user?.permissions || [];

    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [items, setItems] = useState<Item[]>([]);
    const [currentPath, setCurrentPath] = useState<string>(''); // Ruta inicial a establecer
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [fileTree, setFileTree] = useState<FileSystemItem[]>([]); // Árbol completo

    const [hierarchyLevel, setHierarchyLevel] = useState<number>(1);

    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);
    const [fileToView, setFileToView] = useState<{ url: string; type: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'doc' | 'txt' } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Estados para manejar la acción de copiar
    const [isCopying, setIsCopying] = useState<boolean>(false);
    const [copySource, setCopySource] = useState<{ filenames: string[]; path: string } | null>(null);

    // Estados para manejar la acción de mover
    const [isMoving, setIsMoving] = useState<boolean>(false);
    const [moveSource, setMoveSource] = useState<{ filenames: string[]; path: string } | null>(null);

    // Estados para el Modal de Estado
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const [modalType, setModalType] = useState<'success' | 'error'>('success');

    // Estados para el Modal de Renombrar
    const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
    const [renameNewName, setRenameNewName] = useState<string>(''); // Solo el nombre
    const [renameIsFile, setRenameIsFile] = useState<boolean>(true); // Indica si el elemento es un archivo

    // Estados de progreso para las operaciones de subida y eliminación
    const [uploadProgress, setUploadProgress] = useState<{ total: number; completed: number } | null>(null);
    const [deleteProgress, setDeleteProgress] = useState<{ total: number; completed: number } | null>(null);

    // Estado para el progreso de la operación
    const [operationProgress, setOperationProgress] = useState<{
        type: 'copy' | 'move' | null;
        total: number;
        completed: number;
    } | null>(null);

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
                setSelectedItems([]);
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

            // Función recursiva para ordenar el árbol de archivos alfabéticamente
            const sortFileTree = (items: Item[]): Item[] => {
                return items
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(item => {
                        if (item.type === 'folder' && item.children) {
                            item.children = sortFileTree(item.children);
                        }
                        return item;
                    });
            };

            const sortedData = sortFileTree(data);

            setFileTree([{ name: 'public', path: 'public', type: 'folder', children: sortedData }]);
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

        // Ordenar los items por nombre de A a Z
        formattedItems.sort((a, b) => a.name.localeCompare(b.name));

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

    // Manejar la selección de un elemento con soporte para selección múltiple
    const handleSelectItem = (itemPath: string, event: React.MouseEvent) => {
        if (event.ctrlKey || event.metaKey) {
            // Selección múltiple con Ctrl/Cmd
            setSelectedItems((prevSelected) => {
                if (prevSelected.includes(itemPath)) {
                    // Si ya está seleccionado, lo deselecciona
                    return prevSelected.filter(name => name !== itemPath);
                } else {
                    // Si no está seleccionado, lo añade
                    return [...prevSelected, itemPath];
                }
            });
        } else {
            // Selección única sin Ctrl/Cmd
            setSelectedItems((prevSelected) =>
                prevSelected.includes(itemPath) && prevSelected.length === 1 ? [] : [itemPath]
            );
        }
    };

// Manejar doble clic en elementos (carpetas o archivos)
    const handleDoubleClickItem = (item: Item) => {
        if (item.type === 'folder') {
            setCurrentPath(item.path);
        } else {
            const extension = item.name.split('.').pop()?.toLowerCase();
            const supportedExtensions = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'doc'];

            if (extension && supportedExtensions.includes(extension)) {
                setFileToView({
                    url: `/filemanager/files/view?filename=${encodeURIComponent(item.name)}&path=${encodeURIComponent(currentPath)}`,
                    type: extension as 'pdf' | 'docx' | 'xlsx' | 'doc' | 'xls' | 'txt' | 'csv',
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
        (folderInput as any).webkitdirectory = true;
        folderInput.onchange = async () => {
            if (folderInput.files && folderInput.files.length > 0) {
                const totalFiles = folderInput.files.length;
                let completedFiles = 0;

                // Iniciar progreso de subida
                setUploadProgress({ total: totalFiles, completed: 0 });

                try {
                    await uploadDirectory(folderInput.files, currentPath);
                    completedFiles = totalFiles;
                    setUploadProgress({ total: totalFiles, completed: completedFiles });
                    showModal('Éxito', 'Carpeta subida exitosamente.', 'success');
                    fetchFilesTree(); // Refrescar el árbol
                } catch (error) {
                    showModal('Error', 'Error al subir la carpeta.', 'error');
                } finally {
                    setUploadProgress(null); // Finalizar el progreso de subida
                }
            }
        };
        folderInput.click();
    };


    // Función para subir un archivo con progreso
    const handleUploadFileAction = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true; // Permitir seleccionar varios archivos
        fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files.length > 0) {
                const totalFiles = fileInput.files.length;
                let completedFiles = 0;

                // Iniciar progreso de subida
                setUploadProgress({ total: totalFiles, completed: 0 });

                try {
                    for (const file of Array.from(fileInput.files)) {
                        await uploadFile(file, currentPath); // Llamar a la función de subida para cada archivo
                        completedFiles += 1;
                        setUploadProgress({ total: totalFiles, completed: completedFiles });
                    }
                    showModal('Éxito', 'Archivos subidos exitosamente.', 'success');
                    fetchFilesTree(); // Refrescar el árbol
                } catch (error: any) {
                    // Verificar si el error es una respuesta de Laravel por límite de tamaño
                    if (error.response?.data?.exception === "Illuminate\\Http\\Exceptions\\PostTooLargeException") {
                        showModal('Error', 'Uno de los archivos supera el límite de 10MB.', 'error');
                    } else {
                        showModal('Error', 'Error al subir uno o más archivos.', 'error');
                    }
                } finally {
                    setUploadProgress(null); // Finalizar el progreso de subida
                }
            }
        };
        fileInput.click();
    };


    const handleDownloadAction = async () => {
        if (selectedItems.length > 0) {
            try {
                for (const itemPath of selectedItems) {
                    const item = items.find((i) => i.path === itemPath);
                    if (item) {
                        if (item.type === 'file') {
                            const blob = await downloadFile(item.name, currentPath);
                            const url = window.URL.createObjectURL(new Blob([blob]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', item.name);
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode?.removeChild(link);
                        } else if (item.type === 'folder') {
                            const blob = await downloadFolder(item.name, currentPath);
                            const url = window.URL.createObjectURL(new Blob([blob]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `${item.name}.zip`);
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode?.removeChild(link);
                        }
                    }
                }
                showModal('Éxito', 'Elemento(s) descargado(s) exitosamente.', 'success');
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    showModal('Error', 'No tienes permiso para descargar uno o más elementos.', 'error');
                } else {
                    showModal('Error', 'Error al descargar uno o más elementos.', 'error');
                }
                console.error(error);
            }
        } else {
            showModal('Error', 'Por favor, selecciona al menos un elemento para descargar.', 'error');
        }
    };

    const handleDeleteAction = async () => {
        if (selectedItems.length > 0) {
            const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar ${selectedItems.length} elemento(s)?`);
            if (confirmDelete) {
                const totalItems = selectedItems.length;
                let completedItems = 0;

                // Iniciar progreso de eliminación
                setDeleteProgress({ total: totalItems, completed: 0 });

                try {
                    for (const itemPath of selectedItems) {
                        const item = items.find((i) => i.path === itemPath);
                        if (item) {
                            if (item.type === 'file') {
                                await deleteFile(item.name, currentPath);
                            } else if (item.type === 'folder') {
                                await deleteFolder(item.name, currentPath);
                            }
                            completedItems += 1;
                            setDeleteProgress({ total: totalItems, completed: completedItems });
                        }
                    }
                    showModal('Éxito', 'Elemento(s) eliminado(s) exitosamente.', 'success');
                    fetchFilesTree(); // Refrescar el árbol
                } catch (error) {
                    showModal('Error', 'Error al eliminar uno o más elementos.', 'error');
                } finally {
                    setDeleteProgress(null); // Finalizar el progreso de eliminación
                }
            }
        }
    };

    const handleCopy = async () => {
        if (selectedItems.length > 0) {
            // Permitir copiar archivos y carpetas
            setCopySource({ filenames: selectedItems, path: currentPath });
            setIsCopying(true);
        }
    };

    const handleConfirmCopy = async () => {
        if (copySource) {
            const { filenames, path } = copySource;
            const totalFiles = filenames.length;
            let completedFiles = 0;

            // Iniciar el seguimiento del progreso
            setOperationProgress({
                type: 'copy',
                total: totalFiles,
                completed: completedFiles,
            });

            try {
                await copyFiles(filenames.map(filePath => filePath.split('/').pop() || filePath), path, currentPath);
                completedFiles = totalFiles;
                setOperationProgress({
                    type: 'copy',
                    total: totalFiles,
                    completed: completedFiles,
                });

                showModal('Éxito', 'Archivo(s) copiado(s) exitosamente.', 'success');
                fetchFilesTree(); // Refrescar el árbol
                setIsCopying(false);
                setCopySource(null);
                setSelectedItems([]); // Deseleccionar los elementos copiados
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    showModal('Error', 'No tienes permiso para copiar uno o más archivos.', 'error');
                } else if (error.response && error.response.data.errors) {
                    showModal('Error', error.response.data.errors.join(' '), 'error');
                } else {
                    showModal('Error', 'Error al copiar uno o más archivos.', 'error');
                }
                console.error(error);
            } finally {
                // Finalizar el seguimiento del progreso
                setOperationProgress(null);
            }
        }
    };


    const handleCancelCopy = () => {
        setIsCopying(false);
        setCopySource(null);
    };

    const handleMove = async () => {
        if (selectedItems.length > 0) {
            setMoveSource({ filenames: selectedItems, path: currentPath });
            setIsMoving(true);
        }
    };

    const handleConfirmMove = async () => {
        if (moveSource) {
            const { filenames, path } = moveSource;
            const totalFiles = filenames.length;
            let completedFiles = 0;

            // Iniciar el seguimiento del progreso
            setOperationProgress({
                type: 'move',
                total: totalFiles,
                completed: completedFiles,
            });

            try {
                // Crear un array de promesas
                const movePromises = filenames.map(async (filePath) => {
                    const filename = filePath.split('/').pop(); // Extraer solo el nombre del archivo
                    if (filename) {
                        await moveFile(filename, path, currentPath);
                        completedFiles += 1;
                        setOperationProgress({
                            type: 'move',
                            total: totalFiles,
                            completed: completedFiles,
                        });
                    }
                });

                // Ejecutar todas las promesas de movimiento en paralelo
                await Promise.all(movePromises);

                showModal('Éxito', 'Archivo(s) movido(s) exitosamente.', 'success');
                fetchFilesTree(); // Refrescar el árbol
                setIsMoving(false);
                setMoveSource(null);
                setSelectedItems([]); // Deseleccionar los elementos movidos
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    showModal('Error', 'No tienes permiso para mover uno o más archivos.', 'error');
                } else {
                    showModal('Error', 'Error al mover uno o más archivos.', 'error');
                }
                console.error(error);
            } finally {
                // Finalizar el seguimiento del progreso
                setOperationProgress(null);
            }
        }
    };

    const handleCancelMove = () => {
        setIsMoving(false);
        setMoveSource(null);
    };

    const handleRename = () => {
        if (selectedItems.length === 1) { // Solo permitir renombrar si hay un elemento seleccionado
            const selectedItemPath = selectedItems[0];
            const item = items.find((i) => i.path === selectedItemPath);
            if (item) {
                const currentName = item.type === 'file'
                    ? item.name.slice(0, item.name.lastIndexOf('.')) || item.name
                    : item.name; // Para carpetas, nombre completo

                setRenameNewName(currentName);
                setRenameIsFile(item.type === 'file');
                setRenameModalOpen(true);
            }
        } else {
            showModal('Error', 'Solo puedes renombrar un elemento a la vez.', 'error');
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
            const item = items.find((i) => i.path === selectedItems[0]);
            if (item) {
                const extensionIndex = item.name.lastIndexOf('.');
                const extension = extensionIndex !== -1 ? item.name.slice(extensionIndex) : '';
                newFilename += extension;
            }
        }

        try {
            if (selectedItems.length === 1 && selectedItems[0] != null) {
                const response = await renameFile(selectedItems[0], newFilename, currentPath);
                showModal('Éxito', 'Elemento renombrado exitosamente.', 'success');
                fetchFilesTree(); // Refrescar el árbol
                setSelectedItems([]); // Deseleccionar el elemento renombrado
                setRenameModalOpen(false);
                setRenameNewName('');
            }
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
            let compareA: string = '';
            let compareB: string = '';

            if (criteria === 'name') {
                compareA = a.name.toLowerCase();
                compareB = b.name.toLowerCase();
            } else if (criteria === 'type') {
                // Si es archivo, obtenemos la extensión; si es carpeta, asignamos un valor para que se ordene antes o después
                const extA = a.type === 'file' ? a.name.split('.').pop()?.toLowerCase() || '' : '0';
                const extB = b.type === 'file' ? b.name.split('.').pop()?.toLowerCase() || '' : '0';

                compareA = extA;
                compareB = extB;

                // Opcional: Si quieres que las carpetas siempre aparezcan antes que los archivos
                if (a.type === 'folder' && b.type !== 'folder') {
                    return order === 'asc' ? -1 : 1;
                } else if (a.type !== 'folder' && b.type === 'folder') {
                    return order === 'asc' ? 1 : -1;
                }
            }

            if (order === 'asc') {
                return compareA.localeCompare(compareB);
            } else {
                return compareB.localeCompare(compareA);
            }
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
                    isItemSelected={selectedItems.length > 0}
                    onCopyHere={handleConfirmCopy}
                    onCancelCopy={handleCancelCopy}
                    isCopying={isCopying}
                    onMoveHere={handleConfirmMove}
                    onCancelMove={handleCancelMove}
                    isMoving={isMoving}
                    onBack={handleGoBack} // Pasar `onBack`
                    canGoBack={canGoBack} // Pasar `canGoBack` actualizado
                    selectedItemsCount={selectedItems.length} // Pasar el conteo de elementos seleccionados
                />

                {/* Modal de progreso de subida */}
                {uploadProgress && (
                    <Modal
                        isOpen={true}
                        title="Subiendo Archivos"
                        onClose={() => { /* No permitir cerrar */ }}
                        canClose={false}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p>
                                Subiendo {uploadProgress.completed} de {uploadProgress.total} archivos.
                            </p>
                        </div>
                    </Modal>
                )}

                {/* Modal de progreso de eliminación */}
                {deleteProgress && (
                    <Modal
                        isOpen={true}
                        title="Eliminando Archivos"
                        onClose={() => { /* No permitir cerrar */ }}
                        canClose={false}
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p>
                                Eliminando {deleteProgress.completed} de {deleteProgress.total} archivos.
                            </p>
                        </div>
                    </Modal>
                )}


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
                                    key={item.path} // Usa path único
                                    className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center relative ${
                                        selectedItems.includes(item.path) ? 'bg-blue-100' : 'bg-white'
                                    } hover:bg-gray-200 transition-colors duration-200`}
                                    onClick={(e) => handleSelectItem(item.path, e)}
                                    onDoubleClick={() => handleDoubleClickItem(item)}
                                >
                                    <span className="text-4xl">
                                        {item.type === 'folder' ? <FaFolder /> : getFileIcon(item.name)}
                                    </span>
                                    <span className="mt-2 text-center truncate w-full">{item.name}</span>

                                    {/* Indicador de Selección */}
                                    {selectedItems.includes(item.path) && (
                                        <span className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                            ✓
                                        </span>
                                    )}
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

            {/* Modal de Progreso (Copiar/Moviendo) */}
            {operationProgress && (
                <Modal
                    isOpen={true}
                    title={operationProgress.type === 'copy' ? 'Copiando Archivos' : 'Moviendo Archivos'}
                    onClose={() => { /* No permitir cerrar */ }}
                    canClose={false} // No permitir cerrar durante la operación
                >
                    <div className="flex flex-col items-center space-y-4">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p>
                            {operationProgress.type === 'copy' ? 'Copiando' : 'Moviendo'} {operationProgress.completed} de {operationProgress.total} archivos.
                        </p>
                    </div>
                </Modal>
    )}
        </>
    );

};

export default FileManager;
