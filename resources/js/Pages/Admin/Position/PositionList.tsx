// src/Pages/Admin/Position/PositionList.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreatePosition from "@/Pages/Admin/Position/CreatePosition";
import { Position } from "@/types";
import { deletePosition, getPositions, getPositionCounts } from "@/Pages/Admin/Position/positionApi";
import EditPosition from "@/Pages/Admin/Position/EditPosition";
import {Head} from "@inertiajs/react";

const PositionList: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
    const [employeesCount, setEmployeesCount] = useState<number>(0); // Contador de empleados

    const confirmDeleteRef = useRef<HTMLDialogElement>(null);
    const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

    const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const data = await getPositions();
            setPositions(data);
            setLoading(false);
        } catch (error) {
            setError('Error al cargar los datos de posiciones');
            setLoading(false);
        }
    };

    const handleEditClick = (position: Position) => {
        setEditingPosition(position);
        setModalOpen(true);
    };

    const handleDeleteClick = async (position: Position) => {
        setLoadingDelete(position.id);
        try {
            // Obtener el conteo de empleados asociados a la posición
            const counts = await getPositionCounts(position.id);
            setEmployeesCount(counts.employees_count);
            setPositionToDelete(position);
            confirmDeleteRef.current?.showModal();
        } catch (error) {
            setDeleteError("Error al obtener datos de la posición.");
        } finally {
            setLoadingDelete(null);
        }
    };

    const confirmDelete = async () => {
        if (!positionToDelete) return;

        setLoadingDelete(positionToDelete.id);
        try {
            await deletePosition(positionToDelete.id);
            setDeleteSuccess("Puesto eliminado exitosamente.");
            fetchPositions();
        } catch (error: any) {
            setDeleteError(error.response?.data?.message || "Error al eliminar el puesto.");
        } finally {
            confirmDeleteRef.current?.close();
            setPositionToDelete(null);
            setLoadingDelete(null);
        }
    };

    const handleCreateSuccess = () => {
        fetchPositions();
        setCreateModalOpen(false); // Cierra el modal después de agregar un puesto
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
            <Head title={'Puestos'} />
            <h2 className="text-3xl font-bold mb-6 text-center text-primary">Lista de Puestos</h2>
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setCreateModalOpen(true)} // Abre el modal de creación
                    className="btn btn-success"
                >
                    Agregar nuevo puesto
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr className="text-primary-content">
                        <th className="px-4 py-2 text-left">Nombre del Puesto</th>
                        <th className="px-4 py-2 text-left">Empresa</th>
                        <th className="px-4 py-2 text-left">Cantidad de Empleados</th>
                        <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {positions.map(position => (
                        <tr key={position.id} className="hover:bg-base-200">
                            <td className="border px-4 py-2 text-sm text-base-content truncate">
                                {position.name}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content truncate">
                                {position.company_name || 'N/A'}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content">
                                {position.employees_count ?? 0}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        onClick={() => handleEditClick(position)}
                                        className={`btn btn-primary btn-sm`}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(position)}
                                        className={`btn btn-error btn-sm text-base-100`}
                                    >
                                        Eliminar
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
                        <h4 className="font-bold text-center">
                            ¿Estás seguro de eliminar el puesto <b>{positionToDelete?.name}</b> de la base de datos?
                        </h4>
                        <p className="text-justify mt-2">
                            Se eliminarán <b>{employeesCount}</b> empleados asociados a este puesto. Estos empleados deberán ser reasignados a nuevas empresas y puestos.
                        </p>
                        <div className="modal-action justify-center">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => confirmDeleteRef.current?.close()}
                                disabled={!!loadingDelete}
                            >
                                No, cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className={`btn btn-error ${loadingDelete ? 'loading' : ''}`}
                                disabled={!!loadingDelete}
                            >
                                {loadingDelete ? 'Eliminando...' : 'Sí, eliminar'}
                            </button>
                        </div>
                    </form>
                </dialog>

                {/* Modal de creación de puesto */}
                {createModalOpen && (
                    <dialog open className="modal modal-bottom sm:modal-middle">
                        <CreatePosition
                            onClose={() => setCreateModalOpen(false)}
                            onSuccess={handleCreateSuccess}
                        />
                    </dialog>
                )}

                {/* Modal de edición de puesto */}
                {modalOpen && editingPosition && (
                    <dialog open className="modal modal-bottom sm:modal-middle">
                        <EditPosition
                            position={editingPosition}
                            onClose={(wasEdited) => {
                                setModalOpen(false);
                                if (wasEdited) {
                                    fetchPositions();
                                }
                            }}
                        />
                    </dialog>
                )}

                {/* Modal de éxito al eliminar */}
                {deleteSuccess && (
                    <dialog open className="modal modal-bottom sm:modal-middle">
                        <div className="modal-box">
                            <h3 className="font-bold text-center">Éxito</h3>
                            <p className="text-center text-green-600">{deleteSuccess}</p>
                            <div className="modal-action justify-center">
                                <button className="btn btn-success" onClick={() => setDeleteSuccess(null)}>Cerrar</button>
                            </div>
                        </div>
                    </dialog>
                )}

                {/* Modal de error al eliminar */}
                {deleteError && (
                    <dialog open className="modal modal-bottom sm:modal-middle">
                        <div className="modal-box">
                            <h4 className="font-bold text-center">Error al Eliminar Puesto</h4>
                            <p className="text-center text-red-600">{deleteError}</p>
                            <div className="modal-action justify-center">
                                <button className="btn btn-error" onClick={() => setDeleteError(null)}>Cerrar</button>
                            </div>
                        </div>
                    </dialog>
                )}
            </div>
        </div>
            );
            };

            export default PositionList;
