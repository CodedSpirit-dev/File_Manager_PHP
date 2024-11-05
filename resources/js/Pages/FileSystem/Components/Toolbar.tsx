// src/components/FileManager/Components/Toolbar.tsx

import React, { useState } from 'react';
import {
    FcPlus,
    FcSettings,
} from "react-icons/fc";
import { TbCopy, TbCursorText, TbFolderPlus, TbFolderUp } from "react-icons/tb";
import { BsFileEarmarkArrowDown, BsFileEarmarkArrowUp, BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";
import { IoClose, IoArrowBack } from "react-icons/io5";

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
    hasPermission?: (permission: string) => boolean;
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
                                                                   hasPermission,
                                                                   onCopyHere,
                                                                   onCancelCopy,
                                                                   isCopying,
                                                                   onMoveHere,
                                                                   onCancelMove,
                                                                   isMoving,
                                                                   onBack, // Added onBack
                                                                   canGoBack, // Added canGoBack
                                                               }) => {
    const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSortToggle = () => {
        const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        setCurrentSortOrder(newOrder);
        onSort({ criteria: 'name', order: newOrder });
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-end p-4 bg-base-100 shadow-sm rounded-lg">
            {/* Botones Principales */}
            <div className="flex flex-wrap items-center space-x-2">
                {/* Volver Button */}
                {canGoBack && (
                    <button
                        onClick={onBack}
                        className="btn btn-outline flex items-center space-x-2"
                        aria-label="Volver"
                    >
                        <IoArrowBack className="w-5 h-5" />
                        <span className="hidden sm:inline">Volver</span>
                    </button>
                )}

                {/* Crear Dropdown */}
                <div className="dropdown dropdown-bottom">
                    <button
                        tabIndex={0}
                        className="btn btn-outline flex items-center space-x-2 hover:text-primary-content"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <FcPlus className="w-5 h-5" />
                        <span className="hidden sm:inline">Crear</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                        aria-label="Opciones de Crear"
                    >
                        <li>
                            <button onClick={onCreateFolder} className="flex items-center space-x-2 w-full text-left">
                                <TbFolderPlus className="w-5 h-5" />
                                <span>Crear carpeta</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={onUploadFolder} className="flex items-center space-x-2 w-full text-left">
                                <TbFolderUp className="w-5 h-5" />
                                <span>Subir carpeta</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={onUploadFile} className="flex items-center space-x-2 w-full text-left">
                                <BsFileEarmarkArrowUp className="w-5 h-5" />
                                <span>Subir archivo</span>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Acciones Dropdown */}
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
                        {isItemSelected ? (
                            <>
                                <li>
                                    <button onClick={onDownloadFile} className="flex items-center space-x-2 w-full text-left">
                                        <BsFileEarmarkArrowDown className="w-5 h-5" />
                                        <span>Descargar</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={onCopy} className="flex items-center space-x-2 w-full text-left">
                                        <TbCopy className="w-5 h-5" />
                                        <span>Copiar</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={onRename} className="flex items-center space-x-2 w-full text-left">
                                        <TbCursorText className="w-5 h-5" />
                                        <span>Cambiar nombre</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={onMove} className="flex items-center space-x-2 w-full text-left">
                                        <MdOutlineDriveFileMove className="w-5 h-5" />
                                        <span>Mover</span>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={onDelete} className="flex items-center space-x-2 w-full text-left">
                                        <MdOutlineDeleteOutline className="w-5 h-5" />
                                        <span>Eliminar</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="px-4 py-2 text-gray-500">
                                Selecciona un elemento para ver las acciones disponibles.
                            </li>
                        )}
                    </ul>
                </div>

                {/* Ordenar Botón */}
                <button
                    onClick={handleSortToggle}
                    className="btn btn-outline flex items-center space-x-2 hover:text-primary-content"
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
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    {isCopying && (
                        <>
                            <button
                                className="btn btn-primary flex items-center space-x-2 mr-2"
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
                    {isMoving && (
                        <>
                            <button
                                className="btn btn-primary flex items-center space-x-2 mr-2"
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
