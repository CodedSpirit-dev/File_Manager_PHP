import { useEffect, useState } from 'react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import { Company, Position, Employee } from "@/types";

const EmployeeList: React.FC = (): React.ReactNode => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        Promise.all([
            axios.get('api/employeelist'),
            axios.get('api/positions'),
            axios.get('api/companies'),
        ])
            .then(([employeeResponse, positionsResponse, companiesResponse]) => {
                setEmployees(employeeResponse.data);
                setPositions(positionsResponse.data);
                setCompanies(companiesResponse.data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Error al cargar los datos');
                setLoading(false);
            });
    }, []);


    if (loading) {
        return <span className="flex my-auto mx-auto bg-primary loading loading-dots loading-lg w-2/4 h-screen"></span>
    }

    if (error) {
        console.log(error);
        return <div>{error}</div>;
    }
    return (
        <div className='container__75__table'>
            <h2 className="text-xl font-bold mb-4">Lista de Empleados</h2>
            <div className="overFlow"> {/* Contenedor desplazable */}
                <table className="employee__table">
                    <thead>
                        <tr className={'text-xl'}>
                            <th className="px-4 py-2 w-2">Nombre</th>
                            <th className="px-4 py-2 w-2">Fecha de Registro</th>
                            <th className="px-4 py-2 w-2">Puesto</th>
                            <th className={'px-4 py-2 w-2'}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee => {
                            const position = positions.find(position => position.id === employee.position_id);
                            const company = companies.find(company => company.id === position?.company_id);
                            return (
                                <tr className={'hover'} key={employee.id}>
                                    <td className="border px-4 py-2 name-cell">{employee.first_name + ' ' + employee.last_name_1}</td>
                                    <td className="border px-4 py-2">{new Date(employee.registered_at).toLocaleDateString()}</td>
                                    <td className="border px-4 py-2">{position?.name}
                                        <br/>
                                        <span className="badge bg-primary text-white ">{company?.name}</span>
                                    </td>
                                    <td className="border px-4 py-2">
                                        <a href={`/admin/employee/${employee.id}/edit`} className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg">Editar</a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default EmployeeList;
