import React, { useState, useEffect } from 'react';
import { getFiles, uploadFile, deleteFile, createFolder, getUserHierarchy } from './api.jsx';
import { FcFolder, FcDocument, FcUpload, FcAddDatabase } from 'react-icons/fc';

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [message, setMessage] = useState('');
    const [userHierarchy, setUserHierarchy] = useState(null); // Nivel de jerarquía
    const [userCompany, setUserCompany] = useState(''); // Nombre de la compañía del usuario

    // Cargar jerarquía y establecer carpeta inicial de la compañía
    useEffect(() => {
        const initializePath = async () => {
            try {
                const userData = await getUserHierarchy();
                setUserHierarchy(userData.hierarchy_level);
                setUserCompany(userData.company_name);

                // Redirigir a la carpeta de la compañía si no es administrador
                if (userData.hierarchy_level > 0) {
                    setCurrentPath(`public/${userData.company_name}`);
                } else {
                    setCurrentPath('public');
                }
            } catch (error) {
                console.error('Error al obtener la jerarquía del usuario:', error);
                setMessage('Error al obtener la jerarquía del usuario');
            }
        };

        initializePath();
    }, []);

    // Cargar archivos y carpetas en la ruta actual
    useEffect(() => {
        if (currentPath) {
            fetchFiles(currentPath);
        }
    }, [currentPath]);

    const fetchFiles = async (path) => {
        try {
            const { directories, files } = await getFiles(path);
            setDirectories(directories);
            setFiles(files);
        } catch (error) {
            console.error('Error al obtener archivos y carpetas:', error);
            setMessage('Error al obtener archivos y carpetas');
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            try {
                const response = await uploadFile(selectedFile, currentPath);
                setMessage(response.message);
                setSelectedFile(null);
                fetchFiles(currentPath);
            } catch (error) {
                console.error('Error al subir archivo:', error);
                setMessage('Error al subir archivo');
            }
        } else {
            setMessage('Seleccione un archivo para subir');
        }
    };

    const handleDelete = async (filename) => {
        if (filename) {
            try {
                const response = await deleteFile(filename);
                setMessage(response.message);
                fetchFiles(currentPath);
            } catch (error) {
                console.error('Error al eliminar archivo:', error);
                setMessage('Error al eliminar archivo');
            }
        }
    };

    const handleCreateFolder = async () => {
        if (folderName.trim()) {
            try {
                const response = await createFolder(folderName, currentPath);
                setMessage(response.message);
                setFolderName('');
                fetchFiles(currentPath);
            } catch (error) {
                console.error('Error al crear carpeta:', error);
                setMessage('Error al crear carpeta');
            }
        } else {
            setMessage('Ingrese un nombre para la carpeta');
        }
    };

    const enterDirectory = (directory) => {
        setCurrentPath(directory);
    };

    const goBack = () => {
        const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        setCurrentPath(parentPath || `public/${userCompany}`);
    };

    return (
        <div className="file-manager-container">
            <h1 className="file-manager-title">Gestor de Archivos</h1>

            {/* Crear Carpeta */}
            {(userHierarchy === 0 || userHierarchy < 3) && (
                <div className="file-manager-form-control">
                    <div className="file-manager-form-flex">
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="Nombre de la nueva carpeta"
                            className="file-manager-input"
                        />
                        <button className="file-manager-create-button" onClick={handleCreateFolder}>
                            <FcAddDatabase className="mr-2" /> Crear Carpeta
                        </button>
                    </div>
                </div>
            )}

            {/* Subir Archivo */}
            <div className="file-manager-form-control">
                <div className="file-manager-form-flex">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-manager-input"
                    />
                    <button className="file-manager-upload-button" onClick={handleUpload}>
                        <FcUpload size={36} className="mr-2" /> Subir Archivo
                    </button>
                </div>
            </div>

            {/* Mensaje de Estado */}
            {message && (
                <div className={`file-manager-message ${message.includes('Error') ? 'file-manager-message-error' : 'file-manager-message-success'}`}>
                    {message}
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-6 text-center">Lista de Carpetas y Archivos</h2>
            <div className="mb-6 flex justify-center">
                <button
                    onClick={goBack}
                    disabled={currentPath === `public/${userCompany}`}
                    className={`file-manager-back-button ${currentPath === `public/${userCompany}` ? 'file-manager-back-button-disabled' : ''}`}
                >
                    Volver
                </button>
            </div>

            {/* Lista de Carpetas y Archivos */}
            <div className="file-manager-grid">
                {directories.map((directory, index) => (
                    <div
                        key={index}
                        className="file-manager-card"
                    >
                        <button
                            onClick={() => enterDirectory(directory)}
                            className="file-manager-card-button"
                        >
                            <FcFolder className="file-manager-folder-icon" />
                            <span className="file-manager-name" title={directory.split('/').pop()}>
                                {directory.split('/').pop()}
                            </span>
                        </button>
                    </div>
                ))}
                {files.map((file, index) => (
                    <div
                        key={index}
                        className="file-manager-card"
                    >
                        <a
                            href={`http://localhost:8000/storage/${file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-manager-card-link"
                        >
                            <FcDocument size={70}/>
                            <span className="file-manager-name" title={file.split('/').pop()}>
            {file.split('/').pop()}
        </span>
                        </a>
                        <button
                            onClick={() => handleDelete(file.split('/').pop())}
                            className="file-manager-delete-button"
                        >
                            Eliminar
                        </button>
                    </div>

                ))}
            </div>
        </div>
    );

};

export default FileManager;
