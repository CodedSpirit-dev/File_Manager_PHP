import React from 'react';
import { Button } from '@headlessui/react';
import { usePermissions } from '@/contexts/PermissionsContext';

interface AdminDropdownProps {
    renderComponent: (componentName: string) => void;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ renderComponent }) => {
    const { hasPermission } = usePermissions();

    // Definir los permisos necesarios para acceder al panel de administración
    const adminPermissions = [
        'can_create_companies',
        'can_create_employees',
        'can_create_positions',
        'can_view_all_employees',
    ];

    const hasAdminAccess = adminPermissions.some((perm) => hasPermission(perm));

    if (!hasAdminAccess) {
        return null;
    }

    return (
        <div className="dropdown dropdown-end">
            <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost nav__bar__button"
            >
                Panel de Administración
            </div>
            <ul
                tabIndex={0}
                className="menu dropdown-content rounded-box z-[10] mt-4 w-52 p-2 shadow bg-white"
            >
                {hasPermission('can_view_company_employees') && (
                    <li>
                        <Button
                            className="hover:text-black"
                            onClick={() => renderComponent('Profile')}
                        >
                            Perfil
                        </Button>
                    </li>
                )}
                {hasPermission('can_create_companies') && (
                    <li>
                        <Button
                            className="hover:text-black"
                            onClick={() => renderComponent('CreateCompany')}
                        >
                            Registrar nueva empresa
                        </Button>
                    </li>
                )}
                {hasPermission('can_create_positions') && (
                    <li>
                        <Button
                            className="hover:text-black"
                            onClick={() => renderComponent('CreatePosition')}
                        >
                            Agregar nuevo puesto
                        </Button>
                    </li>
                )}
                {hasPermission('can_create_employees') && (
                    <li>
                        <Button
                            className="hover:text-black"
                            onClick={() => renderComponent('CreateEmployee')}
                        >
                            Agregar nuevo empleado
                        </Button>
                    </li>
                )}
                {hasPermission('can_view_all_employees') && (
                    <li>
                        <Button
                            className="hover:text-black"
                            onClick={() => renderComponent('EmployeeList')}
                        >
                            Lista de Empleados
                        </Button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default AdminDropdown;
