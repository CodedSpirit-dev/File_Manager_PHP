// src/components/FileManagerToolbar.tsx

import React, { useState } from 'react';
import {
    FcPlus,
    FcSettings,
} from "react-icons/fc";
import { TbCopy, TbFolderPlus, TbFolderUp } from "react-icons/tb";
import {
    BsFileEarmarkArrowDown,
    BsFileEarmarkArrowUp,
    BsSortAlphaDown,
    BsSortAlphaDownAlt
} from "react-icons/bs";
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove, MdEdit } from "react-icons/md";
import { IoClose, IoChevronBackOutline } from "react-icons/io5";
import { BiExtension, BiSolidExtension } from 'react-icons/bi';
import { Menu } from '@headlessui/react';
import { useAuth } from "@/contexts/AuthProvider";
import { Permissions } from "@/contexts/AuthProvider";

interface SortPayload {
    criteria: 'name' | 'type';
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
    onBack: () => void;
    canGoBack: boolean;
    selectedItemsCount: number;
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
                                                                   selectedItemsCount,
                                                               }) => {
    const { hasPermission } = useAuth();

    const [sortConfigIndex, setSortConfigIndex] = useState<number>(0);

    const sortConfigs = [
        { criteria: 'name' as 'name' | 'type', order: 'asc' as 'asc' | 'desc', icon: BsSortAlphaDown, label: 'Ordenar A-Z' },
        { criteria: 'name' as 'name' | 'type', order: 'desc' as 'asc' | 'desc', icon: BsSortAlphaDownAlt, label: 'Ordenar Z-A' },
        { criteria: 'type' as 'name' | 'type', order: 'asc' as 'asc' | 'desc', icon: BiExtension, label: 'Tipo A-Z' },
        { criteria: 'type' as 'name' | 'type', order: 'desc' as 'asc' | 'desc', icon: BiSolidExtension, label: 'Tipo Z-A' },
    ];

    const handleSortToggle = () => {
        const nextIndex = (sortConfigIndex + 1) % sortConfigs.length;
        setSortConfigIndex(nextIndex);
        const newSortConfig = sortConfigs[nextIndex];
        onSort({ criteria: newSortConfig.criteria, order: newSortConfig.order });
    };

    // Verificación de permisos utilizando `keyof Permissions` para evitar errores de tipo
    const canCreateFolder = hasPermission('can_create_folders' as keyof Permissions);
    const canUploadFile = hasPermission('can_upload_files_and_folders' as keyof Permissions);
    const canDownload = hasPermission('can_download_files_and_folders' as keyof Permissions);
    const canCopy = hasPermission('can_copy_files' as keyof Permissions);
    const canRename = hasPermission('can_rename_files_and_folders' as keyof Permissions);
    const canMove = hasPermission('can_move_files' as keyof Permissions);
    const canDelete = hasPermission('can_delete_files_and_folders' as keyof Permissions);

    return (
        <>
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-base-100 shadow-sm rounded-lg z-40">
                <div className="flex flex-wrap items-center space-x-2">
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

                    {(canCreateFolder || canUploadFile) && (
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="btn btn-outline flex items-center space-x-2 hover:text-primary-content">
                                    <FcPlus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Crear</span>
                                </Menu.Button>
                            </div>

                            <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-base-100 border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                                <div className="py-1">
                                    {canCreateFolder && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onCreateFolder}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <TbFolderPlus className="w-5 h-5 mr-2" />
                                                    Crear carpeta
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {canUploadFile && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onUploadFile}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <BsFileEarmarkArrowUp className="w-5 h-5 mr-2" />
                                                    Subir archivo
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                            </Menu.Items>
                        </Menu>
                    )}

                    {(canDownload || canCopy || canRename || canMove || canDelete) && (
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button
                                    className={`btn btn-outline flex items-center space-x-2 hover:text-primary-content ${selectedItemsCount === 0 ? 'btn-disabled' : ''}`}
                                    disabled={selectedItemsCount === 0}
                                    aria-label="Acciones"
                                >
                                    <FcSettings className="w-5 h-5" />
                                    <span className="hidden sm:inline">Acciones</span>
                                </Menu.Button>
                            </div>

                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-base-100 border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-50">
                                <div className="py-1">
                                    {canDownload && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onDownloadFile}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <BsFileEarmarkArrowDown className="w-5 h-5 mr-2" />
                                                    Descargar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {canCopy && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onCopy}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <TbCopy className="w-5 h-5 mr-2" />
                                                    Copiar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {canRename && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onRename}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <MdEdit className="w-5 h-5 mr-2" />
                                                    Renombrar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {canMove && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onMove}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <MdOutlineDriveFileMove className="w-5 h-5 mr-2" />
                                                    Mover
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {canDelete && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onDelete}
                                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                >
                                                    <MdOutlineDeleteOutline className="w-5 h-5 mr-2" />
                                                    Eliminar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                            </Menu.Items>
                        </Menu>
                    )}

                    {/* Botón de Ordenar */}
                    <button
                        onClick={handleSortToggle}
                        className="btn btn-outline flex items-center space-x-2 hover:text-primary-content ml-2"
                        aria-label={`Ordenar por ${sortConfigs[sortConfigIndex].criteria}`}
                    >
                        {React.createElement(sortConfigs[sortConfigIndex].icon, { className: 'w-5 h-5' })}
                        <span className="hidden sm:inline">{sortConfigs[sortConfigIndex].label}</span>
                    </button>
                </div>
            </div>

            {/* Contenedor Flotante para Acciones de Copiar/Mover */}
            {(isCopying || isMoving) && (
                <div className="fixed bottom-0 left-0 right-0 p-4 text-white flex justify-center items-center space-x-4 z-50">
                    {isCopying && (
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
                    {isMoving && (
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
        </>
    );

};

export default FileManagerToolbar;
