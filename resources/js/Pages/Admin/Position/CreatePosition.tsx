import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useForm, Controller } from 'react-hook-form';
import { Company, HierarchyLevel, Permission } from "@/types";
import {useAuth} from "@/contexts/AuthProvider";

interface CreatePositionProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePosition({ onClose, onSuccess }: CreatePositionProps) {
    const { hierarchyLevel } = useAuth();
    const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            company_id: '',
            hierarchy_level: ''
        }
    });

    const [step, setStep] = useState(1);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Refs para modales
    const successModalRef = useRef<HTMLDialogElement | null>(null);
    const errorModalRef = useRef<HTMLDialogElement | null>(null);
    const confirmModalRef = useRef<HTMLDialogElement | null>(null);


// Cargar empresas, niveles jerárquicos y permisos
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('/admin/companies');
                setCompanies(response.data);
            } catch (error) {
                console.error('Error al cargar las empresas', error);
            }
        };

        const fetchHierarchyLevels = async () => {
            try {
                const response = await axios.get('/api/hierarchylevels');
                const filteredLevels = response.data.filter((level: HierarchyLevel) =>
                    hierarchyLevel !== null && (hierarchyLevel === 0 || level.level > hierarchyLevel)
                );
                setHierarchyLevels(filteredLevels);
            } catch (error) {
                console.error('Error al cargar los niveles jerárquicos', error);
            }
        };

        const fetchPermissions = async () => {
            try {
                const response = await axios.get('/api/permissions');
                setAvailablePermissions(response.data);
            } catch {
                setErrorMessage('Error al cargar los permisos disponibles.');
            }
        };

        fetchCompanies();
        fetchHierarchyLevels();
        fetchPermissions();
    }, [hierarchyLevel]);

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

    // Función de envío del formulario
    const onSubmit = async (data: { name: string; company_id: string; hierarchy_level: string }) => {
        setLoading(true);
        try {
            const positionResponse = await axios.post('/admin/positions', data);
            const newPositionId = positionResponse.data.id;

            if (newPositionId && selectedPermissions.length > 0) {
                await axios.post('/api/positionpermissions', {
                    position_id: newPositionId,
                    permissions: selectedPermissions,
                });
            }

            setSuccessMessage('El puesto ha sido registrado exitosamente.');
            reset();
            successModalRef.current?.showModal();
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Hubo un error al registrar el puesto.');
            errorModalRef.current?.showModal();
        } finally {
            setLoading(false);
        }
    };

    // Cerrar modal de éxito y notificar al componente padre
    const handleCloseSuccessModal = () => {
        successModalRef.current?.close();
        onSuccess(); // Ejecuta la función onSuccess solo al cerrar el modal de éxito
        onClose();
    };

    return (
        <>
            <div className="modal-box">
                {/* Barra de pasos */}
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Información Básica</li>
                    <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Asignar Permisos</li>
                </ul>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <>
                            <h1 className="text-2xl text-center font-bold my-4">Registro de Nuevo Puesto</h1>

                            {/* Selección de empresa */}
                            <div>
                                <label className="input__data__entry mt-4" htmlFor="company_id">
                                    <Controller
                                        name="company_id"
                                        control={control}
                                        rules={{required: 'La empresa es obligatoria'}}
                                        render={({field}) => (
                                            <select {...field} id="company_id"
                                                    className="select select-bordered w-full">
                                                <option value="">Seleccione una empresa</option>
                                                {companies.map((company) => (
                                                    <option key={company.id} value={company.id}>
                                                        {company.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.company_id &&
                                        <p className="text-red-600 text-sm mt-1">{errors.company_id.message}</p>}
                                </label>
                            </div>

                            {/* Selección de nivel jerárquico */}
                            <div className="mt-4">
                                <label htmlFor="hierarchy_level">
                                    <Controller
                                        name="hierarchy_level"
                                        control={control}
                                        rules={{required: 'El nivel jerárquico es obligatorio'}}
                                        render={({field}) => (
                                            <select {...field} id="hierarchy_level"
                                                    className="select select-bordered w-full">
                                                <option value="">Seleccione un nivel jerárquico</option>
                                                {hierarchyLevels.map((hierarchy) => (
                                                    <option key={hierarchy.level} value={hierarchy.level}>
                                                        {hierarchy.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.hierarchy_level &&
                                        <p className="text-red-600 text-sm mt-1">{errors.hierarchy_level.message}</p>}
                                </label>
                            </div>


                            {/* Nombre del puesto */}
                            <div className="mt-4">
                                <label className="input__data__entry" htmlFor="name">
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
                                        render={({field}) => (
                                            <input
                                                {...field}
                                                placeholder="Nombre del puesto"
                                                id="name"
                                                className="input input-bordered w-full"
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                                </label>
                            </div>

                            {/* Botones de acción */}
                            <div className="mt-6 flex items-center">
                                <button type="button" className="btn-warning-mod mx-2" onClick={onClose}>Cancelar
                                </button>
                                <button type="button" className="btn-accept mx-2" onClick={() => setStep(2)}
                                        disabled={!isValid}>
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="mb-3 text-xl text-center font-bold">Asignar Permisos</h2>
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
                <dialog ref={successModalRef} className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-center">Éxito</h3>
                        <p className="py-4 text-center text-green-600">{successMessage}</p>
                        <div className="modal-action justify-center">
                            <button type="button" className="btn btn-primary" onClick={handleCloseSuccessModal}>
                                Aceptar
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </>
    );
}
