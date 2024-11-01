// src/components/FileManager/Modal.tsx

import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const ModalToolbar: React.FC<ModalProps> = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                <div className="px-6 py-4">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <div className="mt-4">
                        {children}
                    </div>
                </div>
                <div className="px-6 py-4 flex justify-end">
                    <button className="btn btn-secondary mr-2" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="btn btn-primary" onClick={() => {}}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalToolbar;
