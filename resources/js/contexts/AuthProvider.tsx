// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextProps {
    permissions: string[];
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextProps>({
    permissions: [],
    hasPermission: () => false,
});

// Define una interfaz para los props del AuthProvider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        // Obtener los permisos del usuario desde el backend
        axios.get('/api/permissions')
            .then(response => {
                // Ajusta según la estructura de tu respuesta
                // Por ejemplo, si la respuesta es { permissions: ['perm1', 'perm2'] }
                setPermissions(response.data.permissions);
            })
            .catch(error => {
                console.error('Error al obtener permisos del usuario', error);
            });
    }, []);

    const hasPermission = (permission: string) => {
        return permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ permissions, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
