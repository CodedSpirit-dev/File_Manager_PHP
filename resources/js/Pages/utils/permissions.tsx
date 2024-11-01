// src/utils/permissions.ts

import { Employee } from '@/types';

/**
 * Verifica si el empleado tiene un permiso específico.
 * @param employee - El objeto Employee del usuario autenticado.
 * @param permission - El nombre del permiso a verificar.
 * @returns Boolean indicando si el permiso está presente.
 */
export const hasPermission = (employee: Employee, permission: string): boolean => {
    return employee.permissions.includes(permission);
};
