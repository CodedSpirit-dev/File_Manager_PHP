import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Button } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import CreateEmployee from './Admin/CreateEmployee';
import Welcome from './Welcome';



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
            default:
                setComponent(null);
        }
    };

    return (
        <div>
            <div>
                <div>
                    <nav className='nav__bar'>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                            Dashboard
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                            Explorador de archivos
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                            Registros
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component2')}>
                           Administracion de empleados
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component2')}>
                           Cerrar sesion
                        </Button>
                        <h1 className='text-5xl w-96 font-extrabold justify-end content-end'>SGI</h1>
                    </nav>
                    <div className='mt-4'>
                    {component}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Component2: React.FC = () => <div><CreateEmployee/></div>;
const Component1: React.FC = () => <div><Welcome/></div>;


export default Home;