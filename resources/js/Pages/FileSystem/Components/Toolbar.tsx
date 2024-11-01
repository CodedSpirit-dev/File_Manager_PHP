// src/components/FileManager/FileManagerToolbar.tsx

import React from 'react';
import { FcFolder, FcUpload, FcFile, FcDownload, FcDeleteRow, FcMenu } from 'react-icons/fc';
import {HiChevronDoubleDown} from "react-icons/hi2";

interface FileManagerToolbarProps {
    onCreateFolder: () => void;
    onUploadFolder: () => void;
    onUploadFile: () => void;
    onDownloadFile: () => void;
    onDelete: () => void;
    onSort: (criteria: 'date' | 'name') => void;
    isItemSelected: boolean;
    hasPermission: (permission: string) => boolean;
}

const FileManagerToolbar: React.FC<FileManagerToolbarProps> = ({
                                                                   onCreateFolder,
                                                                   onUploadFolder,
                                                                   onUploadFile,
                                                                   onDownloadFile,
                                                                   onDelete,
                                                                   onSort,
                                                                   isItemSelected,
                                                                   hasPermission,
                                                               }) => {
    return (
        <div className="flex items-center justify-start space-x-4 p-4 bg-white shadow">
            {/* Botón: Crear nueva carpeta */}
            {hasPermission('can_create_folders') && (
                <button
                    className="btn btn-primary flex items-center space-x-2"
                    onClick={onCreateFolder}
                >
                    <FcFolder className="w-5 h-5" />
                    <span>Crear carpeta</span>
                </button>
            )}

            {/* Botón: Subir carpeta */}
            {hasPermission('can_upload_folders') && (
                <button
                    className="btn btn-primary flex items-center space-x-2"
                    onClick={onUploadFolder}
                >
                    <FcUpload className="w-5 h-5" />
                    <span>Subir carpeta</span>
                </button>
            )}

            {/* Botón: Subir archivo */}
            {hasPermission('can_upload_files') && (
                <button
                    className="btn btn-primary flex items-center space-x-2"
                    onClick={onUploadFile}
                >
                    <FcFile className="w-5 h-5" />
                    <span>Subir archivo</span>
                </button>
            )}

            {/* Botón: Descargar archivo */}
            {hasPermission('can_download_files') && (
                <button
                    className="btn btn-secondary flex items-center space-x-2"
                    onClick={onDownloadFile}
                    disabled={!isItemSelected}
                >
                    <FcDownload className="w-5 h-5" />
                    <span>Descargar</span>
                </button>
            )}

            {/* Botón: Eliminar */}
            {hasPermission('can_delete_files') && (
                <button
                    className="btn btn-error flex items-center space-x-2"
                    onClick={onDelete}
                    disabled={!isItemSelected}
                >
                    <FcDeleteRow className="w-5 h-5" />
                    <span>Eliminar</span>
                </button>
            )}

            {/* Dropdown: Ordenar */}
            {hasPermission('can_sort_files') && (
                <div className="dropdown dropdown-end">
                    <button
                        tabIndex={0}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <FcMenu className="w-5 h-5" />
                        <span>Ordenar</span>
                        <HiChevronDoubleDown className="w-4 h-4 ml-1" />
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <button onClick={() => onSort('date')}>Por fecha</button>
                        </li>
                        <li>
                            <button onClick={() => onSort('name')}>Por nombre</button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileManagerToolbar;
