// src/components/FileManager/Components/FileViewerModal.tsx

import React from 'react';
import { IoClose } from 'react-icons/io5';
import Modal from './Modal';
import FileViewer from './FileViewer';

interface FileViewerModalProps {
    isOpen: boolean;
    title: string;
    fileUrl: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
    onClose: () => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ isOpen, title, fileUrl, fileType, onClose }) => {
    return (
        <Modal isOpen={isOpen} title={title} onClose={onClose}>
            <div className="w-full h-full">
                {/* Puedes añadir controles específicos aquí */}
                {/* Por ejemplo, botones para descargar o cerrar */}
                <FileViewer fileUrl={fileUrl} fileType={fileType} />
            </div>
        </Modal>
    );
};

export default FileViewerModal;
