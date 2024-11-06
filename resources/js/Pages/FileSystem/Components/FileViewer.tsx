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
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Reset content and loading state
        setDocContent(null);
        setExcelContent(null);
        setLoading(true);

        // Fetch file content for docx and xlsx files
        const fetchFile = async () => {
            try {
                const response = await axios.get(fileUrl, {
                    responseType: 'arraybuffer',
                });
                const arrayBuffer = response.data;

                if (fileType === 'docx') {
                    mammoth.convertToHtml({ arrayBuffer })
                        .then(result => {
                            setDocContent(result.value);
                            setLoading(false);
                        })
                        .catch(err => {
                            console.error('Error al leer el archivo DOCX:', err);
                            setLoading(false);
                        });
                } else if (fileType === 'xlsx') {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    setExcelContent(data as any[][]);
                    setLoading(false);
                }
            } catch (error) {
                console.error(`Error al cargar el archivo ${fileType}:`, error);
                setLoading(false);
            }
        };

        if (fileType === 'docx' || fileType === 'xlsx') {
            fetchFile();
        } else if (fileType === 'pdf') {
            setLoading(false);
        } else {
            console.error(`Unsupported file type: ${fileType}`);
            setLoading(false);
        }

        // Restricciones adicionales de seguridad
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === 'F12' ||
                (event.ctrlKey && (event.key === 'c' || event.key === 'u' || event.key === 's')) ||
                (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) ||
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

    if (loading) {
        return <div className="text-center text-gray-500">Cargando...</div>;
    }

    if (fileType === 'pdf') {
        return (
            <div className="file-viewer w-full h-full flex justify-center items-center">
                <iframe
                    src={`${fileUrl}#toolbar=0`}
                    title="PDF Viewer"
                    className="w-full h-full md:w-11/12 md:h-4/5 lg:w-3/4 lg:h-4/5 border rounded-lg shadow-md"
                ></iframe>
            </div>
        );
    }

    if (fileType === 'docx') {
        return (
            <div className="file-viewer w-full h-full overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: docContent || '' }}
                />
            </div>
        );
    }

    if (fileType === 'xlsx') {
        return (
            <div className="file-viewer w-full h-full overflow-auto p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm sm:text-base">
                        <tbody>
                        {excelContent?.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return <div className="text-center text-red-500">No se puede mostrar este tipo de archivo.</div>;
};

export default FileViewer;
