// src/Pages/Home.tsx

import { EmployeePageProps } from '@/types';
import { Button } from '@headlessui/react';
import React, { useState } from 'react';
import CreateEmployee from './Admin/CreateEmployee';
import EmployeeList from './Admin/EmployeeList';
import axios from 'axios';
import Profile from './Profile/Profile';
import { Head, usePage } from '@inertiajs/react';
import CreateCompany from './Admin/CreateCompany';
import CreatePosition from './Admin/CreatePosition';
import FileManager from './FileSystem/FileManager';
import AdminDropdown from '@/Components/AdminDropdown';
import { PermissionsProvider, usePermissions } from '@/contexts/PermissionsContext';
import Loading from "@/Components/Loading";

const HomeContent: React.FC = () => {
    const { hasPermission } = usePermissions();
    const { auth } = usePage<EmployeePageProps>().props;
    const employee = auth.user; // Actualizado a auth.user

    const [component, setComponent] = useState<JSX.Element | null>(null);

    const renderComponent = (componentName: string) => {
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
            case 'CreateEmployee':
                setComponent(<CreateEmployee />);
                break;
            case 'CreateCompany':
                setComponent(<CreateCompany />);
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
                <nav className="nav__bar rounded-lg flex items-center justify-between p-4 bg-gray-100">
                    <div className="flex space-x-4">
                        {hasPermission('can_read_files') && (
                            <Button
                                className="btn btn-ghost nav__bar__button hover:text-black"
                                onClick={() => renderComponent('FileManager')}
                            >
                                Explorador de archivos
                            </Button>
                        )}

                        <AdminDropdown renderComponent={renderComponent} />
                    </div>

                    {/* Botón para cerrar sesión */}
                    <div>
                        <button
                            className="nav__bar__button transition-opacity hover:text-black"
                            onClick={() => {
                                const modal = document.getElementById(
                                    'modal_sesion_close'
                                ) as HTMLDialogElement | null;
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
                                        <button className="btn m-3 btn-info">
                                            No cerrar sesión
                                        </button>
                                        <button
                                            type="button" // Añadir type="button" para evitar el envío del formulario
                                            className="btn m-3 btn-warning"
                                            onClick={closeSession}
                                        >
                                            Si, cerrar sesión
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </div>
                </nav>

                <div className="mt-4">
                    {component ? component : <Profile mustVerifyEmail={false} status="" auth={auth} />}
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
