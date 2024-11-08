import { EmployeePageProps } from '@/types';
import { Button } from '@headlessui/react';
import React, { useState } from 'react';
import CreateEmployee from './Admin/Employee/CreateEmployee';
import EmployeeList from './Admin/Employee/EmployeeList';
import axios from 'axios';
import Profile from './Profile/Profile';
import { Head, usePage } from '@inertiajs/react';
import CreateCompany from './Admin/Company/CreateCompany';
import CreatePosition from './Admin/Position/CreatePosition';
import FileManager from './FileSystem/FileManager';
import AdminDropdown from '@/Components/AdminDropdown';
import { PermissionsProvider, usePermissions } from '@/contexts/PermissionsContext';
import { Menu } from '@headlessui/react';
import CompanyList from "@/Pages/Admin/Company/CompanyList"; // Importar Menu

const HomeContent: React.FC = () => {
    const { hasPermission } = usePermissions();
    const { auth } = usePage<EmployeePageProps>().props;
    const employee = auth.user;

    const [component, setComponent] = useState<JSX.Element | null>(null);

    const renderComponent = (componentName: string) => {
        // Renderizar el componente según el nombre recibido
        switch (componentName) {
            case 'Profile':
                setComponent(<ProfileComponent />);
                break;
            case 'FileManager':
                setComponent(<FileManager />);
                break;
            case 'EmployeeList':
                setComponent(<EmployeeList />);
                break;
            case 'CompanyList' :
                setComponent(<CompanyList/>)
                break;
            case 'CreatePosition':
                setComponent(<CreatePosition />);
                break;
            default:
                setComponent(null);
        }
    };

    const closeSession = () => {
        axios.post('/logout').finally(() => {
            window.location.href = '/login';
        });
    };

    return (
        <>
            <Head title="Inicio" />
            <section className="container mx-auto">
                <nav className="nav__bar rounded-lg flex items-center justify-between p-4">
                    {/* Menú desplegable para pantallas pequeñas */}
                    <div className="lg:hidden">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="nav__bar__button transition-opacity hover:text-black">
                                    Menú
                                </Menu.Button>
                            </div>

                            <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-20">
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
                                    {hasPermission('can_create_companies') && (
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
                                    {hasPermission('can_view_all_employees') && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('EmployeeList')}
                                                >
                                                    Empleados
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                    {hasPermission('can_view_file_explorer') && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        active ? 'bg-blue-500 text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('FileManager')}
                                                >
                                                    Explorador de archivos
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                            </Menu.Items>
                        </Menu>
                    </div>

                    {/* Navbar para pantallas grandes */}
                    <div className="hidden lg:flex space-x-4">
                        {hasPermission('can_view_file_explorer') && (
                            <Button
                                className="btn btn-ghost nav__bar__button hover:text-black"
                                onClick={() => renderComponent('FileManager')}
                            >
                                Explorador de archivos
                            </Button>
                        )}
                        {/* AdminDropdown visible solo en pantallas grandes */}
                        <AdminDropdown renderComponent={renderComponent}/>
                    </div>

                    {/* Botón de cerrar sesión visible en todas las pantallas */}
                    <div>
                        <button
                            className="nav__bar__button transition-opacity hover:text-black"
                            onClick={() => {
                                const modal = document.getElementById('modal_sesion_close') as HTMLDialogElement | null;
                                modal?.showModal();
                            }}
                        >
                            Cerrar sesión
                        </button>
                        <dialog id="modal_sesion_close" className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg text-center">
                                    ¿Estás seguro de cerrar sesión?
                                </h3>
                                <div className="modal-action justify-center">
                                    <form method="dialog">
                                        <button className="btn btn-active btn-secondary bg-warning text-base-content hover:text-base-100 m-3">No cerrar sesión</button>
                                        <button
                                            type="button"
                                            className="btn btn-active btn-primary m-3"
                                            onClick={closeSession}
                                        >
                                            Sí, cerrar sesión
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </div>
                </nav>

                <div className="mt-4">
                    {component ? component : <FileManager/>}
                </div>
            </section>
        </>
    );
};

// Componentes individuales
const ProfileComponent: React.FC = () => {
    const { auth } = usePage<EmployeePageProps>().props;
    return <Profile mustVerifyEmail={false} status="" auth={auth} />;
};

// Envolviendo el contenido de Home con el Provider de Permisos
const Home: React.FC = () => {
    return (
        <PermissionsProvider>
            <HomeContent />
        </PermissionsProvider>
    );
};

export default Home;
