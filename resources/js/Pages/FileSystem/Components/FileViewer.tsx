import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import {ImZoomIn, ImZoomOut} from "react-icons/im";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;


interface FileViewerProps {
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileType }) => {
    const [docContent, setDocContent] = useState<string | null>(null);
    const [excelContent, setExcelContent] = useState<any[][] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0); // Variable para el zoom
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pageWidth, setPageWidth] = useState<number>(600);

    useEffect(() => {
        const updatePageWidth = () => {
            if (containerRef.current) {
                setPageWidth(containerRef.current.offsetWidth - 80); // Restar el ancho de la barra lateral (80px)
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
                } else if (fileType === 'pdf') {
                    setLoading(false);
                }
            } catch (error) {
                console.error(`Error al cargar el archivo ${fileType}:`, error);
                setLoading(false);
            }
        };

        if (fileType === 'docx' || fileType === 'xlsx' || fileType === 'pdf') {
            fetchFile();
        } else {
            console.error(`Unsupported file type: ${fileType}`);
            setLoading(false);
        }
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
        setScale((prevScale) => Math.min(prevScale + 0.25, 3.0)); // Zoom máximo 3.0
    };

    const zoomOut = () => {
        setScale((prevScale) => Math.max(prevScale - 0.25, 0.5)); // Zoom mínimo 0.5
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full text-gray-500">Cargando...</div>;
    }

    if (fileType === 'pdf') {
        return (
            <div ref={containerRef} className="file-viewer flex h-full">
                {/* Barra lateral izquierda con los botones */}
                <div className="flex flex-col items-center p-4 bg-gray-100 w-20 space-y-6">
                    <button
                        onClick={zoomOut}
                        className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={scale <= 0.5}
                        title="Zoom Out"
                    >
                        <ImZoomOut />
                    </button>
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:bg-gray-200 ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Página Anterior"
                    >
                        <FaArrowLeft />
                    </button>
                    <span className="text-sm text-gray-700">
                        {currentPage} / {numPages}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === numPages}
                        className={`flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:bg-gray-200 ${currentPage === numPages ? 'cursor-not-allowed opacity-50' : ''}`}
                        title="Página Siguiente"
                    >
                        <FaArrowRight />
                    </button>
                    <button
                        onClick={zoomIn}
                        className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={scale >= 3.0}
                        title="Zoom In"
                    >
                        <ImZoomIn />
                    </button>
                </div>
                {/* Área principal con el PDF */}
                <div className="flex-1 overflow-auto bg-gray-50 p-4">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => {
                            console.error("Error al cargar el PDF:", error);
                            setLoading(false);
                        }}
                        loading={<div className="text-center text-gray-500">Cargando PDF...</div>}
                        noData={<div className="text-center text-gray-500">No se encontró el PDF.</div>}
                        className="flex justify-center"
                    >
                        <Page
                            pageNumber={currentPage}
                            scale={scale}
                            width={pageWidth}
                            className="my-2"
                        />
                    </Document>
                </div>
            </div>
        );
    }

    // Manejo para docx y xlsx (similar a tu código actual)
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
            <div className="file-viewer w-full h-full overflow-auto p-4">
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm sm:text-base table-auto">
                        <thead className="bg-gray-200 text-gray-700 font-semibold">
                        <tr>
                            {excelContent && excelContent[0]?.map((header, index) => (
                                <th key={index} className="px-4 py-2 border border-gray-300 text-left">
                                    {header || "Columna " + (index + 1)}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {excelContent?.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">
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

    return <div className="flex items-center justify-center h-full text-red-500">No se puede mostrar este tipo de archivo.</div>;
};

export default FileViewer;
