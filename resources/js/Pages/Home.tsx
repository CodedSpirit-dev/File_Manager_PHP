// HomeContent.tsx
import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button, Menu } from '@headlessui/react';
import axios from 'axios';
import { LuFolderOpen } from 'react-icons/lu';
import { CiUser } from 'react-icons/ci';
import { IoBusinessOutline } from 'react-icons/io5';
import { MdOutlineWorkOutline } from 'react-icons/md';
import { GrGroup } from 'react-icons/gr';

import { AuthProvider, useAuth, Permissions } from '@/contexts/AuthProvider';
import AdminDropdown from '@/Components/AdminDropdown';
import EmployeeList from './Admin/Employee/EmployeeList';
import CompanyList from './Admin/Company/CompanyList';
import PositionList from './Admin/Position/PositionList';
import Profile from './Profile/Profile';
import FileManager from './FileSystem/FileManager';
import { EmployeePageProps } from '@/types';

const HomeContent: React.FC = () => {
    const { hasPermission } = useAuth();
    const { auth } = usePage<EmployeePageProps>().props;
    const employee = auth.user;

    // Inicializar el componente activo en "FileManager" y mostrarlo por defecto
    const [component, setComponent] = useState<JSX.Element | null>(<FileManager />);
    const [activeComponent, setActiveComponent] = useState<string>('FileManager');

    const renderComponent = (componentName: string) => {
        setActiveComponent(componentName);
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
            case 'CompanyList':
                setComponent(<CompanyList />);
                break;
            case 'PositionList':
                setComponent(<PositionList />);
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
            <Head title="Explorador de archivos" />
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

                            <Menu.Items
                                className="absolute left-0 mt-2 w-56 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none z-20">
                                <div className="px-1 py-1 ">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        activeComponent === 'FileManager'
                                                            ? 'bg-primary text-white cursor-not-allowed'
                                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('FileManager')}
                                                    disabled={activeComponent === 'FileManager'}
                                                >
                                                    <LuFolderOpen className="mr-2" /> Explorador de Archivos
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        activeComponent === 'Profile'
                                                            ? 'bg-primary text-white cursor-not-allowed'
                                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('Profile')}
                                                    disabled={activeComponent === 'Profile'}
                                                >
                                                    <CiUser className="mr-2" /> Perfil
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        activeComponent === 'CompanyList'
                                                            ? 'bg-primary text-white cursor-not-allowed'
                                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('CompanyList')}
                                                    disabled={activeComponent === 'CompanyList'}
                                                >
                                                    <IoBusinessOutline className="mr-2" /> Empresas
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        activeComponent === 'PositionList'
                                                            ? 'bg-primary text-white cursor-not-allowed'
                                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('PositionList')}
                                                    disabled={activeComponent === 'PositionList'}
                                                >
                                                    <MdOutlineWorkOutline className="mr-2" /> Puestos
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    className={`${
                                                        activeComponent === 'EmployeeList'
                                                            ? 'bg-primary text-white cursor-not-allowed'
                                                            : active ? 'bg-info text-white' : 'text-gray-900'
                                                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                    onClick={() => renderComponent('EmployeeList')}
                                                    disabled={activeComponent === 'EmployeeList'}
                                                >
                                                    <GrGroup className="mr-2" /> Usuarios
                                                </button>
                                            )}
                                        </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Menu>
                    </div>

                    {/* Navbar para pantallas grandes */}
                    <div className="hidden lg:flex space-x-4">
                            <Button
                                className={`btn btn-ghost nav__bar__button hover:text-black ${
                                    activeComponent === 'FileManager' ? 'bg-primary text-white cursor-not-allowed' : ''
                                }`}
                                onClick={() => renderComponent('FileManager')}
                                disabled={activeComponent === 'FileManager'}
                            >
                                <LuFolderOpen className="mr-2" /> Explorador de archivos
                            </Button>
                        {/* AdminDropdown visible solo en pantallas grandes */}
                        <AdminDropdown renderComponent={renderComponent} activeComponent={activeComponent} />
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
                                        <button
                                            className="btn btn-active btn-secondary bg-warning text-base-content hover:text-base-100 m-3">No
                                            cerrar sesión
                                        </button>
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
                    {component}
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

// Envolviendo el contenido de Home con el Provider de Autenticación
const Home: React.FC = () => {
    return (
        <AuthProvider>
            <HomeContent />
        </AuthProvider>
    );
};

export default Home;
