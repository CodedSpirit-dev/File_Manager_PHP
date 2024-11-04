// src/components/FileManager/FileManager.tsx

import React, { useState, useEffect } from 'react';
import FileManagerToolbar from './Components/Toolbar';
import Modal from './Components/Modal';
import FileViewer from './Components/FileViewer';
import { FaFolder, FaFile } from 'react-icons/fa';
import {
    getFiles,
    uploadFile,
    deleteFile,
    createFolder,
    uploadDirectory,
    deleteFolder,
    updateFolder,
} from './api';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {IoClose} from "react-icons/io5";

interface Item {
    id: number;
    name: string;
    type: 'file' | 'folder';
    date: Date;
}

const FileManager: React.FC = () => {
    const { auth } = usePage().props as any;
    const userPermissions: string[] = auth.user?.permissions || [];

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('public'); // Initial path
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState<boolean>(false);
    const [newFolderName, setNewFolderName] = useState<string>('');
    const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);
    const [fileToView, setFileToView] = useState<{ url: string; type: 'pdf' | 'docx' | 'xlsx' } | null>(null);

    // Fetch files and directories when the component mounts or currentPath changes
    useEffect(() => {
        fetchFiles();
    }, [currentPath]);

    const fetchFiles = async () => {
        try {
            const data = await getFiles(currentPath);
            setItems(formatItems(data.directories, data.files));
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('Error fetching files.');
        }
    };

    const handleNavigateBack = () => {
        const paths = currentPath.split('/');
        if (paths.length > 1) {
            paths.pop();
            setCurrentPath(paths.join('/'));
        }
    };

    // Format server data into Item objects
    const formatItems = (directories: string[], files: string[]): Item[] => {
        let idCounter = 1;
        const formattedDirectories = directories.map((dir) => ({
            id: idCounter++,
            name: dir.split('/').pop() || dir,
            type: 'folder' as const,
            date: new Date(),
        }));
        const formattedFiles = files.map((file) => ({
            id: idCounter++,
            name: file.split('/').pop() || file,
            type: 'file' as const,
            date: new Date(),
        }));
        return [...formattedDirectories, ...formattedFiles];
    };

    // Check user permissions
    const hasPermission = (permission: string): boolean => {
        return userPermissions.includes(permission);
    };

    // Handle item selection
    const handleSelectItem = (itemName: string) => {
        setSelectedItem((prev) => (prev === itemName ? null : itemName));
    };

    // Handle double-click on items (folders or files)
    const handleDoubleClickItem = (item: Item) => {
        if (item.type === 'folder') {
            setCurrentPath(`${currentPath}/${item.name}`);
        } else {
            const extension = item.name.split('.').pop()?.toLowerCase();
            if (extension === 'pdf' || extension === 'docx' || extension === 'xlsx') {
                setFileToView({
                    url: `/filemanager/files/view?filename=${encodeURIComponent(item.name)}&path=${encodeURIComponent(currentPath)}`,
                    type: extension as 'pdf' | 'docx' | 'xlsx',
                });
                setIsFileViewerOpen(true);
            } else {
                alert('File type not supported for viewing.');
            }
        }
    };


    // Toolbar action handlers
    const handleCreateFolderAction = () => {
        setIsCreateFolderOpen(true);
    };

    const handleConfirmCreateFolder = async () => {
        if (newFolderName.trim() === '') {
            alert('Folder name cannot be empty.');
            return;
        }

        try {
            const response = await createFolder(newFolderName, currentPath);
            alert(response.message);

            // Refresh items
            fetchFiles();

            setNewFolderName('');
            setIsCreateFolderOpen(false);
        } catch (error) {
            alert('Error creating folder.');
            console.error(error);
        }
    };

    const handleUploadFolderAction = async () => {
        const folderInput = document.createElement('input');
        folderInput.type = 'file';
        (folderInput as any).webkitdirectory = true; // Enable directory selection
        folderInput.onchange = async () => {
            if (folderInput.files && folderInput.files.length > 0) {
                try {
                    const response = await uploadDirectory(folderInput.files, currentPath);
                    alert(response.message);
                    fetchFiles(); // Refresh items
                } catch (error) {
                    alert('Error uploading folder.');
                    console.error(error);
                }
            }
        };
        folderInput.click();
    };

    const handleUploadFileAction = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async () => {
            if (fileInput.files && fileInput.files[0]) {
                try {
                    const response = await uploadFile(fileInput.files[0], currentPath);
                    alert(response.message);
                    fetchFiles(); // Refresh items
                } catch (error) {
                    alert('Error uploading file.');
                    console.error(error);
                }
            }
        };
        fileInput.click();
    };

    const handleDownloadFileAction = async () => {
        if (selectedItem) {
            const item = items.find((i) => i.name === selectedItem);
            if (item && item.type === 'file') {
                try {
                    const response = await axios.get(`/filemanager/files/download`, {
                        params: { filename: selectedItem, path: currentPath },
                        responseType: 'blob',
                    });
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', selectedItem);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode?.removeChild(link);
                } catch (error) {
                    alert('Error downloading file.');
                    console.error(error);
                }
            } else {
                alert('Please select a file to download.');
            }
        }
    };

    const handleDeleteAction = async () => {
        if (selectedItem) {
            const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedItem}"?`);
            if (confirmDelete) {
                try {
                    const item = items.find((i) => i.name === selectedItem);
                    if (item) {
                        let response;
                        if (item.type === 'file') {
                            response = await deleteFile(selectedItem, currentPath);
                        } else if (item.type === 'folder') {
                            response = await deleteFolder(selectedItem, currentPath);
                        }
                        alert(response.message);
                        fetchFiles(); // Refresh items
                        setSelectedItem(null);
                    }
                } catch (error) {
                    alert('Error deleting item.');
                    console.error(error);
                }
            }
        }
    };

    const handleCopy = async () => {
        if (selectedItem) {
            alert('Copy functionality not implemented yet.');
            // Implement copy logic here
        }
    };

    const handleMove = async () => {
        if (selectedItem) {
            alert('Move functionality not implemented yet.');
            // Implement move logic here
        }
    };

    const handleRename = async () => {
        if (selectedItem) {
            const newName = prompt(`Enter the new name for "${selectedItem}":`);
            if (newName && newName.trim() !== '') {
                try {
                    const item = items.find((i) => i.name === selectedItem);
                    if (item) {
                        let response;
                        if (item.type === 'folder') {
                            response = await updateFolder(item.name, newName, currentPath);
                        } else {
                            alert('Renaming files is not implemented yet.');
                            return;
                        }
                        alert(response.message);
                        fetchFiles(); // Refresh items
                        setSelectedItem(null);
                    }
                } catch (error) {
                    alert('Error renaming item.');
                    console.error(error);
                }
            }
        }
    };

    const handleSort = (criteria: 'date' | 'name') => {
        const sortedItems = [...items].sort((a, b) => {
            if (criteria === 'date') {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else {
                return a.name.localeCompare(b.name);
            }
        });
        setItems(sortedItems);
    };

    return (
        <div className="file-manager bg-white">
            {/* Navigation bar */}
            <div className="flex items-center p-4 bg-gray-100 shadow">
                <button
                    className={`btn btn-secondary mr-2 ${currentPath === 'public' ? 'btn-disabled' : ''}`}
                    onClick={handleNavigateBack}
                    disabled={currentPath === 'public'}
                >
                    Back
                </button>
                <span className="text-lg font-semibold">Path: /{currentPath}</span>
            </div>

            {/* Toolbar */}
            <FileManagerToolbar
                onCreateFolder={handleCreateFolderAction}
                onUploadFolder={handleUploadFolderAction}
                onUploadFile={handleUploadFileAction}
                onDownloadFile={handleDownloadFileAction}
                onDelete={handleDeleteAction}
                onSort={handleSort}
                isItemSelected={selectedItem !== null}
                hasPermission={hasPermission}
                onCopy={handleCopy}
                onMove={handleMove}
                onRename={handleRename}
            />

            {/* Modal for Creating New Folder */}
            <Modal
                isOpen={isCreateFolderOpen}
                title="Create New Folder"
                onClose={() => setIsCreateFolderOpen(false)}
            >
                <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="input input-bordered w-full"
                />
                <div className="flex justify-end mt-4 space-x-2">
                    <button className="btn btn-secondary" onClick={() => setIsCreateFolderOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleConfirmCreateFolder}>
                        Create
                    </button>
                </div>
            </Modal>

            {/* Modal for Viewing Files */}
            {isFileViewerOpen && fileToView && fileToView.type && (
                <Modal
                    isOpen={isFileViewerOpen}
                    title={`Visualizando: ${selectedItem}`}
                    onClose={() => setIsFileViewerOpen(false)}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{`Visualizando: ${selectedItem}`}</h2>
                        <button onClick={() => setIsFileViewerOpen(false)} className="text-gray-500 hover:text-gray-700">
                            <IoClose size={24} />
                        </button>
                    </div>
                    <div className="h-96 overflow-auto">
                        <FileViewer fileUrl={fileToView.url} fileType={fileToView.type} />
                    </div>
                </Modal>
            )}

            {/* Items List */}
            <div className="p-4">
                {items.length === 0 ? (
                    <p>No files or folders available.</p>
                ) : (
                    <ul className="grid grid-cols-4 gap-4">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className={`p-4 border rounded-lg cursor-pointer flex flex-col items-center ${
                                    selectedItem === item.name ? 'bg-blue-100' : 'bg-white'
                                } hover:bg-gray-200 transition-colors duration-200`}
                                onClick={() => handleSelectItem(item.name)}
                                onDoubleClick={() => handleDoubleClickItem(item)}
                            >
                                {/* Icon */}
                                <span className="text-4xl">
                                    {item.type === 'folder' ? <FaFolder /> : <FaFile />}
                                </span>
                                <span className="mt-2 text-center truncate w-full">{item.name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default FileManager;
