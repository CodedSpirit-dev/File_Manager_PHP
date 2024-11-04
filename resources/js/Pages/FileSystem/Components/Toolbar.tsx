import React from 'react';
import {
    FcFolder,
    FcDownload,
    FcDeleteRow,
    FcPlus,
    FcFile, FcOpenedFolder, FcGenericSortingAsc, FcList,
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
            {/* Grupo de dropdowns para pantallas grandes (≥1024px) */}
            <div className="hidden lg:flex items-center space-x-4">
                {/* Dropdown: Acciones de Carpetas */}
                <div className="dropdown dropdown-bottom">
                    <button
                        tabIndex={0}
                        className="btn flex items-center space-x-2"
                    >
                        <FcOpenedFolder className="w-5 h-5" />
                        <span>Acciones de Carpetas</span>
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
                    </ul>
                </div>

                {/* Dropdown: Acciones de Archivos */}
                <div className="dropdown">
                    <button
                        tabIndex={0}
                        className="btn flex items-center space-x-2"
                    >
                        <FcFile className="w-5 h-5" />
                        <span>Acciones de Archivos</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <button onClick={onUploadFile} className="flex items-center space-x-2 w-full text-left">
                                <BsFileEarmarkArrowUp className="w-5 h-5" />
                                <span>Subir archivo</span>
                            </button>
                        </li>
                        {isItemSelected && (
                            <>
                                <li>
                                    <button onClick={onDownloadFile}
                                            className="flex items-center space-x-2 w-full text-left">
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
                    </ul>
                </div>
            </div>

            {/* Grupo de botones para pantallas pequeñas (<1024px) */}
            <div className="flex lg:hidden items-center space-x-2">
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
                        {isItemSelected && (
                            <>
                                <li>
                                    <button onClick={onDownloadFile}
                                            className="flex items-center space-x-2 w-full text-left">
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
                    </ul>
                </div>
            </div>

            {/* Dropdown: Ordenar */}
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
