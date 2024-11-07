// src/components/FileManager/Components/Modal.tsx

import React from 'react';
import {IoClose} from 'react-icons/io5';

interface ModalProps {
    isOpen: boolean,
    title: string,
    children: React.ReactNode,
    onClose: () => void,
    canClose?: boolean
}

const Modal: React.FC<ModalProps> = ({isOpen, title, children, onClose, canClose}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div
                className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl h-auto max-h-full overflow-hidden flex flex-col"
            >
                {/* Cabecera del Modal */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Cerrar modal"
                    >
                        <IoClose size={24}/>
                    </button>
                </div>

                {/* Contenido del Modal */}
                <div className="p-4 sm:p-6 flex-1 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
