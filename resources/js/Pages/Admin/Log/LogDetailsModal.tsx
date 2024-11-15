// src/components/LogDetailsModal.tsx

import React from 'react';
import { permissionDescriptions} from "@/Pages/utils/PermissionMapping";

interface Log {
    id: number;
    user_id: number | null;
    transaction_id: string;
    description: string;
    date: string;
    ip_address: string | null;
    user_agent: string | null;
    user_name: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    device?: string;
}

interface LogDetailsModalProps {
    log: Log | null;
    isOpen: boolean;
    onClose: () => void;
}

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ log, isOpen, onClose }) => {
    if (!isOpen || !log) return null;

    // Función para extraer y mapear permisos
    const getPermissions = (description: string): string[] => {
        const permissionsPrefix = 'Permisos asignados:';
        const index = description.indexOf(permissionsPrefix);
        if (index === -1) return [];

        const permissionsString = description.substring(index + permissionsPrefix.length);
        const permissions = permissionsString.split(',').map(perm => perm.trim().replace('.', ''));
        return permissions.map(perm => permissionDescriptions[perm] || perm);
    };

    const permissions = getPermissions(log.description);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg min-w-64 w-9/12 p-6 relative h-5/6 max-h-full overflow-y-auto">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &#10005;
                </button>
                <h2 className="text-xl font-semibold mb-4">Detalles del Log</h2>
                <div className="space-y-2">
                    <div><strong>ID:</strong> {log.id}</div>
                    <div><strong>Usuario:</strong> {log.user_name || 'N/A'}</div>
                    <div><strong>Transacción:</strong> {log.transaction_id}</div>
                    <div><strong>Descripción:</strong> {log.description}</div>
                    <div><strong>Fecha y Hora:</strong> {new Date(log.date).toLocaleString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}</div>
                    <div><strong>Dirección IP:</strong> {log.ip_address || 'N/A'}</div>
                    <div><strong>Navegador:</strong> {log.browser || 'N/A'} {log.browserVersion || ''}</div>
                    <div><strong>Sistema Operativo:</strong> {log.os || 'N/A'} {log.osVersion || ''}</div>
                    <div><strong>Dispositivo:</strong> {log.device || 'N/A'}</div>
                    {permissions.length > 0 && (
                        <div>
                            <strong>Permisos Asignados:</strong>
                            <ul className="list-disc list-inside mt-2">
                                {permissions.map((perm, index) => (
                                    <li key={index}>{perm}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={onClose}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default LogDetailsModal;
