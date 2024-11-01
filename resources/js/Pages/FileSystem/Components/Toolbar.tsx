// src/components/FileManager/Components/FileManagerToolbar.tsx

import React from 'react';
import { FcFolder, FcUpload, FcFile, FcDownload, FcDeleteRow, FcMenu } from 'react-icons/fc';
import {BiSolidChevronDown} from "react-icons/bi";
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
        <div className="flex items-center justify-start space-x-4 p-4 bg-white">
            {/* Botón: Crear nueva carpeta */}
            {hasPermission('can_create_folders') && (
                <button
                    className="btn btn-primary flex items-center space-x-2"
                    onClick={onCreateFolder}
                >
                    <FcFolder className="w-5 h-5" />
                    <span>Crear nueva carpeta</span>
                </button>
            )}

            {/* Botón: Subir carpeta */}
            {hasPermission('can_create_folders') && (
                <button
                    className="btn btn-primary flex items-center space-x-2"
                    onClick={onUploadFolder}
                >
                    <FcUpload className="w-5 h-5" />
                    <span>Subir carpeta</span>
                </button>
            )}

            {/* Botón: Subir archivo */}
            {hasPermission('can_create_files') && (
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
                    <span>Descargar archivo</span>
                </button>
            )}

            {/* Botón: Eliminar */}
            {(hasPermission('can_delete_files') || hasPermission('can_delete_folders')) && (
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
            <div className="dropdown dropdown-end">
                <button
                    tabIndex={0}
                    className="btn btn-secondary flex items-center space-x-2"
                >
                    <FcMenu className="w-5 h-5" />
                    <span>Ordenar</span>
                    <BiSolidChevronDown className="w-4 h-4 ml-1" />
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
        </div>
    );
};

export default FileManagerToolbar;
