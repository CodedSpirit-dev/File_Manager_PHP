// src/components/FileManager/Components/Toolbar.tsx

import React, { useState } from 'react';
import {
    FcPlus,
    FcSettings,
} from "react-icons/fc";
import { TbCopy, TbCursorText, TbFolderPlus, TbFolderUp } from "react-icons/tb";
import { BsFileEarmarkArrowDown, BsFileEarmarkArrowUp, BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";
import { IoClose, IoChevronBackOutline } from "react-icons/io5";
import { usePermissions } from '@/contexts/PermissionsContext'; // Importar el hook de permisos

interface SortPayload {
    criteria: 'name';
    order: 'asc' | 'desc';
}

interface FileManagerToolbarProps {
    onCreateFolder: () => void;
    onUploadFolder: () => void;
    onUploadFile: () => void;
    onDownloadFile: () => void;
    onDelete: () => void;
    onCopy: () => void;
    onRename: () => void;
    onMove: () => void;
    onSort: (payload: SortPayload) => void;
    isItemSelected: boolean;
    onCopyHere: () => void;
    onCancelCopy: () => void;
    isCopying: boolean;
    onMoveHere: () => void;
    onCancelMove: () => void;
    isMoving: boolean;
    onBack: () => void; // Added onBack prop
    canGoBack: boolean; // Added canGoBack prop
}

const FileManagerToolbar: React.FC<FileManagerToolbarProps> = ({
                                                                   onCreateFolder,
                                                                   onUploadFolder,
                                                                   onUploadFile,
                                                                   onDownloadFile,
                                                                   onDelete,
                                                                   onCopy,
                                                                   onRename,
                                                                   onMove,
                                                                   onSort,
                                                                   isItemSelected,
                                                                   onCopyHere,
                                                                   onCancelCopy,
                                                                   isCopying,
                                                                   onMoveHere,
                                                                   onCancelMove,
                                                                   isMoving,
                                                                   onBack,
                                                                   canGoBack,
                                                               }) => {
    const { hasPermission: checkPermission } = usePermissions(); // Obtener la función de verificación de permisos desde el contexto

    const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSortToggle = () => {
        const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        setCurrentSortOrder(newOrder);
        onSort({ criteria: 'name', order: newOrder });
    };

    // Definir qué acciones están permitidas
    const canCreateFolder = checkPermission('can_create_folders');
    const canUploadFolder = checkPermission('can_upload_folders');
    const canUploadFile = checkPermission('can_upload_files_and_folders');

    const canDownload = checkPermission('can_download_files_and_folders');
    const canCopy = checkPermission('can_copy_files');
    const canRename = checkPermission('can_rename_files_and_folders');
    const canMove = checkPermission('can_move_files');
    const canDelete = checkPermission('can_delete_files_and_folders');
    const canCopyHere = checkPermission('can_copy_files'); // Permiso necesario para copiar aquí
    const canMoveHere = checkPermission('can_move_files'); // Permiso necesario para mover aquí

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-100 shadow-sm rounded-lg">
            {/* Botones Principales */}
            <div className="flex flex-wrap items-center space-x-2">
                {/* Volver Button */}
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className="btn btn-outline flex items-center space-x-2 hover:text-primary-content"
                        aria-label="Volver"
                    >
                        <IoChevronBackOutline className="w-5 h-5" />
                        <span className="hidden sm:inline">Volver</span>
                    </button>
                )}

                {/* Crear Dropdown */}
                {(canCreateFolder || canUploadFolder || canUploadFile) && (
                    <div className="dropdown dropdown-bottom">
                        <button
                            tabIndex={0}
                            className="btn btn-outline flex items-center space-x-2 hover:text-primary-content"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-label="Crear"
                        >
                            <FcPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Crear</span>
                        </button>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                            aria-label="Opciones de Crear"
                        >
                            {canCreateFolder && (
                                <li>
                                    <button onClick={onCreateFolder} className="flex items-center space-x-2 w-full text-left">
                                        <TbFolderPlus className="w-5 h-5" />
                                        <span>Crear carpeta</span>
                                    </button>
                                </li>
                            )}
                            {canUploadFolder && (
                                <li>
                                    <button onClick={onUploadFolder} className="flex items-center space-x-2 w-full text-left">
                                        <TbFolderUp className="w-5 h-5" />
                                        <span>Subir carpeta</span>
                                    </button>
                                </li>
                            )}
                            {canUploadFile && (
                                <li>
                                    <button onClick={onUploadFile} className="flex items-center space-x-2 w-full text-left">
                                        <BsFileEarmarkArrowUp className="w-5 h-5" />
                                        <span>Subir archivo</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Acciones Dropdown */}
                {(canDownload || canCopy || canRename || canMove || canDelete) && (
                    <div className="dropdown dropdown-end">
                        <button
                            tabIndex={0}
                            className={`btn btn-outline flex items-center space-x-2 hover:text-primary-content ${!isItemSelected ? 'btn-disabled' : ''}`}
                            disabled={!isItemSelected}
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-label="Acciones"
                        >
                            <FcSettings className="w-5 h-5" />
                            <span className="hidden sm:inline">Acciones</span>
                        </button>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                            aria-label="Opciones de Acciones"
                        >
                            {isItemSelected && canDownload && (
                                <li>
                                    <button onClick={onDownloadFile} className="flex items-center space-x-2 w-full text-left">
                                        <BsFileEarmarkArrowDown className="w-5 h-5" />
                                        <span>Descargar</span>
                                    </button>
                                </li>
                            )}
                            {isItemSelected && canCopy && (
                                <li>
                                    <button onClick={onCopy} className="flex items-center space-x-2 w-full text-left">
                                        <TbCopy className="w-5 h-5" />
                                        <span>Copiar</span>
                                    </button>
                                </li>
                            )}
                            {isItemSelected && canRename && (
                                <li>
                                    <button onClick={onRename} className="flex items-center space-x-2 w-full text-left">
                                        <TbCursorText className="w-5 h-5" />
                                        <span>Cambiar nombre</span>
                                    </button>
                                </li>
                            )}
                            {isItemSelected && canMove && (
                                <li>
                                    <button onClick={onMove} className="flex items-center space-x-2 w-full text-left">
                                        <MdOutlineDriveFileMove className="w-5 h-5" />
                                        <span>Mover</span>
                                    </button>
                                </li>
                            )}
                            {isItemSelected && canDelete && (
                                <li>
                                    <button onClick={onDelete} className="flex items-center space-x-2 w-full text-left">
                                        <MdOutlineDeleteOutline className="w-5 h-5" />
                                        <span>Eliminar</span>
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* Ordenar Botón */}
                    <button
                        onClick={handleSortToggle}
                        className="btn btn-outline flex items-center space-x-2 hover:text-primary-content ml-2"
                        aria-label="Ordenar por nombre"
                    >
                        {currentSortOrder === 'asc' ? (
                            <>
                                <BsSortAlphaDown className="w-5 h-5" />
                                <span className="hidden sm:inline">Ordenar A-Z</span>
                            </>
                        ) : (
                            <>
                                <BsSortAlphaDownAlt className="w-5 h-5" />
                                <span className="hidden sm:inline">Ordenar Z-A</span>
                            </>
                        )}
                    </button>
            </div>

            {/* Acciones de Copiar/Mover Aquí */}
            {(isCopying || isMoving) && (
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    {isCopying && canCopyHere && (
                        <>
                            <button
                                className="btn btn-primary flex items-center space-x-2"
                                onClick={onCopyHere}
                                aria-label="Copiar aquí"
                            >
                                <BsFileEarmarkArrowDown className="w-5 h-5" />
                                <span>Copiar aquí</span>
                            </button>
                            <button
                                className="btn btn-secondary flex items-center space-x-2"
                                onClick={onCancelCopy}
                                aria-label="Cancelar copia"
                            >
                                <IoClose className="w-5 h-5" />
                                <span>Cancelar</span>
                            </button>
                        </>
                    )}
                    {isMoving && canMoveHere && (
                        <>
                            <button
                                className="btn btn-primary flex items-center space-x-2"
                                onClick={onMoveHere}
                                aria-label="Mover aquí"
                            >
                                <BsFileEarmarkArrowDown className="w-5 h-5" />
                                <span>Mover aquí</span>
                            </button>
                            <button
                                className="btn btn-secondary flex items-center space-x-2"
                                onClick={onCancelMove}
                                aria-label="Cancelar movimiento"
                            >
                                <IoClose className="w-5 h-5" />
                                <span>Cancelar</span>
                            </button>
                        </>
                    )}
                </div>
            )}

        </div>
    );
}

export default FileManagerToolbar;
