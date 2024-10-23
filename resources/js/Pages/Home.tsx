import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Button } from '@headlessui/react';
import React, { useState } from 'react';
import CreateEmployee from './Admin/CreateEmployee';
import Welcome from './Welcome';
import EmployeeList from './Admin/EmployeeList'; // Importar EmployeeList
import axios from 'axios';
import Profile from './Profile/Profile';
import GuestLayout from '@/Layouts/GuestLayout';
import Guest from '@/Layouts/GuestLayout';
import { usePage } from '@inertiajs/react';
import CreateCompany from './Admin/CreateCompany';

const Home: React.FC = () => {
    const { auth } = usePage().props;
    const [component, setComponent] = useState<JSX.Element | null>(null);

    const renderComponent = (componentName: string) => {
        switch (componentName) {
            case 'Component1':
                setComponent(<Component1 />);
                break;
            case 'Component2':
                setComponent(<Component2 />);
                break;
            case 'Component3':
                setComponent(<Component3 />);
                break;
            case 'Component4':
                setComponent(<Component4 />);
                break;
            case 'Component5':
                setComponent(<Component5 />);
                break;
            default:
                setComponent(null);
        }
    };

    const closeSession = () => {
        axios.post('/logout').finally(() => {
            window.location.href = '/login';
        }
        );
    }

    return (
        <>
        <section className="container mx-auto mt-2">
            <nav className="nav__bar rounded-lg">
                <Button className="nav__bar__button transition-all" onClick={() => renderComponent('Component2')}>
                    Explorador de archivos
                </Button>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost nav__bar__button">Panel de Administración</div>
                        <ul
                        tabIndex={0}
                        className="menu dropdown-content bg-base-100 rounded-box z-[1] mt-4 w-52 p-2 shadow">
                        <li><Button className="" onClick={() => renderComponent('Component1')}>Perfil</Button></li>
                        <li><Button className="" onClick={() => renderComponent('Component5')}>Registrar nueva empresa</Button></li>
                        <li><a>Agregar nuevo puesto</a></li>
                        <li><Button className="" onClick={() => renderComponent('Component4')}>Administración de empleados</Button></li>
                        <li><Button className="" onClick={() => renderComponent('Component3')}>Lista de Empleados
                </Button></li>
                    </ul>
                </div>


                {/* Agregar botón para cerrar sesión */}
                <div>
                    <button className="nav__bar__button transition-opacity" onClick={() => {
                        const modal = document.getElementById('modal_sesion_close') as HTMLDialogElement | null;
                        modal?.showModal();
                    }}>Cerrar sesión</button>
                    <dialog id="modal_sesion_close" className="modal">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg text-center">¿Estás seguro de cerrar sesión?</h3>
                            <div className="modal-action justify-center">
                                <form method="dialog">
                                    <button className="btn m-3 btn-info">No cerrar sesión</button>
                                    <button className="btn m-3 btn-warning" onClick={closeSession} >Si, cerrar sesión</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                </div>
                <h1 className="logo">SGI</h1>
            </nav>


            <div className="mt-4">{component}</div>
        </section>
        </>
    );
};

const Component1: React.FC = () => {
    const { auth } = usePage().props;
    return <div><Profile mustVerifyEmail={false} status="" auth={auth} /></div>;
};
const Component2: React.FC = () => <div>Explorador de Archivos</div>;
const Component3: React.FC = () => <div><EmployeeList /></div>;
const Component4: React.FC = () => <div><CreateEmployee /></div>;
const Component5: React.FC = () => <div><CreateCompany /></div>;

export default Home;
