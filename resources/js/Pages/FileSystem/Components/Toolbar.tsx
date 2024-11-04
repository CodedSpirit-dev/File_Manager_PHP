import React, { useState } from 'react';
import {
    FcFolder,
    FcDownload,
    FcDeleteRow,
    FcPlus,
    FcFile,
    FcOpenedFolder,
    FcList,
    FcSettings,
} from 'react-icons/fc';
import { TbCopy, TbCursorText, TbFolderPlus, TbFolderUp } from "react-icons/tb";
import { BsFileEarmarkArrowDown, BsFileEarmarkArrowUp, BsSortAlphaDown, BsSortAlphaDownAlt, BsSortNumericUp, BsSortNumericDownAlt } from "react-icons/bs";
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from "react-icons/md";
import { IoClose } from "react-icons/io5";

interface SortPayload {
    criteria: 'date' | 'name';
    order: 'asc' | 'desc';
}

interface FileManagerToolbarProps {
    onCreateFolder: () => void;
    onUploadFolder: () => void;
    onUploadFile: () => void;
    onDownloadFile: () => void; // Consolidada en lugar de onDownload
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
                                                               }) => {
    const [currentSortCriteria, setCurrentSortCriteria] = useState<'date' | 'name' | null>(null);
    const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSortClick = (criteria: 'date' | 'name') => {
        let newOrder: 'asc' | 'desc' = 'asc';

        if (currentSortCriteria === criteria) {
            newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        }

        setCurrentSortCriteria(criteria);
        setCurrentSortOrder(newOrder);

        onSort({ criteria, order: newOrder });
    };

    return (
        <div className="flex items-center justify-end p-4 bg-white flex-wrap">
            <div className="hidden sm:flex items-center space-x-4">
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

                <div className="dropdown">
                    <button
                        tabIndex={0}
                        className={`btn flex items-center space-x-2 ${!isItemSelected ? 'btn-disabled' : ''}`}
                        disabled={!isItemSelected}
                    >
                        <FcSettings  className="w-5 h-5" />
                        <span>Acciones</span>
                    </button>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
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
                        {!isItemSelected && (
                            <li className="px-4 py-2 text-gray-500">
                                Selecciona un elemento para ver las acciones disponibles.
                            </li>
                        )}
                    </ul>
                </div>

                {(isCopying || isMoving) && (
                    <>
                        {isCopying && (
                            <>
                                <button
                                    className="btn btn-primary flex items-center space-x-2 mr-2"
                                    onClick={onCopyHere}
                                >
                                    <BsFileEarmarkArrowDown className="w-5 h-5" />
                                    <span>Copiar aquí</span>
                                </button>
                                <button
                                    className="btn btn-secondary flex items-center space-x-2"
                                    onClick={onCancelCopy}
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
                                >
                                    <BsFileEarmarkArrowDown className="w-5 h-5" />
                                    <span>Mover aquí</span>
                                </button>
                                <button
                                    className="btn btn-secondary flex items-center space-x-2"
                                    onClick={onCancelMove}
                                >
                                    <IoClose className="w-5 h-5" />
                                    <span>Cancelar</span>
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

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
                        <button
                            onClick={() => handleSortClick('date')}
                            className={`flex items-center space-x-2 w-full text-left ${
                                currentSortCriteria === 'date' ? 'bg-primary text-white' : ''
                            }`}
                        >
                            {currentSortCriteria === 'date' ? (
                                currentSortOrder === 'asc' ? (
                                    <BsSortNumericUp className="w-5 h-5" />
                                ) : (
                                    <BsSortNumericDownAlt className="w-5 h-5" />
                                )
                            ) : (
                                <BsSortNumericUp className="w-5 h-5" />
                            )}
                            <span>Por fecha</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleSortClick('name')}
                            className={`flex items-center space-x-2 w-full text-left ${
                                currentSortCriteria === 'name' ? 'bg-primary text-white' : ''
                            }`}
                        >
                            {currentSortCriteria === 'name' ? (
                                currentSortOrder === 'asc' ? (
                                    <BsSortAlphaDown className="w-5 h-5" />
                                ) : (
                                    <BsSortAlphaDownAlt className="w-5 h-5" />
                                )
                            ) : (
                                <BsSortAlphaDown className="w-5 h-5" />
                            )}
                            <span>Por nombre</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default FileManagerToolbar;
