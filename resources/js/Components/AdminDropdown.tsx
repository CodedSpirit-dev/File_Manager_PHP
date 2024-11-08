import React from 'react';
import { Menu } from '@headlessui/react';
import { usePermissions } from '@/contexts/PermissionsContext';

interface AdminDropdownProps {
    renderComponent: (componentName: string) => void;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ renderComponent }) => {
    const { hasPermission } = usePermissions();

    const adminPermissions = [
        'can_create_companies',
        'can_create_employees',
        'can_create_positions',
        'can_view_all_employees',
        'can_view_company_employees',
        'can_view_file_explorer',
    ];

    const hasAdminAccess = adminPermissions.some((perm) => hasPermission(perm));

    if (!hasAdminAccess) {
        return null;
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="btn btn-ghost nav__bar__button">
                    Panel de Administración
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-20">
                <div className="px-1 py-1 ">
                    {hasPermission('can_view_company_employees') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => renderComponent('Profile')}
                                >
                                    Perfil
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_create_positions') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => renderComponent('CreatePosition')}
                                >
                                    Agregar nuevo puesto
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_create_employees') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => renderComponent('CreateEmployee')}
                                >
                                    Agregar nuevo empleado
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_view_all_employees') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => renderComponent('EmployeeList')}
                                >
                                    Lista de Empleados
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                className={`${
                                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                onClick={() => renderComponent('CompanyList')}
                            >
                                Empresas
                            </button>
                        )}
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Menu>
    );
};

export default AdminDropdown;
