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
            const userData = await getUserHierarchy();
            setUserHierarchy(userData.hierarchy_level);
            setUserCompany(userData.company_name);

            // Redirigir a la carpeta de la compañía si no es administrador
            if (userData.hierarchy_level > 0) {
                setCurrentPath(`public/${userData.company_name}`);
            } else {
                setCurrentPath('public');
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
        const { directories, files } = await getFiles(path);
        setDirectories(directories);
        setFiles(files);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            const response = await uploadFile(selectedFile, currentPath);
            setMessage(response.message);
            setSelectedFile(null);
            fetchFiles(currentPath);
        }
    };

    const handleDelete = async (filename) => {
        const response = await deleteFile(filename);
        setMessage(response.message);
        fetchFiles(currentPath);
    };

    const handleCreateFolder = async () => {
        if (folderName) {
            const response = await createFolder(folderName, currentPath);
            setMessage(response.message);
            setFolderName('');
            fetchFiles(currentPath);
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
        <div className="container mx-auto p-6">
            <div className="card bg-base-200 shadow-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Gestor de Archivos</h1>

                {(userHierarchy === 0 || userHierarchy < 3) && (
                    <div className="form-control mb-4">
                        <label className="input-group">
                            <input
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                placeholder="Nombre de la nueva carpeta"
                                className="input input-bordered w-full mb-2"
                            />
                            <button className="btn btn-primary mt-2" onClick={handleCreateFolder}>
                                <FcAddDatabase className="mr-2" /> Crear Carpeta
                            </button>
                        </label>
                    </div>
                )}

                <div className="form-control mb-4">
                    <div className="input-group">
                        <input type="file" onChange={handleFileChange} className={'file-input file-input-md w-full max-w-xs'} />
                        <button className="btn btn-secondary" onClick={handleUpload}>
                            <FcUpload className="mr-2" /> Subir Archivo
                        </button>
                    </div>
                </div>

                {message && <div className="alert alert-success mb-4">{message}</div>}

                <h2 className="text-xl font-semibold mb-4">Lista de Carpetas y Archivos</h2>
                <div className="mb-4">
                    <button onClick={goBack} disabled={currentPath === `public/${userCompany}`} className="btn btn-outline mb-4">
                        Volver
                    </button>
                </div>

                <div className="flex flex-col space-y-2">
                    {directories.map((directory, index) => (
                        <div
                            key={index}
                            className="card bg-base-100 shadow-md p-4 flex items-center justify-between"
                        >
                            <button
                                onClick={() => enterDirectory(directory)}
                                className="btn btn-link text-left flex items-center w-full text-lg"
                            >
                                <FcFolder size={40} className="mr-2" /> {directory.split('/').pop()}
                            </button>
                        </div>
                    ))}
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="card bg-base-100 shadow-md p-4 flex items-center justify-between"
                        >
                            <a
                                href={`http://localhost:8000/storage/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center w-full"
                            >
                                <FcDocument size={40} className="mr-2" /> {file.split('/').pop()}
                            </a>
                            <button
                                onClick={() => handleDelete(file.split('/').pop())}
                                className="btn btn-error btn-sm ml-4"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileManager;
