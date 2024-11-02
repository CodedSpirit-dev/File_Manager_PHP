// src/components/FileManager/Components/FileManagerToolbar.tsx

import React from 'react';
import {
    FcFolder,
    FcUpload,
    FcFile,
    FcDownload,
    FcDeleteRow,
    FcMenu,
    FcPlus,
} from 'react-icons/fc';
import {BarsArrowDownIcon} from "@heroicons/react/16/solid";
import {TbCopy, TbCursorText, TbDownload, TbFileUpload, TbFolderPlus, TbFolderUp} from "react-icons/tb";

interface FileManagerToolbarProps {
    onCreateFolder: () => void,
    onUploadFolder: () => void,
    onUploadFile: () => void,
    onDownloadFile: () => void,
    onDelete: () => void,
    onCopy: () => void,
    onRename: () => void,
    onMove: () => void,
    onSort: (criteria: 'date' | 'name') => void,
    isItemSelected: boolean,
    hasPermission?: (permission: string) => boolean
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
                                                                   hasPermission
                                                               }) => {
    return (
        <div className="flex items-center justify-end p-4 bg-white flex-wrap">
            {/* Grupo de botones para pantallas grandes (≥1024px) */}
            <div className="hidden lg:flex items-center space-x-4">
                {/* Botón: Crear nueva carpeta */}
                <button
                    className="btn flex items-center space-x-2"
                    onClick={onCreateFolder}
                >
                    <TbFolderPlus className="w-5 h-5"/>
                    <span>Crear carpeta</span>
                </button>

                {/* Botón: Subir carpeta */}
                <button
                    className="btn flex items-center space-x-2"
                    onClick={onUploadFolder}
                >
                    <FcUpload className="w-5 h-5"/>
                    <span>Subir carpeta</span>
                </button>

                {/* Botón: Subir archivo */}
                <button
                    className="btn flex items-center space-x-2"
                    onClick={onUploadFile}
                >
                    <TbFileUpload className="w-5 h-5"/>
                    <span>Subir archivo</span>
                </button>

                {/* Botón: Descargar archivo */}
                {isItemSelected && (
                    <button
                        className="btn btn-secondary flex items-center space-x-2"
                        onClick={onDownloadFile}
                    >
                        <TbDownload className="w-5 h-5"/>
                        <span>Descargar archivo</span>
                    </button>
                )}

                {/* Botón: Copiar */}
                {isItemSelected && (
                    <button
                        className="btn flex items-center space-x-2"
                        onClick={onCopy}
                    >
                        {/* Reemplaza con un icono adecuado para Copiar */}
                        <FcFolder className="w-5 h-5"/>
                        <span>Copiar</span>
                    </button>
                )}

                {/* Botón: Cambiar nombre */}
                {isItemSelected && (
                    <button
                        className="btn flex items-center space-x-2"
                        onClick={onRename}
                    >
                        {/* Reemplaza con un icono adecuado para Cambiar nombre */}
                        <FcFolder className="w-5 h-5"/>
                        <span>Cambiar nombre</span>
                    </button>
                )}

                {/* Botón: Mover */}
                {isItemSelected && (
                    <button
                        className="btn flex items-center space-x-2"
                        onClick={onMove}
                    >
                        {/* Reemplaza con un icono adecuado para Mover */}
                        <FcFolder className="w-5 h-5"/>
                        <span>Mover</span>
                    </button>
                )}

                {/* Botón: Eliminar */}
                {isItemSelected && (
                    <button
                        className="btn btn-error flex items-center space-x-2"
                        onClick={onDelete}
                    >
                        <FcDeleteRow className="w-5 h-5"/>
                        <span>Eliminar</span>
                    </button>
                )}
            </div>

            {/* Grupo de botones para pantallas pequeñas (<1024px) */}
            <div className="flex lg:hidden items-center space-x-2">
                {/* Botón agrupado con FcPlus */}
                <div className="dropdown dropdown-right z-[10]">
                    <button
                        tabIndex={0}
                        className="btn flex items-center space-x-2"
                    >
                        <FcPlus className="w-5 h-5"/>
                        <span>Acciones</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        {/* Botón: Crear nueva carpeta */}
                        <li>
                            <button onClick={onCreateFolder} className="flex items-center space-x-2 w-full text-left">
                                <FcFolder className="w-5 h-5"/>
                                <span>Crear carpeta</span>
                            </button>
                        </li>
                        {/* Botón: Subir carpeta */}
                        <li>
                            <button onClick={onUploadFolder} className="flex items-center space-x-2 w-full text-left">
                                <TbFolderUp className="w-5 h-5"/>
                                <span>Subir carpeta</span>
                            </button>
                        </li>
                        {/* Botón: Subir archivo */}
                        <li>
                            <button onClick={onUploadFile} className="flex items-center space-x-2 w-full text-left">
                                <FcFile className="w-5 h-5"/>
                                <span>Subir archivo</span>
                            </button>
                        </li>
                        {/* Botón: Descargar archivo */}
                        {isItemSelected && (
                            <li>
                                <button onClick={onDownloadFile}
                                        className="flex items-center space-x-2 w-full text-left">
                                    <FcDownload className="w-5 h-5"/>
                                    <span>Descargar archivo</span>
                                </button>
                            </li>
                        )}
                        {/* Botón: Copiar */}
                        {isItemSelected && (
                            <li>
                                <button onClick={onCopy} className="flex items-center space-x-2 w-full text-left">
                                    {/* Reemplaza con un icono adecuado para Copiar */}
                                    <TbCopy className="w-5 h-5"/>
                                    <span>Copiar</span>
                                </button>
                            </li>
                        )}
                        {/* Botón: Cambiar nombre */}
                        {isItemSelected && (
                            <li>
                                <button onClick={onRename} className="flex items-center space-x-2 w-full text-left">
                                    {/* Reemplaza con un icono adecuado para Cambiar nombre */}
                                    <TbCursorText className="w-5 h-5"/>
                                    <span>Cambiar nombre</span>
                                </button>
                            </li>
                        )}
                        {/* Botón: Mover */}
                        {isItemSelected && (
                            <li>
                                <button onClick={onMove} className="flex items-center space-x-2 w-full text-left">
                                    {/* Reemplaza con un icono adecuado para Mover */}
                                    <FcFolder className="w-5 h-5"/>
                                    <span>Mover</span>
                                </button>
                            </li>
                        )}
                        {/* Botón: Eliminar */}
                        {isItemSelected && (
                            <li>
                                <button onClick={onDelete} className="flex items-center space-x-2 w-full text-left">
                                    <FcDeleteRow className="w-5 h-5"/>
                                    <span>Eliminar</span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Dropdown: Ordenar */}
            <div className="dropdown dropdown-right z-[3]">
                <button
                    tabIndex={0}
                    className="btn flex items-center space-x-2"
                >
                    <FcMenu className="w-5 h-5"/>
                    <span>Ordenar</span>
                </button>
                <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                    <li>
                        <button onClick={() => onSort('date')} className="w-full text-left">Por fecha</button>
                    </li>
                    <li>
                        <button onClick={() => onSort('name')} className="w-full text-left">Por nombre</button>
                    </li>
                </ul>
            </div>
        </div>
    );

};

export default FileManagerToolbar;
