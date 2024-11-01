// src/contexts/PermissionsContext.tsx

import React, { createContext, useContext } from 'react';
import { EmployeePageProps } from '@/types';
import {hasPermission as checkPermission } from "@/Pages/utils/permissions";
import { usePage } from '@inertiajs/react';

interface PermissionsContextProps {
    hasPermission: (permission: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextProps | undefined>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { auth } = usePage<EmployeePageProps>().props;
    const employee = auth.employee;

    const hasPermission = (permission: string): boolean => {
        if (!employee) return false;
        return checkPermission(employee, permission);
    };

    return (
        <PermissionsContext.Provider value={{ hasPermission }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = (): PermissionsContextProps => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions debe ser usado dentro de un PermissionsProvider');
    }
    return context;
};
