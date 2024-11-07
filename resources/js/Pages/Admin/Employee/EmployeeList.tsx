import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditEmployee from "@/Pages/Admin/Employee/EditEmployee";
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

    const handleDeleteClick = (employee: Employee) => {
        alert(`Funcionalidad de eliminación para ${employee.first_name} ${employee.last_name_1} está pendiente.`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-base-100">
                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-error">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-base-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">Lista de Empleados</h2>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr className="text-primary-content">
                        <th className="px-4 py-2 text-left">Nombre</th>
                        <th className="px-4 py-2 text-left">Fecha de Registro</th>
                        <th className="px-4 py-2 text-left">Último Inicio de Sesión</th>
                        <th className="px-4 py-2 text-left">Puesto</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map(employee => {
                        const position = positions.find(position => position.id === employee.position_id);
                        const company = position ? companies.find(company => company.id === position.company_id) : null;
                        return (
                            <tr key={employee.id} className="hover:bg-base-200">
                                <td className="border px-4 py-2 text-sm text-base-content truncate">
                                    {employee.first_name} {employee.last_name_1}
                                </td>
                                <td className="border px-4 py-2 text-sm text-base-content">
                                    {new Date(employee.registered_at).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="border px-4 py-2 text-sm text-base-content">
                                    {employee.last_login_at ? new Date(employee.last_login_at).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'No registrado'}
                                </td>
                                <td className="border px-4 py-2 text-sm text-base-content">
                                    {position?.name}
                                    <br />
                                    {company && (
                                        <span className="mt-1 inline-block bg-secondary text-secondary-content text-xs px-2 py-1 rounded">
                                            {company.name}
                                        </span>
                                    )}
                                </td>
                                <td className="border px-4 py-2 text-sm text-base-content">
                                    <div className="flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(employee)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(employee)}
                                            className="btn btn-error btn-sm text-base-100"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
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
                            refreshEmployees();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
