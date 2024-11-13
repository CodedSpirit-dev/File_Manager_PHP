// AdminDropdown.tsx
import React from 'react';
import { Menu } from '@headlessui/react';
import { usePermissions } from '@/contexts/PermissionsContext';
import { LuFolderOpen } from 'react-icons/lu';
import { CiUser } from 'react-icons/ci';
import { IoBusinessOutline } from 'react-icons/io5';
import { MdOutlineWorkOutline } from 'react-icons/md';
import { GrGroup } from 'react-icons/gr';
import { CgOptions } from 'react-icons/cg';

interface AdminDropdownProps {
    renderComponent: (componentName: string) => void;
    activeComponent: string;
}

const AdminDropdown: React.FC<AdminDropdownProps> = ({ renderComponent, activeComponent }) => {
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

    const handleClick = (componentName: string) => {
        renderComponent(componentName);
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="btn btn-ghost nav__bar__button flex items-center">
                    <CgOptions className="mr-2" /> Panel de Administración
                </Menu.Button>
            </div>

            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-20">
                <div className="px-1 py-1 ">
                    {hasPermission('can_view_company_employees') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        activeComponent === 'Profile'
                                            ? 'bg-primary text-white cursor-not-allowed'
                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => handleClick('Profile')}
                                    disabled={activeComponent === 'Profile'}
                                >
                                    <CiUser className="mr-2" /> Perfil
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_create_companies') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        activeComponent === 'CompanyList'
                                            ? 'bg-primary text-white cursor-not-allowed'
                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => handleClick('CompanyList')}
                                    disabled={activeComponent === 'CompanyList'}
                                >
                                    <IoBusinessOutline className="mr-2" /> Empresas
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_create_positions') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        activeComponent === 'PositionList'
                                            ? 'bg-primary text-white cursor-not-allowed'
                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => handleClick('PositionList')}
                                    disabled={activeComponent === 'PositionList'}
                                >
                                    <MdOutlineWorkOutline className="mr-2" /> Puestos
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasPermission('can_view_all_employees') && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    className={`${
                                        activeComponent === 'EmployeeList'
                                            ? 'bg-primary text-white cursor-not-allowed'
                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    onClick={() => handleClick('EmployeeList')}
                                    disabled={activeComponent === 'EmployeeList'}
                                >
                                    <GrGroup className="mr-2" /> Usuarios
                                </button>
                            )}
                        </Menu.Item>
                    )}
                </div>
            </Menu.Items>
        </Menu>
    );
};

export default AdminDropdown;
