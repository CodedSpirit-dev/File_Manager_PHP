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

const Home: React.FC = () => {
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
            default:
                setComponent(null);
        }
    };


    const closeSession = () => {
        axios.post('/logout').then(() => {
            window.location.href = '/login';
        });
    };

    return (
        <>
            <nav className="nav__bar">
                <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                    Dashboard
                </Button>
                <Button className="nav__bar__button" onClick={() => renderComponent('Component2')}>
                    Explorador de archivos
                </Button>
                <Button className="nav__bar__button" onClick={() => renderComponent('Component3')}>
                    Lista de Empleados {/* Agregar botón para la lista de empleados */}
                </Button>
                <Button className="nav__bar__button" onClick={() => renderComponent('Component4')}>
                    Administración de empleados
                </Button>
                <button className="nav__bar__button" onClick={() => document.getElementById('modal_sesion_close').showModal()}>Cerrar sesión</button>
                <dialog id="modal_sesion_close" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-center">¿Estás seguro de cerrar sesión?</h3>
                        <div className="modal-action justify-center">
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn m-3 btn-info">No cerrar sesión</button>
                                <button className="btn m-3 btn-warning" onClick={closeSession} >Si, cerrar sesión</button>
                            </form>
                        </div>
                    </div>
                </dialog>
                <h1 className="text-5xl w-96 font-extrabold justify-end content-end">SGI</h1>
            </nav>
            <div className="mt-4">{component}</div>
        </>
    );
};

const Component1: React.FC = () => <div><Profile /></div>;
const Component2: React.FC = () => <div>Explorador de Archivos</div>;
const Component3: React.FC = () => <div><EmployeeList /></div>;
const Component4: React.FC = () => <div><CreateEmployee /></div>;

export default Home;
