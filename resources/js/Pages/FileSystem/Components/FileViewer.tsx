import React, { useEffect, useState, useRef } from 'react';
import * as SheetJS from 'xlsx'; // Renombrar la importación a SheetJS
import mammoth from 'mammoth';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { ImZoomIn, ImZoomOut } from "react-icons/im";

// Configuración correcta del worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;

interface FileViewerProps {
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx' | 'xls' | 'csv' | 'txt' | 'doc';
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileType }) => {
    const [docContent, setDocContent] = useState<string | null>(null);
    const [excelContent, setExcelContent] = useState<any[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0); // Variable para el zoom
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pageWidth, setPageWidth] = useState<number>(600);
    const [error, setError] = useState<string | null>(null); // Estado para manejar errores

    // Estado para ordenación de columnas en XLSX
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

    useEffect(() => {
        const updatePageWidth = () => {
            if (containerRef.current) {
                setPageWidth(containerRef.current.offsetWidth);
            }
        };

        updatePageWidth();
        window.addEventListener("resize", updatePageWidth);
        return () => window.removeEventListener("resize", updatePageWidth);
    }, []);

    useEffect(() => {
        setDocContent(null);
        setExcelContent(null);
        setLoading(true);
        setError(null); // Resetear el estado de error

        const fetchFile = async () => {
            try {
                if (fileType === 'txt') {
                    // Manejo de archivos TXT
                    const response = await axios.get(fileUrl, {
                        responseType: 'text',
                    });
                    setDocContent(response.data);
                    setLoading(false);
                } else {
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
                                setError('No se pudo procesar el archivo DOCX.');
                                setLoading(false);
                            });
                    } else if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
                        try {
                            const workbook = SheetJS.read(arrayBuffer, { type: 'array' });
                            const sheetName = workbook.SheetNames[0];
                            const sheet = workbook.Sheets[sheetName];
                            const data: any[] = SheetJS.utils.sheet_to_json(sheet, { header: 1 });

                            // Estructurar datos con encabezados
                            const headers = data[0] as string[];
                            const rows = data.slice(1).map(row => {
                                const rowData: { [key: string]: any } = {};
                                headers.forEach((header, index) => {
                                    rowData[header || `Columna ${index + 1}`] = row[index];
                                });
                                return rowData;
                            });

                            setExcelContent(rows);
                            setLoading(false);
                        } catch (err) {
                            console.error('Error al leer el archivo de Excel:', err);
                            setError('No se pudo procesar el archivo de Excel.');
                            setLoading(false);
                        }
                    } else if (fileType === 'pdf') {
                        setLoading(false);
                    } else {
                        setError('Tipo de archivo no soportado.');
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error(`Error al cargar el archivo ${fileType}:`, error);
                setError('No se pudo cargar el archivo. Por favor, intenta nuevamente.');
                setLoading(false);
            }
        };

        fetchFile();
    }, [fileUrl, fileType]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const goToPreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const goToNextPage = () => {
        if (numPages) {
            setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
        }
    };

    const zoomIn = () => {
        setScale((prevScale) => Math.min(prevScale + 0.15, 3.0)); // Zoom máximo 3.0
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.15, 0.2)); // Zoom mínimo 0.2
    };

    // Función para manejar la ordenación de columnas
    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Ordenar los datos según sortConfig
    const sortedExcelContent = React.useMemo(() => {
        if (sortConfig && excelContent) {
            const sortedData = [...excelContent].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            return sortedData;
        }
        return excelContent;
    }, [excelContent, sortConfig]);

    if (loading) {
        return <div className="flex items-center justify-center h-full text-gray-500">Cargando...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    }

    if (fileType === 'pdf') {
        return (
            <div ref={containerRef} className="file-viewer relative flex flex-col h-full">
                {/* Área principal con el PDF */}
                <div className="flex-1 overflow-auto bg-gray-50 p-4 pb-20">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                            console.error("Error al cargar el PDF:", error);
                            setError('No se pudo cargar el PDF.');
                        }}
                        loading={<div className="text-center text-gray-500">Cargando PDF...</div>}
                        noData={<div className="text-center text-gray-500">No se encontró el PDF.</div>}
                        className="flex justify-center"
                    >
                        <Page
                            pageNumber={currentPage}
                            scale={scale}
                            className="my-2"
                        />
                    </Document>
                </div>
                {/* Barra de herramientas flotante inferior */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-75 backdrop-filter backdrop-blur-sm shadow-inner flex justify-center items-center rounded-full px-4 py-2 z-50">
                    <button
                        onClick={zoomOut}
                        className="flex items-center justify-center w-10 h-10 bg-transparent rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={scale <= 0.2}
                        title="Zoom Out"
                        aria-label="Zoom Out"
                    >
                        <ImZoomOut />
                    </button>
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 bg-transparent rounded-full hover:bg-gray-200 transition-colors duration-200 ${
                            currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        title="Página Anterior"
                        aria-label="Página Anterior"
                    >
                        <FaArrowLeft />
                    </button>
                    <span className="mx-2 text-sm text-gray-700">
                        Página {currentPage} de {numPages}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === numPages}
                        className={`flex items-center justify-center w-10 h-10 bg-transparent rounded-full hover:bg-gray-200 transition-colors duration-200 ${
                            currentPage === numPages ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                        title="Página Siguiente"
                        aria-label="Página Siguiente"
                    >
                        <FaArrowRight />
                    </button>
                    <button
                        onClick={zoomIn}
                        className="flex items-center justify-center w-10 h-10 bg-transparent rounded-full hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={scale >= 3.0}
                        title="Zoom In"
                        aria-label="Zoom In"
                    >
                        <ImZoomIn />
                    </button>
                </div>
            </div>
        );
    }

    // Componente para renderizar archivos XLS, XLSX y CSV
    if (fileType === 'xlsx' || fileType === 'xls' || fileType === 'csv') {
        return (
            <div className="file-viewer w-full h-full overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm sm:text-base table-auto">
                        <thead className="bg-gray-200 text-gray-700 font-semibold">
                        <tr>
                            {excelContent && Object.keys(excelContent[0]).map((header, index) => (
                                <th
                                    key={index}
                                    className="px-4 py-2 border border-gray-300 text-left cursor-pointer hover:bg-gray-300"
                                    onClick={() => handleSort(header)}
                                >
                                    {header}
                                    {/* Indicador de ordenación */}
                                    {sortConfig?.key === header ? (
                                        sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'
                                    ) : null}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {sortedExcelContent && sortedExcelContent.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                {Object.values(row).map((cell, cellIndex) => (
                                    <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">
                                        {cell as React.ReactNode}
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

    // Componente para renderizar archivos DOCX
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

    // Componente para renderizar archivos TXT
    if (fileType === 'txt') {
        return (
            <div className="file-viewer w-full h-full overflow-auto p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
                <pre className="whitespace-pre-wrap text-gray-800">
                    {docContent}
                </pre>
            </div>
        );
    }

    return <div className="flex items-center justify-center h-full text-red-500">No se puede mostrar este tipo de archivo.</div>;
};

export default FileViewer;
