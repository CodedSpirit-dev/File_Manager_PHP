// src/components/CreateEmployee.tsx

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission, Company } from '@/types';

interface CreateEmployeeProps {
    onSuccess: () => void; // Callback para notificar al padre
    onClose: () => void;   // Callback para cerrar el modal desde el padre
}

export default function CreateEmployee({ onSuccess, onClose }: CreateEmployeeProps) {
    const { control, handleSubmit, setValue, watch, getValues, formState: { errors, isValid }, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            last_name_1: '',
            last_name_2: '',
            username: '',
            password: '',
            password_confirmation: '',
            company_id: '',
            position_id: '',
            enable_permissions: false,
            selected_permissions: [] as number[]
        }
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [modalError, setModalError] = useState(false);
    const [modalSuccess, setModalSuccess] = useState(false); // Estado para el modal de éxito
    const [step, setStep] = useState(1);
    const totalSteps = 2;
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);


    const watchAllFields = watch();
    const watchPassword = watch('password');
    const watchPasswordConfirmation = watch('password_confirmation');
    const watchEnablePermissions = watch('enable_permissions');
    const confirmModalRef = useRef<HTMLDialogElement>(null);
    const successModalRef = useRef<HTMLDialogElement>(null);
    const errorModalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        axios.get('api/positions')
            .then(response => setPositions(response.data))
            .catch(error => console.error('Error al cargar los puestos', error));

        axios.get('api/permissions')
            .then(response => setPermissions(response.data))
            .catch(error => console.error('Error al cargar los permisos', error));

        axios.get('admin/companies')
            .then(response => setCompanies(response.data))
            .catch(error => console.error('Error al cargar las empresas', error));
    }, []);

    const watchCompany = watch('company_id');

    useEffect(() => {
        const filteredPosition = positions.filter(position => position.company_id === Number(watchCompany));
        setFilteredPositions(filteredPosition);
        setValue('position_id', '');
    }, [watchCompany, positions, setValue]);

    const handlePermissionChange = (permissionId: number) => {
        const currentPermissions = getValues('selected_permissions') as number[];

        if (currentPermissions.includes(permissionId)) {
            setValue('selected_permissions', currentPermissions.filter(id => id !== permissionId));
        } else {
            setValue('selected_permissions', [...currentPermissions, permissionId]);
        }
    };

    const handleOpenConfirmModal = () => {
        confirmModalRef.current?.showModal();
    };

    const handleCloseConfirmModal = () => {
        confirmModalRef.current?.close();
    };

    const handleOpenSuccessModal = () => {
        successModalRef.current?.showModal();
    };

    const handleCloseSuccessModal = () => {
        successModalRef.current?.close();
        onSuccess(); // Llama a onSuccess para notificar al padre que el registro fue exitoso
    };

    const handleOpenErrorModal = () => {
        errorModalRef.current?.showModal();
    };

    const handleCloseErrorModal = () => {
        errorModalRef.current?.close();
    };

    const onSubmit = (data: any) => {
        // Preparar el payload para crear al empleado (excluyendo permisos)
        const employeePayload = {
            first_name: data.first_name,
            last_name_1: data.last_name_1,
            last_name_2: data.last_name_2,
            username: data.username,
            password: data.password,
            password_confirmation: data.password_confirmation,
            company_id: Number(data.company_id),
            position_id: Number(data.position_id),
        };

        axios.post('/admin/employees', employeePayload)
            .then(response => {
                const newEmployee = response.data; // Asegúrate de que el backend devuelve el empleado creado con su ID

                if (data.enable_permissions && data.selected_permissions.length > 0) {
                    // Asignar permisos al nuevo empleado
                    axios.post('/api/userpermissions', {
                        employee_id: newEmployee.id,
                        permissions: data.selected_permissions,
                    })
                        .then(() => {
                            setSuccessMessage('¡Usuario registrado con éxito y permisos asignados!');
                            reset();
                            setStep(1);
                            handleCloseConfirmModal();
                            handleOpenSuccessModal();
                        })
                        .catch(error => {
                            console.error('Error al asignar permisos', error);
                            setErrorMessage(error.response?.data?.message || 'Ocurrió un error al asignar permisos.');
                            handleCloseConfirmModal();
                            handleOpenErrorModal();
                        });
                } else {
                    // Si no se habilitan permisos, simplemente mostrar éxito
                    setSuccessMessage('¡Usuario registrado con éxito!');
                    reset();
                    setStep(1);
                    handleCloseConfirmModal();
                    handleOpenSuccessModal();
                }
            })
            .catch(error => {
                console.error('Error al registrar el usuario', error);
                setErrorMessage(error.response?.data?.message || 'Ocurrió un error al registrar el usuario.');
                handleCloseConfirmModal();
                handleOpenErrorModal();
            });
    };


    // Define las categorías y los permisos asociados
    const permissionCategories: { [key: string]: string[] } = {
        'Empresas': ['can_create_companies', 'can_delete_companies', 'can_update_companies'],
        'Puestos': ['can_create_positions', 'can_update_positions', 'can_delete_positions'],
        'Empleados': ['can_create_employees', 'can_delete_employees', 'can_update_employees', 'can_view_company_employees', 'can_view_all_employees'],
        'Gestión de Archivos y Carpetas': [
            'can_view_file_explorer',
            'can_open_files',
            'can_upload_files_and_folders',
            'can_create_folders',
            'can_download_files_and_folders',
            'can_copy_files',
            'can_move_files',
            'can_rename_files_and_folders',
            'can_delete_files_and_folders'
        ]
    };

    // Agrupa los permisos por categoría
    const groupedPermissions = Object.keys(permissionCategories).map(category => ({
        category,
        permissions: permissions.filter(permission => permissionCategories[category].includes(permission.name))
    }));

    return (
        <div className={'mt-3'}>
            <h3 className="">Registro de nuevos usuarios</h3>

            {/* Lista de pasos */}
            <ul className="steps w-full">
                <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Datos del Usuario</li>
                <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Permisos</li>
            </ul>

            <form className={'form_data_entry'} onSubmit={handleSubmit(handleOpenConfirmModal)}>
                {step === 1 && (
                    <>
                        {/* Paso 1: Datos del Usuario */}
                        <div className="mt-4">
                            <Controller
                                name="first_name"
                                control={control}
                                rules={{
                                    required: 'El nombre es obligatorio',
                                    maxLength: {
                                        value: 50, message: 'El nombre no debe exceder los 50 caracteres'
                                    },
                                    pattern: {
                                        value: /^[a-zA-ZÀ-ÿ\s]+$/,
                                        message: 'El nombre solo puede contener letras'
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Nombre(s)"
                                    />
                                )}
                            />
                            {errors.first_name && <p className="text-red-600">{errors.first_name.message}</p>}
                        </div>

                        <div className="mt-4">
                            <Controller
                                name="last_name_1"
                                control={control}
                                rules={{
                                    required: 'El primer apellido es obligatorio',
                                    minLength: {
                                        value: 3,
                                        message: 'El primer apellido debe tener al menos 3 caracteres'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'El primer apellido no debe exceder los 50 caracteres'
                                    },
                                    pattern: {
                                        value: /^[a-zA-ZÀ-ÿ\s]+$/,
                                        message: 'El primer apellido solo puede contener letras y espacios'
                                    },
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Primer apellido"
                                    />
                                )}
                            />
                            {errors.last_name_1 && <p className="text-red-600">{errors.last_name_1.message}</p>}
                        </div>

                        <div className="mt-4">
                            <Controller
                                name="last_name_2"
                                control={control}
                                rules={{
                                    minLength: {
                                        value: 3,
                                        message: 'El segundo apellido debe tener al menos 3 caracteres'
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: 'El segundo apellido no debe exceder los 50 caracteres'
                                    },
                                    pattern: {
                                        value: /^[a-zA-ZÀ-ÿ\s]+$/,
                                        message: 'El primer apellido solo puede contener letras y espacios'
                                    },
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Segundo apellido"
                                    />
                                )}
                            />
                            {errors.last_name_2 && <p className="text-red-600">{errors.last_name_2.message}</p>}
                        </div>

                        <div className="mt-4">
                            <Controller
                                name="username"
                                control={control}
                                rules={{
                                    required: 'El nombre de usuario es obligatorio',
                                    maxLength: {
                                        value: 50,
                                        message: 'El nombre de usuario no debe exceder los 50 caracteres'
                                    },
                                    pattern: {
                                        value: /^\S+@\S+\.\S+$/,
                                        message: 'El nombre de usuario debe ser un email válido'
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="email" // Cambiado a tipo email para mejor UX
                                        className="input__data__entry"
                                        placeholder="Nombre de usuario (Email)"
                                    />
                                )}
                            />
                            {errors.username && <p className="text-red-600">{errors.username.message}</p>}
                        </div>

                        <div className="mt-4">
                            <Controller
                                name="company_id"
                                control={control}
                                rules={{ required: 'La empresa es obligatoria' }}
                                render={({ field }) => (
                                    <select {...field} className="input__data__entry">
                                        <option value="">Seleccione una empresa</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>{company.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.company_id && <p className="text-red-600">{errors.company_id.message}</p>}
                        </div>
                        {watchAllFields.company_id && (
                            <>
                                {watchAllFields.company_id === '' &&
                                    <p className="text-red-600">La empresa es obligatoria</p>}
                            </>
                        )}

                        <div className="mt-4">
                            <Controller
                                name="position_id"
                                control={control}
                                rules={{ required: 'El puesto es obligatorio' }}
                                render={({ field }) => (
                                    <select {...field} className="input__data__entry"
                                            disabled={watch('company_id') === ''}>
                                        <option value="">Seleccione un puesto</option>
                                        {filteredPositions.map(position => (
                                            <option key={position.id} value={position.id}>{position.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.position_id && <p className="text-red-600">{errors.position_id.message}</p>}
                        </div>
                        {watchAllFields.company_id === '' &&
                            <p className="text-red-600">Antes debes seleccionar una empresa</p>}

                        <div className="mt-4">
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'La contraseña es obligatoria',
                                    minLength: {
                                        value: 6,
                                        message: 'La contraseña debe tener al menos 6 caracteres'
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="password"
                                        className="input__data__entry"
                                        placeholder="Contraseña"
                                    />
                                )}
                            />
                            {errors.password && <p className="text-red-600">{errors.password.message}</p>}
                        </div>

                        <div className="mt-4">
                            <Controller
                                name="password_confirmation"
                                control={control}
                                rules={{
                                    required: 'Debe confirmar la contraseña',
                                    validate: value =>
                                        value === getValues('password') || 'Las contraseñas no coinciden'
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="password"
                                        className="input__data__entry"
                                        placeholder="Confirmar contraseña"
                                    />
                                )}
                            />
                            {errors.password_confirmation && <p className="text-red-600">{errors.password_confirmation.message}</p>}
                        </div>

                        {/* Botón para avanzar al siguiente paso */}
                        <div className="mt-4 flex justify-end">
                            {/* Botón de cerrar */}
                            <button type="button" className="btn btn-cancel" onClick={onClose}>Cancelar</button>
                            <button
                                type="button"
                                className="btn btn-accept ml-2"
                                onClick={() => setStep(step + 1)}
                                disabled={!isValid}
                            >
                                Siguiente
                            </button>
                        </div>
                        {!isValid && <p className="text-red-600">Todos los campos son obligatorios</p>}
                    </>
                )}

                {step === 2 && (
                    <>
                        {/* Paso 2: Permisos */}
                        <div className="mt-4">
                            <label htmlFor="enable_permissions" className="flex items-center">
                                <Controller
                                    name="enable_permissions"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            id="enable_permissions"
                                        />
                                    )}
                                />
                                <span className="ml-2">Habilitar permisos</span>
                            </label>
                        </div>

                        {watchEnablePermissions && (
                            <div className="mt-6">
                                <h2 className="mb-3 text-xl text-center font-bold">Permisos</h2>
                                {groupedPermissions.map(({ category, permissions }) => (
                                    <div key={category} className="mb-4">
                                        <h3 className="text-lg font-semibold mb-2">{category}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {permissions.map(permission => (
                                                <label key={permission.id} className="flex items-center my-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={getValues('selected_permissions').includes(permission.id)}
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
                        )}

                        {/* Botones para navegar entre pasos */}
                        <div className="mt-4 flex justify-center">
                            <button type="button" className="btn btn-cancel" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="button" className="btn-info-mod mx-2" onClick={() => setStep(step - 1)}>
                                Anterior
                            </button>
                            <button type="submit" className="btn btn-success">
                                Guardar
                            </button>
                        </div>
                    </>
                )}
            </form>

            {/* Modal de Confirmación */}
            <dialog ref={confirmModalRef} id="modal_employee_confirm" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">
                        ¿Estás seguro de registrar al
                        usuario <b>{getValues('first_name')} {getValues('last_name_1')}</b>?
                    </h4>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn-cancel" onClick={handleCloseConfirmModal}>No, cancelar</button>
                        <button type="button" className="btn-accept" onClick={handleSubmit(onSubmit)}>Sí, registrar usuario</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Éxito */}
            <dialog ref={successModalRef} id="modal_employee_success" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-center">Registro de Usuario</h3>
                    <p className="text-center text-success">{successMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-info" onClick={handleCloseSuccessModal}>Aceptar
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error */}
            <dialog ref={errorModalRef} id="modal_employee_error" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">Error al Registrar Usuario</h4>
                    <p className="text-center text-error">{errorMessage}</p>
                    <div className="modal-action justify-center">
                        <button className="btn-accept" onClick={handleCloseErrorModal}>Cerrar</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};
