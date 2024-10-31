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
        const position = positions.find(position => position.id === employee.position_id);
        const companyId = position ? position.company_id : null;
        // @ts-ignore
        setEditingEmployee({ ...employee, company_id: companyId });
        setModalOpen(true);
    };

    useEffect(() => {
        setLoading(true);

        Promise.all([
            axios.get('admin/employees'),
            axios.get('api/positions'),
            axios.get('admin/companies'),
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
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        console.log(error);
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="container__75__table">
            <h2 className="text-2xl font-bold mb-4 text-center">Lista de Empleados</h2>
            <div className="overFlow"> {/* Contenedor desplazable */}
                <table className="employee__table w-full table-auto">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha de Registro</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Puesto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map(employee => {
                        const position = positions.find(position => position.id === employee.position_id);
                        const company = position ? companies.find(company => company.id === position.company_id) : null;
                        return (
                            <tr key={employee.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2 text-sm text-gray-900 truncate">
                                    {employee.first_name} {employee.last_name_1}
                                </td>
                                <td className="border px-4 py-2 text-sm text-gray-900">
                                    {new Date(employee.registered_at).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="border px-4 py-2 text-sm text-gray-900">
                                    {position?.name}
                                    <br></br>
                                    {company && (
                                        <span className="ml-2 inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                {company.name}
                                            </span>
                                    )}
                                </td>
                                <td className="border px-4 py-2 text-sm text-gray-900">
                                    <button
                                        onClick={() => handleEditClick(employee)}
                                        className="btn btn-primary"
                                    >
                                        Editar
                                    </button>
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
