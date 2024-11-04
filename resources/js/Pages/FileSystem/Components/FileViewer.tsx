// src/components/FileManager/Components/FileViewer.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface FileViewerProps {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
    filePath: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileName, fileType, filePath }) => {
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicFileUrl = async () => {
            try {
                // Solicita la URL pública del archivo al backend
                const response = await axios.get('/filemanager/public-file', {
                    params: { filename: fileName, path: filePath },
                });
                const publicUrl = `filemanager/public-file?filename=${encodeURIComponent(fileName)}&path=${encodeURIComponent(filePath)}`;

                // Ajusta la URL de visualización dependiendo del tipo de archivo
                if (fileType === 'docx' || fileType === 'xlsx') {
                    setViewerUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`);
                } else {
                    setViewerUrl(publicUrl);
                }
            } catch (error) {
                console.error('Error fetching public file URL:', error);
            }
        };

        fetchPublicFileUrl();
    }, [fileName, fileType, filePath]);

    if (!viewerUrl) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="file-viewer">
            <h2 className="text-center mb-4">{fileName}</h2>
            <iframe
                src={viewerUrl}
                title={fileName}
                width="100%"
                height="600px"
                className="border"
            />
        </div>
    );
};

export default FileViewer;
