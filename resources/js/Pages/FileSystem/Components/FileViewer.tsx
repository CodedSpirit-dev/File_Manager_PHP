// src/components/FileManager/Components/FileViewer.tsx

import React, { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

interface FileViewerProps {
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl, fileType }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [docContent, setDocContent] = useState<string | null>(null);
    const [excelContent, setExcelContent] = useState<any[][] | null>(null);

    useEffect(() => {
        setDocContent(null); // Reset previous state
        setExcelContent(null);
        setNumPages(0);

        if (fileType === 'docx') {
            fetch(fileUrl)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => {
                    mammoth
                        .convertToHtml({ arrayBuffer })
                        .then((result) => setDocContent(result.value))
                        .catch((err) => console.error('Error reading DOCX file:', err));
                });
        } else if (fileType === 'xlsx') {
            fetch(fileUrl)
                .then((response) => response.arrayBuffer())
                .then((arrayBuffer) => {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    setExcelContent(data as any[][]);
                })
                .catch((err) => console.error('Error reading XLSX file:', err));
        }
    }, [fileUrl, fileType]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    if (fileType === 'pdf') {
        return (
            <div className="file-viewer">
                <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from({ length: numPages }, (_, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                    ))}
                </Document>
            </div>
        );
    }

    if (fileType === 'docx') {
        return (
            <div className="file-viewer">
                <div dangerouslySetInnerHTML={{ __html: docContent || '' }} />
            </div>
        );
    }

    if (fileType === 'xlsx') {
        return (
            <div className="file-viewer overflow-auto">
                <table className="table-auto border-collapse border border-gray-300 w-full">
                    <tbody>
                    {excelContent?.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 p-2">
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

    return <div>Cannot display this file type.</div>;
};

export default FileViewer;
