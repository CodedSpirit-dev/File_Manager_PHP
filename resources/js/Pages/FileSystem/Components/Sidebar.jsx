import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from '@inertiajs/react';
import { FcFolder, FcCreateNewFolder, FcNoteAdd, FcSettings, FcExitToApp, FcPersonAdd, FcUpload, FcAddDatabase } from 'react-icons/fc';
import ProgressBar from './ProgressBar';
import { useAuthStore, useFileStore, useLayoutStore } from '../stores';
import * as auth from '../utils/auth';
import { version, signup, disableExternal, disableUsedPercentage, noAuth, loginPage } from '../utils/constants';
import { files as api, getFiles, uploadFile, deleteFile, createFolder, getUserHierarchy } from '../fileManagerApi.tsx';
import prettyBytes from 'pretty-bytes';

const USAGE_DEFAULT = { used: '0 B', total: '0 B', usedPercentage: 0 };

const Sidebar = () => {
    const [usage, setUsage] = useState(USAGE_DEFAULT);
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [currentPath, setCurrentPath] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [message, setMessage] = useState('');
    const [userHierarchy, setUserHierarchy] = useState(null);
    const [userCompany, setUserCompany] = useState('');
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuthStore();
    const { isFiles, reload } = useFileStore();
    const { currentPromptName, closeHovers, showHover } = useLayoutStore();

    const active = currentPromptName === 'sidebar';
    const canLogout = !noAuth && loginPage;

    useEffect(() => {
        if (isFiles) {
            fetchUsage();
        }
    }, [isFiles]);

    useEffect(() => {
        const initializePath = async () => {
            const userData = await getUserHierarchy();
            setUserHierarchy(userData.hierarchy_level);
            setUserCompany(userData.company_name);

            if (userData.hierarchy_level > 0) {
                setCurrentPath(`public/${userData.company_name}`);
            } else {
                setCurrentPath('public');
            }
        };

        initializePath();
    }, []);

    useEffect(() => {
        if (currentPath) {
            fetchFiles(currentPath);
        }
    }, [currentPath]);

    const fetchUsage = async () => {
        let path = window.location.pathname.endsWith('/')
            ? window.location.pathname
            : window.location.pathname + '/';
        let usageStats = USAGE_DEFAULT;
        if (disableUsedPercentage) {
            setUsage(usageStats);
            return;
        }
        try {
            const usageData = await api.usage(path);
            usageStats = {
                used: prettyBytes(usageData.used, { binary: true }),
                total: prettyBytes(usageData.total, { binary: true }),
                usedPercentage: Math.round((usageData.used / usageData.total) * 100),
            };
        } catch (error) {
            console.error(error);
        }
        setUsage(usageStats);
    };

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

    const toRoot = () => {
        navigate('/files');
        closeHovers();
    };

    const toSettings = () => {
        navigate('/settings');
        closeHovers();
    };

    return (
        <nav className={`sidebar ${active ? 'active' : ''}`}>
            {isLoggedIn ? (
                <>
                    <button className="action" onClick={toRoot} aria-label="My Files" title="My Files">
                        <FcFolder className="icon" />
                        <span>My Files</span>
                    </button>

                    {user.perm.create && (
                        <>
                            <button
                                onClick={() => showHover('newDir')}
                                className="action"
                                aria-label="New Folder"
                                title="New Folder"
                            >
                                <FcCreateNewFolder className="icon" />
                                <span>New Folder</span>
                            </button>

                            <button
                                onClick={() => showHover('newFile')}
                                className="action"
                                aria-label="New File"
                                title="New File"
                            >
                                <FcNoteAdd className="icon" />
                                <span>New File</span>
                            </button>

                            <div className="form-control mb-4">
                                <label className="input-group">
                                    <input
                                        type="text"
                                        value={folderName}
                                        onChange={(e) => setFolderName(e.target.value)}
                                        placeholder="Nombre de la nueva carpeta"
                                        className="input input-bordered w-full"
                                    />
                                    <button className="btn btn-primary" onClick={handleCreateFolder}>
                                        <FcAddDatabase className="mr-2" /> Crear Carpeta
                                    </button>
                                </label>
                            </div>

                            <div className="form-control mb-4">
                                <div className="input-group">
                                    <input type="file" onChange={handleFileChange} className={'file-input file-input-md w-full max-w-xs'} />
                                    <button className="btn btn-secondary" onClick={handleUpload}>
                                        <FcUpload className="mr-2" /> Subir Archivo
                                    </button>
                                </div>
                            </div>

                            {message && <div className="alert alert-success mb-4">{message}</div>}
                        </>
                    )}

                    <div>
                        <button
                            className="action"
                            onClick={toSettings}
                            aria-label="Settings"
                            title="Settings"
                        >
                            <FcSettings className="icon" />
                            <span>Settings</span>
                        </button>

                        {canLogout && (
                            <button
                                onClick={auth.logout}
                                className="action"
                                id="logout"
                                aria-label="Logout"
                                title="Logout"
                            >
                                <FcExitToApp className="icon" />
                                <span>Logout</span>
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <Link className="action" to="/login" aria-label="Login" title="Login">
                        <FcExitToApp className="icon" />
                        <span>Login</span>
                    </Link>

                    {signup && (
                        <Link className="action" to="/signup" aria-label="Signup" title="Signup">
                            <FcPersonAdd className="icon" />
                            <span>Signup</span>
                        </Link>
                    )}
                </>
            )}

            {isFiles && !disableUsedPercentage && (
                <div className="credits" style={{ width: '90%', margin: '2em 2.5em 3em 2.5em' }}>
                    <ProgressBar val={usage.usedPercentage} size="small" />
                    <br />
                    {usage.used} of {usage.total} used
                </div>
            )}

            <p className="credits">
        <span>
          <span>{disableExternal ? 'File Browser' : <a href="https://github.com/filebrowser/filebrowser" target="_blank" rel="noopener noreferrer">File Browser</a>}</span>
          <span> {' '} {version}</span>
        </span>
                <span>
          <button onClick={() => showHover('help')}>Help</button>
        </span>
            </p>
        </nav>
    );
};

export default Sidebar;
