// src/Pages/Admin/Position/EditPosition.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission } from "@/types";

interface EditPositionProps {
    position: Position;
    onClose: (wasEdited: boolean) => void;
}

const EditPosition: React.FC<EditPositionProps> = ({ position, onClose }) => {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: position.name
        }
    });

    const [step, setStep] = useState(1);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(position.permissions ? position.permissions.map(p => p.id) : []);

    // Cargar permisos al iniciar
    useEffect(() => {
        axios.get('/api/permissions')
            .then(response => setAvailablePermissions(response.data))
            .catch(() => setErrorMessage('Error al cargar los permisos disponibles.'));
    }, []);

    // Agrupación de permisos por categoría
    const permissionCategories: { [key: string]: string[] } = {
        'Empresas': ['can_create_companies', 'can_delete_companies', 'can_update_companies'],
        'Puestos': ['can_create_positions', 'can_update_positions', 'can_delete_positions'],
        'Usuarios': [
            'can_create_users', 'can_delete_users', 'can_update_users',
            'can_view_company_users', 'can_view_all_users'
        ],
        'Gestión de Archivos y Carpetas': [
            'can_view_file_explorer', 'can_open_files', 'can_upload_files_and_folders',
            'can_create_folders', 'can_download_files_and_folders', 'can_copy_files',
            'can_move_files', 'can_rename_files_and_folders', 'can_delete_files_and_folders'
        ]
    };

    const groupedPermissions = Object.keys(permissionCategories).map(category => ({
        category,
        permissions: availablePermissions.filter(permission =>
            permissionCategories[category].includes(permission.name)
        )
    }));

    const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
        );
    };

    // Realizar la operación de guardar cambios de nombre y permisos al final
    const handleFinalSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            // Actualizar el nombre de la posición
            await axios.patch(`/api/positions/${position.id}`, { name: data.name });

            if (selectedPermissions.length > 0) {
                // Si hay permisos seleccionados, hacer la asignación de permisos
                await axios.post('/api/positionpermissions', {
                    position_id: position.id,
                    permissions: selectedPermissions
                });
            } else {
                // Si no hay permisos seleccionados, eliminar todos los permisos asignados previamente
                await axios.delete(`/api/positionpermissions/${position.id}`);
            }

            setSuccessMessage('Puesto y permisos actualizados exitosamente.');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setErrorMessage(error.response?.data?.message || 'Hubo un error al actualizar el puesto y los permisos.');
            } else {
                setErrorMessage('Hubo un error al actualizar el puesto y los permisos.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Cierra el modal de éxito y hace el "fetch" de nuevo al componente padre
    const handleCloseSuccessModal = () => {
        setSuccessMessage('');
        onClose(true); // Notifica al componente padre para hacer el fetch
    };

    return (
        <div className={'modal-box'}>
            {/* Barra de pasos */}
            <ul className="steps w-full">
                <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Editar Puesto</li>
                <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Asignar Permisos</li>
            </ul>

            <form onSubmit={handleSubmit(handleFinalSubmit)}>
                {step === 1 && (
                    <>
                        {/* Paso 1: Edición del nombre del puesto */}
                        <h1 className="text-2xl text-center font-bold my-4">Editar Puesto</h1>
                        <div className="mt-4">
                            <label htmlFor="name">
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{
                                        required: 'El nombre del puesto es obligatorio',
                                        minLength: {
                                            value: 3,
                                            message: 'El nombre debe tener al menos 3 caracteres'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            placeholder="Nombre del puesto"
                                            id="name"
                                            className="input__data__entry w-full"
                                        />
                                    )}
                                />
                                {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                            </label>
                        </div>
                        <div className="mt-6 flex items-center">
                            <button type="button" className="btn-warning-mod mx-2" onClick={() => onClose(false)}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-accept mx-2"
                                onClick={() => setStep(2)}
                                disabled={!isValid}
                            >
                                Siguiente
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        {/* Paso 2: Asignación de permisos agrupados por categoría */}
                        <h2 className="mb-3 text-xl text-center font-bold">Asignar Permisos al Puesto</h2>
                        <div className="overflow-y-auto max-h-80">
                            {groupedPermissions.map(({category, permissions}) => (
                                <div key={category} className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">{category}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissions.map(permission => (
                                            <label key={permission.id} className="flex items-center my-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)}
                                                    className="checkbox checkbox-primary mr-2"
                                                />
                                                <span>{permission.description}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex">
                            <button type="button" className="btn-warning-mod mx-2" onClick={() => setStep(1)}>
                                Anterior
                            </button>
                            <button type="submit" className="btn-accept mx-2" disabled={loading}>
                                {loading ? <span className="loading loading-spinner"></span> : 'Guardar'}
                            </button>
                        </div>
                    </>
                )}
            </form>

            {/* Modal de Éxito */}
            {successMessage && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Acción Exitosa</h3>
                        <p className="py-4">{successMessage}</p>
                        <div className="modal-action">
                            <button className="btn-accept" onClick={handleCloseSuccessModal}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal de Error */}
            {errorMessage && (
                <dialog open className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-error">Error</h3>
                        <p className="py-4">{errorMessage}</p>
                        <div className="modal-action">
                            <button className="btn-accept" onClick={() => setErrorMessage('')}>Cerrar</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
};

export default EditPosition;
