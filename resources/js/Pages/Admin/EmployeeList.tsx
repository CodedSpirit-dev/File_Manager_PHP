import { useEffect, useState } from 'react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';

interface Employee {
    id: number;
    first_name: string;
    last_name_1: string;
    last_name_2: string;
    created_at: string;
    updated_at: string;
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
        console.log(error);
    }

    return (
        <div className='container__75'>
            <h2 className="text-xl font-bold mb-4">Lista de Empleados</h2>
            <table className="employee__table">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Nombre</th>
                        <th className="px-4 py-2">Apellido Paterno</th>
                        <th className="px-4 py-2">Apellido Materno</th>
                        <th className="px-4 py-2">Fecha de Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id}>
                            <td className="border px-4 py-2">{employee.first_name}</td>
                            <td className="border px-4 py-2">{employee.last_name_1}</td>
                            <td className="border px-4 py-2">{employee.last_name_2}</td>
                            <td className="border px-4 py-2">{new Date(employee.created_at).toLocaleDateString()}</td>                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeList;
