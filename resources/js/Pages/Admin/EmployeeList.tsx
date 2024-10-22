import { useEffect, useState } from 'react';
import axios from 'axios';

interface Employee {
    id: number;
    first_name: string;
    last_name_1: string;
    last_name_2: string;
    created_at: string;
    updated_at: string;
    company: {
        name: string;
    };
    position: {
        name: string;
    };
}

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Llamada API para obtener la lista de empleados
        axios
            .get('api/employeelist')
            .then(response => {
                setEmployees(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Error al cargar los empleados');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Cargando empleados...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Lista de Empleados</h2>
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Apellido Paterno</th>
                        <th className="px-4 py-2">Apellido Materno</th>
                        <th className="px-4 py-2">Empresa</th>
                        <th className="px-4 py-2">Puesto</th>
                        <th className="px-4 py-2">Fecha de Creación</th>
                        <th className="px-4 py-2">Fecha de Actualización</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td className="border px-4 py-2">{employee.first_name}</td>
                            <td className="border px-4 py-2">{employee.last_name_1}</td>
                            <td className="border px-4 py-2">{employee.last_name_2}</td>
                            <td className="border px-4 py-2">{employee.company.name}</td>
                            <td className="border px-4 py-2">{employee.position.name}</td>
                            <td className="border px-4 py-2">{new Date(employee.created_at).toLocaleDateString()}</td>
                            <td className="border px-4 py-2">{new Date(employee.updated_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeList;
