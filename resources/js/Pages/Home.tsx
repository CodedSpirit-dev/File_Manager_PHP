import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Button } from '@headlessui/react';
import React, { useState } from 'react';
import CreateEmployee from './Admin/CreateEmployee';
import Welcome from './Welcome';
import EmployeeList from './Admin/EmployeeList'; // Importar EmployeeList

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
            case 'EmployeeList':
                setComponent(<EmployeeList />);
                break;
            default:
                setComponent(null);
        }
    };

    return (
        <div>
            <div>
                <div>
                    <nav className="nav__bar">
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                            Dashboard
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component1')}>
                            Explorador de archivos
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('EmployeeList')}>
                            Lista de Empleados {/* Agregar botón para la lista de empleados */}
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component2')}>
                            Administración de empleados
                        </Button>
                        <Button className="nav__bar__button" onClick={() => renderComponent('Component2')}>
                            Cerrar sesión
                        </Button>
                        <h1 className="text-5xl w-96 font-extrabold justify-end content-end">SGI</h1>
                    </nav>
                    <div className="mt-4">{component}</div>
                </div>
            </div>
        </div>
    );
};

const Component2: React.FC = () => <div><CreateEmployee /></div>;
const Component1: React.FC = () => <div><Welcome /></div>;

export default Home;
