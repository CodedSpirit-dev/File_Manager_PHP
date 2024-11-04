import React from 'react';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                className="relative bg-white rounded-lg shadow-lg w-11/12 max-h-[90vh] overflow-y-auto mx-2
                    sm:w-11/12 sm:max-w-md sm:mx-auto
                    md:w-11/12 md:max-w-lg
                    lg:w-11/12 lg:max-w-2xl
                    xl:w-11/12 xl:max-w-3xl
                    2xl:w-11/12 2xl:max-w-4xl"
            >
                {/* Modal Header */}
                <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b">
                    <h3 className="text-lg font-bold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
