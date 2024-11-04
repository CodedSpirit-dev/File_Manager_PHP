import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import axios from 'axios';

interface FileViewerProps {
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileType }) => {
    const [docContent, setDocContent] = useState<string | null>(null);
    const [excelContent, setExcelContent] = useState<any[][] | null>(null);

    useEffect(() => {
        // Reset content
        setDocContent(null);
        setExcelContent(null);

        // Fetch file content for docx and xlsx files
        const fetchFile = async () => {
            try {
                const response = await axios.get(fileUrl, {
                    responseType: 'arraybuffer',
                });
                const arrayBuffer = response.data;

                if (fileType === 'docx') {
                    mammoth.convertToHtml({ arrayBuffer })
                        .then(result => setDocContent(result.value))
                        .catch(err => console.error('Error al leer el archivo DOCX:', err));
                } else if (fileType === 'xlsx') {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    setExcelContent(data as any[][]);
                }
            } catch (error) {
                console.error(`Error al cargar el archivo ${fileType}:`, error);
            }
        };

        if (fileType === 'docx' || fileType === 'xlsx') {
            fetchFile();
        }

        // Restricciones adicionales de seguridad
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === 'F12' ||
                (event.ctrlKey && (event.key === 'c' || event.key === 'u' || event.key === 's')) || // Ctrl+C, Ctrl+U, Ctrl+S
                (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) || // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
                event.key === 'PrintScreen'
            ) {
                event.preventDefault();
                alert('Esta acción está deshabilitada');
            }
        };

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        const handleDragStart = (event: DragEvent) => {
            event.preventDefault();
        };

        const disableSelection = () => {
            document.body.style.userSelect = 'none';
        };

        const enableSelection = () => {
            document.body.style.userSelect = 'auto';
        };

        // Añadir los eventos
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        disableSelection();

        return () => {
            // Limpiar eventos y estilos
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            enableSelection();
        };
    }, [fileUrl, fileType]);

    if (fileType === 'pdf') {
        return (
            <div className="file-viewer">
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    title="PDF Viewer"
                    className="w-full border rounded-lg"
                    style={{ minHeight: '300px', height: '80vh', maxHeight: '90vh' }}
                ></iframe>
            </div>
        );
    }

    if (fileType === 'docx') {
        return (
            <div className="file-viewer px-2 md:px-4 lg:px-6 xl:px-8">
                <div dangerouslySetInnerHTML={{ __html: docContent || '' }} />
            </div>
        );
    }

    if (fileType === 'xlsx') {
        return (
            <div className="file-viewer overflow-auto p-2 md:p-4 lg:p-6 xl:p-8">
                <table className="table-auto border-collapse border border-gray-300 w-full text-xs sm:text-sm md:text-base lg:text-lg">
                    <tbody>
                    {excelContent?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 p-1 md:p-2 lg:p-3">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <div>No se puede mostrar este tipo de archivo.</div>;
};

export default FileViewer;
