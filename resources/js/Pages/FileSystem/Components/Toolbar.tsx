// src/components/FileManager/Components/Toolbar.tsx

import React from 'react';
import {
    FcFolder,
    FcDownload,
    FcDeleteRow,
    FcPlus,
    FcFile,
    FcOpenedFolder,
    FcList,
} from 'react-icons/fc';
import { TbCopy, TbCursorText, TbFolderPlus, TbFolderUp } from "react-icons/tb";
import { BsFileEarmarkArrowDown, BsFileEarmarkArrowUp, BsSortAlphaDown, BsSortNumericUp } from "react-icons/bs";
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";

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
            {/* Dropdowns Separados para Pantallas Grandes (≥640px) */}
            <div className="hidden sm:flex items-center space-x-4">
                {/* Dropdown: Crear */}
                <div className="dropdown dropdown-bottom">
                    <button
                        tabIndex={0}
                        className="btn flex items-center space-x-2"
                    >
                        <FcPlus className="w-5 h-5" />
                        <span>Crear</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
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

                {/* Dropdown: Acciones */}
                <div className="dropdown">
                    <button
                        tabIndex={0}
                        className={`btn flex items-center space-x-2 ${!isItemSelected ? 'btn-disabled' : ''}`}
                        disabled={!isItemSelected}
                    >
                        <FcFolder className="w-5 h-5" />
                        <span>Acciones</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        {isItemSelected && (
                            <>
                                <li>
                                    <button onClick={onDownloadFile} className="flex items-center space-x-2 w-full text-left">
                                        <BsFileEarmarkArrowDown className="w-5 h-5" />
                                        <span>Descargar archivo</span>
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
                        )}
                        {!isItemSelected && (
                            <li className="px-4 py-2 text-gray-500">
                                Selecciona un elemento para ver las acciones disponibles.
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Dropdown Único para Pantallas Pequeñas (<640px) */}
            <div className="flex sm:hidden items-center space-x-2">
                {/* Dropdown: Crear y Acciones */}
                <div className="dropdown dropdown-bottom mr-2">
                    <button
                        tabIndex={0}
                        className="btn flex items-center space-x-2"
                    >
                        <FcPlus className="w-5 h-5" />
                        <span>Acciones</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64"
                    >
                        {/* Sección: Crear */}
                        <li className="font-semibold px-2 py-1">Crear</li>
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
                        <hr className="my-2 border-gray-300" />
                        {/* Sección: Acciones */}
                        <li className="font-semibold px-2 py-1">Acciones</li>
                        {isItemSelected ? (
                            <>
                                <li>
                                    <button onClick={onDownloadFile} className="flex items-center space-x-2 w-full text-left">
                                        <BsFileEarmarkArrowDown className="w-5 h-5" />
                                        <span>Descargar archivo</span>
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
            </div>

            {/* Dropdown: Ordenar (Visible en todas las pantallas) */}
            <div className="dropdown dropdown-bottom dropdown-end ml-2">
                <button
                    tabIndex={0}
                    className="btn flex items-center space-x-2"
                >
                    <FcList className="w-5 h-5" />
                    <span>Ordenar</span>
                </button>
                <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                    <li>
                        <button onClick={() => onSort('date')} className="flex items-center space-x-2 w-full text-left">
                            <BsSortNumericUp className="w-5 h-5" />
                            <span>Por fecha</span>
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onSort('name')} className="flex items-center space-x-2 w-full text-left">
                            <BsSortAlphaDown className="w-5 h-5" />
                            <span>Por nombre</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default FileManagerToolbar;
