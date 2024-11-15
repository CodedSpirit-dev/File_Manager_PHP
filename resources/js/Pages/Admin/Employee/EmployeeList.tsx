// src/components/EmployeeList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditEmployee from "@/Pages/Admin/Employee/EditEmployee";
import CreateEmployee from "@/Pages/Admin/Employee/CreateEmployee";
import { Company, Position, Employee } from "@/types";
import { Head } from "@inertiajs/react";
import { useAuth } from "@/contexts/AuthProvider"; // Importa el contexto de autenticación
import CompanyBadge from "@/Pages/Admin/CompanyBadge";

const EmployeeList: React.FC = () => {
    const {hasPermission} = useAuth(); // Obtén la función de verificación de permisos
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Estados para el proceso de eliminación
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Estados para manejar el spinner en el botón "Editar"
    const [loadingEmployeeId, setLoadingEmployeeId] = useState<number | null>(null);

    // Función para manejar el clic en "Editar"
    const handleEditClick = (employee: Employee) => {
        setLoadingEmployeeId(employee.id);
        const position = positions.find((position) => position.id === employee.position_id);
        const companyId = position ? position.company_id : null;
        const employeeWithCompany = {...employee, company_id: companyId};

        setEditingEmployee(employeeWithCompany);
        setEditModalOpen(true);
        setLoadingEmployeeId(null);
    };

    // Función para obtener los datos iniciales
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axios.all([
            axios.get('admin/employees'),
            axios.get('api/positions'),
            axios.get('admin/companies'),
        ])
            .then(axios.spread((employeeResponse, positionsResponse, companiesResponse) => {
                setEmployees(employeeResponse.data);
                setPositions(positionsResponse.data);
                setCompanies(companiesResponse.data);
                setLoading(false);
            }))
            .catch((error) => {
                console.error('Error al cargar los datos', error);
                setError('Error al cargar los datos');
                setLoading(false);
            });
    };

    // Función para manejar el clic en "Eliminar"
    const handleDeleteClick = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setShowConfirmDeleteModal(true);
    };

    // Función para confirmar la eliminación
    const confirmDelete = () => {
        if (!employeeToDelete) return;

        setIsDeleteLoading(true);
        setDeleteError(null);

        axios.delete(`admin/employees/${employeeToDelete.id}`)
            .then(() => {
                setShowConfirmDeleteModal(false);
                setShowSuccessModal(true);
                setEmployeeToDelete(null);
            })
            .catch((error) => {
                console.error('Error al eliminar el usuario', error);
                setDeleteError('Ocurrió un error al eliminar el usuario.');
                setShowErrorModal(true);
            })
            .finally(() => {
                setIsDeleteLoading(false);
            });
    };

    // Función para cerrar el modal de éxito
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        fetchData();
    };

    // Función para cerrar el modal de error
    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        setEmployeeToDelete(null);
    };

    // Función para cerrar el modal de confirmación sin eliminar
    const handleCancelDelete = () => {
        setShowConfirmDeleteModal(false);
        setEmployeeToDelete(null);
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
            <Head title={'Usuarios'}/>
            <h2 className="text-center">LISTA DE USUARIOS</h2>

            {/* Botón para agregar un nuevo empleado, visible solo si el usuario tiene permiso */}
            {hasPermission("can_create_users") && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="btn btn-success"
                    >
                        Agregar usuario
                    </button>
                </div>
            )}

            {/* Tabla de Empleados */}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr className="text-primary-content">
                        <th className="px-4 py-2 text-center">Nombre</th>
                        <th className="px-4 py-2 text-center">Número Telefónico</th>
                        <th className="px-4 py-2 text-center">Fecha de Registro</th>
                        <th className="px-4 py-2 text-center">Último Inicio de Sesión</th>
                        <th className="px-4 py-2 text-center">Puesto</th>
                        {(hasPermission("can_update_users") || hasPermission("can_delete_users")) && (
                            <th className="px-4 py-2 text-left">Acciones</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map((employee) => {
                        const position = positions.find((position) => position.id === employee.position_id);
                        const company = position ? companies.find((company) => company.id === position.company_id) : null;
                        const companyName = company ? company.name : null;

                        return (
                            <tr key={employee.id} className="hover:bg-base-200">
                                <td className="border px-4 py-2 text-sm text-base-content truncate">
                                    {employee.first_name} {employee.last_name_1}
                                </td>
                                <td className="border px-4 py-2 text-center text-sm text-base-content">
                                    {employee.phone_number || 'No disponible'}
                                </td>
                                <td className="border px-4 py-2 text-center text-sm text-base-content">
                                    {new Date(employee.registered_at).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </td>
                                <td className="border px-4 py-2 text-center text-sm text-base-content">
                                    {employee.last_login_at
                                        ? new Date(employee.last_login_at).toLocaleDateString('es-ES', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })
                                        : 'No registrado'}
                                </td>
                                <td className="border px-4 py-2 text-center text-sm text-base-content">
                                    {position?.name}
                                    <br/>
                                    {company && (
                                        <CompanyBadge companyName={company.name}/>
                                    )}
                                </td>
                                {(hasPermission("can_update_users") || hasPermission("can_delete_users")) && (
                                    <td className="border px-4 py-2 text-sm text-base-content">
                                        <div className="flex justify-center space-x-2">
                                            {hasPermission("can_update_users") && (
                                                <button
                                                    onClick={() => handleEditClick(employee)}
                                                    className="btn btn-primary btn-sm"
                                                    disabled={loadingEmployeeId === employee.id}
                                                >
                                                    {loadingEmployeeId === employee.id ? (
                                                        <span className="loading loading-spinner"></span>
                                                    ) : (
                                                        'Editar'
                                                    )}
                                                </button>
                                            )}
                                            {hasPermission("can_delete_users") && (
                                                <button
                                                    onClick={() => handleDeleteClick(employee)}
                                                    className="btn btn-error btn-sm text-base-100"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            {employeeToDelete && (
                <dialog open className={`modal modal-open`}>
                    <form method="dialog" className="modal-box">
                        <h3 className="font-bold text-lg">Confirmar Eliminación</h3>
                        <p className="py-4">
                            ¿Estás seguro de que deseas eliminar al
                            empleado <strong>{employeeToDelete.first_name} {employeeToDelete.last_name_1}</strong>?
                        </p>
                        {isDeleteLoading ? (
                            <div className="flex justify-center">
                                <span className="loading loading-spinner loading-md"></span>
                            </div>
                        ) : (
                            <div className="modal-action">
                                <button type="button" className="btn btn-error" onClick={confirmDelete}>
                                    Eliminar
                                </button>
                                <button type="button" className="btn" onClick={handleCancelDelete}>
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>
                </dialog>
            )}

            {/* Modal de Éxito */}
            {showSuccessModal && (
                <dialog open className="modal modal-open">
                    <form method="dialog" className="modal-box">
                        <h3 className="font-bold text-lg">¡Éxito!</h3>
                        <p className="py-4">El empleado ha sido eliminado exitosamente.</p>
                        <div className="modal-action">
                            <button type="button" className="btn btn-primary" onClick={handleCloseSuccessModal}>
                                Aceptar
                            </button>
                        </div>
                    </form>
                </dialog>
            )}

            {/* Modal de Error */}
            {showErrorModal && (
                <dialog open className="modal modal-open">
                    <form method="dialog" className="modal-box">
                        <h3 className="font-bold text-lg text-error">Error</h3>
                        <p className="py-4">{deleteError || 'Ocurrió un error al eliminar el empleado.'}</p>
                        <div className="modal-action">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseErrorModal}>
                                Aceptar
                            </button>
                        </div>
                    </form>
                </dialog>
            )}

            {/* Modales adicionales */}
            {editingEmployee && (
                <>
                    <input
                        type="checkbox"
                        id="edit-employee-modal"
                        className="modal-toggle"
                        checked={editModalOpen}
                        readOnly
                    />
                    <label htmlFor="edit-employee-modal"
                           className={`modal cursor-pointer ${editModalOpen ? 'modal-open' : ''}`}>
                        <label className="modal-box relative" htmlFor="">
                            <EditEmployee
                                employee={editingEmployee}
                                positions={positions}
                                companies={companies}
                                onClose={() => setEditModalOpen(false)}
                                onSuccess={() => {
                                    setEditModalOpen(false);
                                    fetchData();
                                }}
                            />
                        </label>
                    </label>
                </>
            )}

            {addModalOpen && (
                <>
                    <input
                        type="checkbox"
                        id="add-employee-modal"
                        className="modal-toggle"
                        checked={addModalOpen}
                        readOnly
                    />
                    <label htmlFor="add-employee-modal"
                           className={`modal cursor-pointer ${addModalOpen ? 'modal-open' : ''}`}>
                        <label className="modal-box relative" htmlFor="">
                            <CreateEmployee
                                onSuccess={() => {
                                    fetchData();
                                    setAddModalOpen(false);
                                }}
                                onClose={() => setAddModalOpen(false)}
                            />
                        </label>
                    </label>
                </>
            )}

            {successMessage && (
                <dialog open className="modal modal-open">
                    <form method="dialog" className="modal-box">
                        <h3 className="font-bold text-center text-lg">Acción Exitosa</h3>
                        <p className="text-center py-4 text-green-500">{successMessage}</p>
                        <div className="modal-action">
                            <button type="button" className="btn btn-primary" onClick={handleCloseSuccessModal}>
                                Aceptar
                            </button>
                        </div>
                    </form>
                </dialog>
            )}
        </div>
    );
}

    export default EmployeeList;
