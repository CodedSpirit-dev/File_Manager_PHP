// src/context/AuthProvider.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { EmployeePageProps } from '@/types';
import { User } from '../types';

// Definición de la interfaz Permissions según los permisos específicos
export interface Permissions {
    // Permisos para Empresas
    can_create_companies: boolean;
    can_delete_companies: boolean;
    can_update_companies: boolean;

    // Permisos para Puestos
    can_create_positions: boolean;
    can_update_positions: boolean;
    can_delete_positions: boolean;

    // Permisos para Usuarios
    can_create_users: boolean;
    can_delete_users: boolean;
    can_update_users: boolean;
    can_view_company_users: boolean;
    can_view_all_users: boolean;

    // Permisos para Gestión de Archivos y Carpetas
    can_view_file_explorer: boolean;
    can_open_files: boolean;
    can_upload_files_and_folders: boolean;
    can_create_folders: boolean;
    can_download_files_and_folders: boolean;
    can_copy_files: boolean;
    can_move_files: boolean;
    can_rename_files_and_folders: boolean;
    can_delete_files_and_folders: boolean;
}

interface AuthContextProps {
    user: User | null;
    permissions: Permissions;
    hasPermission: (permission: keyof Permissions) => boolean;
    refreshPermissions: () => void;
}

const defaultPermissions: Permissions = {
    can_create_companies: false,
    can_delete_companies: false,
    can_update_companies: false,
    can_create_positions: false,
    can_update_positions: false,
    can_delete_positions: false,
    can_create_users: false,
    can_delete_users: false,
    can_update_users: false,
    can_view_company_users: false,
    can_view_all_users: false,
    can_view_file_explorer: false,
    can_open_files: false,
    can_upload_files_and_folders: false,
    can_create_folders: false,
    can_download_files_and_folders: false,
    can_copy_files: false,
    can_move_files: false,
    can_rename_files_and_folders: false,
    can_delete_files_and_folders: false,
};

const AuthContext = createContext<AuthContextProps>({
    user: null,
    permissions: defaultPermissions,
    hasPermission: () => false,
    refreshPermissions: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { auth } = usePage<EmployeePageProps>().props;
    const [user, setUser] = useState<User | null>(auth.user || null);
    const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);

    useEffect(() => {
        setUser(auth.user || null);
        // Mapea los permisos recibidos a la interfaz `Permissions`
        const userPermissions = auth.user?.permissions || [];
        const mappedPermissions: Permissions = { ...defaultPermissions };
        userPermissions.forEach((perm: string) => {
            if (perm in mappedPermissions) {
                mappedPermissions[perm as keyof Permissions] = true;
            }
        });
        setPermissions(mappedPermissions);
    }, [auth.user]);

    const refreshPermissions = () => {
        axios.get('/api/permissions')
            .then(response => {
                const newPermissions = response.data.permissions || [];
                const updatedPermissions: Permissions = { ...defaultPermissions };
                newPermissions.forEach((perm: string) => {
                    if (perm in updatedPermissions) {
                        updatedPermissions[perm as keyof Permissions] = true;
                    }
                });
                setPermissions(updatedPermissions);
            })
            .catch(error => {
                console.error('Error al obtener permisos del usuario', error);
            });
    };

    const hasPermission = (permission: keyof Permissions): boolean => {
        return permissions[permission];
    };

    return (
        <AuthContext.Provider value={{ user, permissions, hasPermission, refreshPermissions }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook para acceder al contexto de autenticación y permisos
export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
