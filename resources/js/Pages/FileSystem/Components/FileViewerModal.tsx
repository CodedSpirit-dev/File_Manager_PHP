// src/components/FileManager/Components/FileViewerModal.tsx

import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import FileViewer from './FileViewer';

interface FileViewerModalProps {
    isOpen: boolean;
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'doc';
    onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, fileUrl, fileType, onClose }) => {
    const [error, setError] = useState<string | null>(null);

    // Manejar el cierre del modal al presionar la tecla Esc
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        } else {
            document.removeEventListener('keydown', handleEsc);
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Prevenir el desplazamiento del fondo cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Resetear estados al abrir el modal o cambiar el archivo
    useEffect(() => {
        if (isOpen) {
            setError(null);
        }
    }, [isOpen, fileUrl, fileType]);

    // Restricciones adicionales de seguridad
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === 'F12' ||
                (event.ctrlKey && ['c', 'u', 's'].includes(event.key)) ||
                (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key)) ||
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

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('dragstart', handleDragStart);
        disableSelection();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
            enableSelection();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
        >
            <div
                className="
                    relative
                    bg-white
                    rounded-lg
                    shadow-lg
                    w-full
                    h-full
                    overflow-hidden
                    flex
                    flex-col
                "
            >
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
                    <h2 id="modal-title" className="text-lg font-semibold">
                        Vista de Archivo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Cerrar modal"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="flex-1 overflow-auto p-4 sm:p-6 relative">
                    <FileViewer
                        fileUrl={fileUrl}
                        fileType={fileType}
                    />

                </div>
            </div>
        </div>
    );
};

export default FileViewerModal;
