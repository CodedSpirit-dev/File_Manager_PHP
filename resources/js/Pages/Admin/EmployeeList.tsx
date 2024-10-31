import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditEmployee from "@/Pages/Admin/EditEmployee";
import { Company, Position, Employee } from "@/types";

const EmployeeList: React.FC = (): React.ReactNode => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleEditClick = (employee: Employee) => {
        setEditingEmployee(employee);
        setModalOpen(true);
    };

    useEffect(() => {
        setLoading(true);

        Promise.all([
            axios.get('admin/employees'),
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

    const refreshEmployees = () => {
        axios.get('admin/employees')
            .then(response => setEmployees(response.data))
            .catch(error => console.error('Error al actualizar la lista de empleados', error));
    };

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
                        const company = position ? companies.find(company => company.id === position.company_id) : null;
                        return (
                            <tr className={'hover'} key={employee.id}>
                                <td className="border px-4 py-2 name-cell">{employee.first_name + ' ' + employee.last_name_1}</td>
                                <td className="border px-4 py-2">{new Date(employee.registered_at).toLocaleDateString()}</td>
                                <td className="border px-4 py-2">{position?.name}
                                    <br/>
                                    <span className="badge bg-primary text-white ">{company?.name}</span>
                                </td>
                                <td className="border px-4 py-2">
                                    <button onClick={() => handleEditClick(employee)}>Editar</button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {modalOpen && editingEmployee && (
                    <EditEmployee
                        employee={editingEmployee}
                        positions={positions}
                        companies={companies}
                        onClose={() => {
                            setModalOpen(false);
                            refreshEmployees(); // Recargar la lista de empleados al cerrar el modal
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
