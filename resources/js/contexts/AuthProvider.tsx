// resources/js/contexts/AuthProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { EmployeePageProps, User } from '@/types'; // Asegúrate de que estas importaciones sean correctas

export interface Permissions {
    can_create_companies: boolean;
    can_delete_companies: boolean;
    can_update_companies: boolean;
    can_create_positions: boolean;
    can_update_positions: boolean;
    can_delete_positions: boolean;
    can_create_users: boolean;
    can_delete_users: boolean;
    can_update_users: boolean;
    can_view_company_users: boolean;
    can_view_all_users: boolean;
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
    hierarchyLevel: number | null;
    companyName: string | null;
    redirectPath: string | null;
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
    hierarchyLevel: null,
    companyName: null,
    redirectPath: null,
    hasPermission: () => false,
    refreshPermissions: () => {},
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { auth } = usePage<EmployeePageProps>().props; // Asegúrate de que `EmployeePageProps` incluye `auth`
    const [user, setUser] = useState<User | null>(auth.user || null);
    const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);
    const [hierarchyLevel, setHierarchyLevel] = useState<number | null>(null);
    const [companyName, setCompanyName] = useState<string | null>(null);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        setUser(auth.user || null);

        const userPermissions = auth.user?.permissions || [];
        const mappedPermissions: Permissions = { ...defaultPermissions };
        userPermissions.forEach((perm: string) => {
            if (perm in mappedPermissions) {
                mappedPermissions[perm as keyof Permissions] = true;
            }
        });
        setPermissions(mappedPermissions);

        // Fetch hierarchy and company details
        fetchHierarchyAndCompany();
    }, [auth.user]);

    const fetchHierarchyAndCompany = async () => {
        try {
            const response = await axios.get('/filemanager/hierarchy-company');
            setHierarchyLevel(response.data.hierarchy_level);
            setCompanyName(response.data.company_name);
            setRedirectPath(response.data.redirect_path);
        } catch (error) {
            console.error('Error fetching hierarchy and company information', error);
        }
    };

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
                console.error('Error fetching user permissions', error);
            });
    };

    const hasPermission = (permission: keyof Permissions): boolean => {
        return permissions[permission];
    };

    return (
        <AuthContext.Provider value={{ user, permissions, hierarchyLevel, companyName, redirectPath, hasPermission, refreshPermissions }}>
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
