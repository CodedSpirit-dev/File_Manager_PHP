import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import CreatePosition from "@/Pages/Admin/Position/CreatePosition";
import { Position } from "@/types";
import { deletePosition, getPositions, getPositionCounts } from "@/Pages/Admin/Position/positionApi";
import EditPosition from "@/Pages/Admin/Position/EditPosition";
import { Head } from "@inertiajs/react";
import { useAuth } from "@/contexts/AuthProvider";

const PositionList: React.FC = () => {
    const { hasPermission } = useAuth(); // Obtén la función para verificar permisos
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
    const [loadingData, setLoadingData] = useState<number | null>(null); // Indicador de carga al obtener datos

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
        setLoadingData(position.id); // Indicar que estamos obteniendo datos para este puesto
        try {
            const counts = await getPositionCounts(position.id);
            setEmployeesCount(counts.employees_count);
            setPositionToDelete(position);
            confirmDeleteRef.current?.showModal();
        } catch (error) {
            setDeleteError("Error al obtener datos de la posición.");
        } finally {
            setLoadingData(null);
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
            <h2 className="text-center mb-2">LISTA DE PUESTOS</h2>
            {hasPermission("can_create_positions") && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={() => setCreateModalOpen(true)} // Abre el modal de creación
                        className="btn btn-success"
                    >
                        Agregar nuevo puesto
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="table w-full">
                    <thead>
                    <tr className="text-primary-content">
                        <th className="px-4 py-2 text-center">Nombre del Puesto</th>
                        <th className="px-4 py-2 text-center">Empresa</th>
                        <th className="px-4 py-2 text-center">Nivel de Jerarquía</th> {/* Nueva columna para el nivel de jerarquía */}
                        <th className="px-4 py-2 text-center">Cantidad de Empleados</th>
                        {(hasPermission("can_update_positions") || hasPermission("can_delete_positions")) && (
                            <th className="px-4 py-2 text-left">Acciones</th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {positions.map(position => (
                        <tr key={position.id} className="hover:bg-base-200">
                            <td className="border px-4 py-2 text-sm text-base-content truncate">
                                {position.name}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content truncate text-center">
                                {position.company_name || 'N/A'}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content text-center"> {/* Nuevo campo para nivel de jerarquía */}
                                {position.hierarchy_level}
                            </td>
                            <td className="border px-4 py-2 text-sm text-base-content text-center">
                                {position.employees_count ?? 0}
                            </td>
                            {(hasPermission("can_update_positions") || hasPermission("can_delete_positions")) && (
                                <td className="border px-4 py-2 text-sm text-base-content">
                                    <div className="flex justify-center space-x-2">
                                        {hasPermission("can_update_positions") && (
                                            <button
                                                onClick={() => handleEditClick(position)}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Editar
                                            </button>
                                        )}
                                        {hasPermission("can_delete_positions") && (
                                            <button
                                                onClick={() => handleDeleteClick(position)}
                                                className={`btn btn-error btn-sm text-base-100 ${loadingData === position.id ? 'loading' : ''}`}
                                                disabled={!!loadingData}
                                            >
                                                {loadingData === position.id ? '' : 'Eliminar'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
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
                            <b>{employeesCount}</b> empleados asociados a este puesto deberán ser reasignados a nuevas empresas y puestos.
                        </p>
                        <div className="modal-action justify-center">
                            <button
                                type="button"
                                className="btn-warning-mod"
                                onClick={() => confirmDeleteRef.current?.close()}
                                disabled={!!loadingDelete}
                            >
                                No, cancelar
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className={`btn-cancel ${loadingDelete ? 'loading' : ''}`}
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
