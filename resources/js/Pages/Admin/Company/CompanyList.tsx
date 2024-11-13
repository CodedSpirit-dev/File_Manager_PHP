import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EditCompany from "@/Pages/Admin/Company/EditCompany";
import CreateCompany from "@/Pages/Admin/Company/CreateCompany";
import { Company } from "@/types";
import { deleteCompany } from "@/Pages/Admin/Company/companyApi";
import {Head} from "@inertiajs/react";

const CompanyList: React.FC = (): React.ReactNode => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

    const confirmDeleteRef = useRef<HTMLDialogElement>(null);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
    const [positionsCount, setPositionsCount] = useState(0);
    const [employeesCount, setEmployeesCount] = useState(0);

    const [loadingEdit, setLoadingEdit] = useState<number | null>(null);
    const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const response = await axios.get('admin/companies');
            setCompanies(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error al cargar los datos');
            setLoading(false);
        }
    };

    const handleEditClick = (company: Company) => {
        setLoadingEdit(company.id);
        setEditingCompany(company);
        setModalOpen(true);
        setLoadingEdit(null);
    };

    const handleDeleteClick = async (company: Company) => {
        setLoadingDelete(company.id);
        try {
            const response = await axios.get(`admin/companies/${company.id}/counts`);
            setPositionsCount(response.data.positions_count);
            setEmployeesCount(response.data.employees_count);
            setCompanyToDelete(company);
            confirmDeleteRef.current?.showModal();
        } catch (error) {
            setDeleteError("Error al obtener datos de la empresa.");
        } finally {
            setLoadingDelete(null);
        }
    };

    const confirmDelete = async () => {
        if (!companyToDelete) return;

        setLoadingDelete(companyToDelete.id);
        try {
            await deleteCompany(companyToDelete.id);
            setDeleteSuccess("Compañía eliminada exitosamente.");
            fetchCompanies();
        } catch (error: any) {
            setDeleteError(error.response?.data?.message || "Error al eliminar la empresa.");
        } finally {
            confirmDeleteRef.current?.close();
            setCompanyToDelete(null);
            setLoadingDelete(null);
        }
    };

    const handleCreateSuccess = () => {
        fetchCompanies();
        setCreateModalOpen(false); // Cierra el modal después de agregar una empresa
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
            <Head title={'Empresas'} />
            <h2 className="text-center">LISTA DE EMPRESAS</h2>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setCreateModalOpen(true)} // Abre el modal de creación
                    className="btn btn-success"
                >
                    Agregar nueva empresa
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr className="text-primary-content">
                        <th className="px-4 py-2 text-left">Nombre de la Empresa</th>
                        <th className="px-4 py-2 text-left">Cantidad de Empleados</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {companies.map(company => (
                        <tr key={company.id} className="hover:bg-base-200">
                            <td className="border px-4 py-2 text-sm text-base-content truncate">
                                {company.name}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content">
                                {company.employees_count ?? 0}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={() => handleEditClick(company)}
                                        className={`btn btn-primary btn-sm ${loadingEdit === company.id ? 'loading' : ''}`}
                                        disabled={loadingEdit === company.id}
                                    >
                                        {loadingEdit === company.id ? '' : 'Editar'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(company)}
                                        className={`btn btn-error btn-sm text-base-100 ${loadingDelete === company.id ? 'loading' : ''}`}
                                        disabled={loadingDelete === company.id}
                                    >
                                        {loadingDelete === company.id ? '' : 'Eliminar'}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Modal de confirmación de eliminación */}
                <dialog ref={confirmDeleteRef} className="modal modal-bottom sm:modal-middle">
                    <form method="dialog" className="modal-box">
                        <h4 className="font-bold text-center">¿Estás seguro de eliminar {companyToDelete?.name} de la base de datos?</h4>
                        <p className="text-justify">
                            Se eliminarán <b>{positionsCount}</b> puestos y <b>{employeesCount}</b> empleados deberán ser reasignados a nuevas empresas y puestos.
                        </p>
                        <p className="text-justify">
                            Esta operación borrará todos los archivos relacionados a la empresa y no se podrán recuperar.
                        </p>
                        <div className="modal-action justify-center">
                            <button
                                className="btn-cancel"
                                onClick={() => confirmDeleteRef.current?.close()}
                                disabled={!!loadingDelete}
                            >
                                No, cancelar
                            </button>
                            <button
                                onClick={() => confirmDelete()}
                                className={`btn-accept ${!!loadingDelete ? 'loading' : ''}`}
                                disabled={!!loadingDelete}
                            >
                                {!loadingDelete ? 'Sí, eliminar' : ''}
                            </button>
                        </div>
                    </form>
                </dialog>

                {/* Modal de creación de empresa */}
                {createModalOpen && (
                    <dialog open className="modal modal-bottom sm:modal-middle">
                        <CreateCompany
                            onClose={() => setCreateModalOpen(false)}
                            onSuccess={handleCreateSuccess}
                        />
                    </dialog>
                )}

                {/* Modal de edición de empresa */}
                {modalOpen && editingCompany && (
                    <EditCompany
                        company={editingCompany}
                        onClose={(wasEdited) => {
                            setModalOpen(false);
                            if (wasEdited) {
                                fetchCompanies();
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CompanyList;
