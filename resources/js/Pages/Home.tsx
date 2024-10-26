import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import {Company} from '@/types';
import {Button} from '@headlessui/react';
import React, {useState} from 'react';
import CreateEmployee from './Admin/CreateEmployee';
import Welcome from './Welcome';
import EmployeeList from './Admin/EmployeeList';
import axios from 'axios';
import Profile from './Profile/Profile';
import GuestLayout from '@/Layouts/GuestLayout';
import Guest from '@/Layouts/GuestLayout';
import {Head, usePage} from '@inertiajs/react';
import CreateCompany from './Admin/CreateCompany';
import CreatePosition from './Admin/CreatePosition';

const Home: React.FC = () => {
    const {auth} = usePage().props;
    const [component, setComponent] = useState<JSX.Element | null>(null);

    const renderComponent = (componentName: string) => {
        switch (componentName) {
            case 'Component1':
                setComponent(<Component1/>);
                break;
            case 'Component2':
                setComponent(<Component2/>);
                break;
            case 'Component3':
                setComponent(<Component3/>);
                break;
            case 'Component4':
                setComponent(<Component4/>);
                break;
            case 'Component5':
                setComponent(<Component5/>);
                break;
            case 'Component6':
                setComponent(<Component6/>);
                break;
            default:
                setComponent(null);
        }
    };

    const defaultComponent = () => {
        return <Home/>;
    }

    const closeSession = () => {
        axios.post('/logout').finally(() => {
                window.location.href = '/login';
            }
        );
    }

    return (
        <>
            <Head title="Inicio"/>
            <section className="container mx-auto">
                <nav className="nav__bar rounded-lg">
                    <Button className="btn btn-ghost nav__bar__button hover:text-black"
                            onClick={() => renderComponent('Component2')}>
                        Explorador de archivos
                    </Button>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost nav__bar__button">Panel de
                            Administración
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu dropdown-content rounded-box z-[10] mt-4 w-52 p-2 shadow bg-white">
                            <li><Button className="hover:text-black"
                                        onClick={() => renderComponent('Component1')}>Perfil</Button></li>
                            <li><Button className="hover:text-black" onClick={() => renderComponent('Component5')}>Registrar
                                nueva empresa</Button></li>
                            <li><Button className="hover:text-black" onClick={() => renderComponent('Component6')}>Agregar
                                nuevo puesto</Button></li>
                            <li><Button className="hover:text-black" onClick={() => renderComponent('Component4')}>Agregar
                                nuevo empleado</Button></li>
                            <li><Button className="hover:text-black" onClick={() => renderComponent('Component3')}>Lista
                                de Empleados
                            </Button></li>
                        </ul>
                    </div>


                    {/* Agregar botón para cerrar sesión */}
                    <div>
                        <button className="nav__bar__button transition-opacity hover:text-black" onClick={() => {
                            const modal = document.getElementById('modal_sesion_close') as HTMLDialogElement | null;
                            modal?.showModal();
                        }}>Cerrar sesión
                        </button>
                        <dialog id="modal_sesion_close" className="modal">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg text-center">¿Estás seguro de cerrar sesión?</h3>
                                <div className="modal-action justify-center">
                                    <form method="dialog">
                                        <button className="btn m-3 btn-info">No cerrar sesión</button>
                                        <button className="btn m-3 btn-warning" onClick={closeSession}>Si, cerrar
                                            sesión
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

const Component1: React.FC = () => {
    const {auth} = usePage().props;
    return <div><Profile mustVerifyEmail={false} status="" auth={auth}/></div>;
};
const Component2: React.FC = () => <div>Explorador de Archivos</div>;
const Component3: React.FC = () => <div><EmployeeList/></div>;
const Component4: React.FC = () => <div><CreateEmployee/></div>;
const Component5: React.FC = () => <div><CreateCompany/></div>;
const Component6: React.FC = () => <div><CreatePosition/></div>

export default Home;
