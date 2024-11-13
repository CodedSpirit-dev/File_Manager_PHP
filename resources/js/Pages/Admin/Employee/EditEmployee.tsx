// src/components/EditEmployee.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission, Company, Employee } from '@/types';

interface EditEmployeeProps {
    employee: Employee;
    positions: Position[];
    companies: Company[];
    permissions: Permission[];
    employeePermissions: Permission[];
    onClose: () => void;
    onSuccess: () => void;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
                                                       employee,
                                                       positions,
                                                       companies,
                                                       permissions,
                                                       employeePermissions,
                                                       onClose,
                                                       onSuccess,
                                                   }) => {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors, isValid },
        reset,
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            last_name_1: '',
            last_name_2: '',
            username: '',
            position_id: '',
            company_id: '',
            password: '',
            password_confirmation: '',
            enable_permissions: false,
            selected_permissions: [] as number[],
        },
    });

    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [step, setStep] = useState(1);
    const totalSteps = 2;
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const watchAllFields = watch();
    const watchEnablePermissions = watch('enable_permissions');
    const watchCompany = watch('company_id');

    // Categorías de Permisos
    const permissionCategories: { [key: string]: string[] } = {
        'Empresas': ['can_create_companies', 'can_delete_companies', 'can_update_companies'],
        'Puestos': ['can_create_positions', 'can_update_positions', 'can_delete_positions'],
        'Empleados': [
            'can_create_employees',
            'can_delete_employees',
            'can_update_employees',
            'can_view_company_employees',
            'can_view_all_employees',
        ],
        'Gestión de Archivos y Carpetas': [
            'can_view_file_explorer',
            'can_open_files',
            'can_upload_files_and_folders',
            'can_create_folders',
            'can_download_files_and_folders',
            'can_copy_files',
            'can_move_files',
            'can_rename_files_and_folders',
            'can_delete_files_and_folders',
        ],
    };

    // Agrupación de Permisos por Categoría
    const groupedPermissions = Object.keys(permissionCategories).map((category) => ({
        category,
        permissions: permissions.filter((permission) =>
            permissionCategories[category].includes(permission.name)
        ),
    }));

    // Inicializar Valores del Formulario
    useEffect(() => {
        const permissionIds = employeePermissions.map((permission: Permission) => permission.id);
        const defaultVals = {
            first_name: employee.first_name,
            last_name_1: employee.last_name_1,
            last_name_2: employee.last_name_2 || '',
            username: employee.username,
            position_id: employee.position_id ? employee.position_id.toString() : '',
            company_id: employee.company_id ? employee.company_id.toString() : '',
            password: '',
            password_confirmation: '',
            enable_permissions: permissionIds.length > 0,
            selected_permissions: permissionIds,
        };
        reset(defaultVals);

        // Filtrar posiciones basadas en la empresa seleccionada y establecer la posición del empleado
        const filteredPosition = positions.filter(position => position.company_id === Number(defaultVals.company_id));
        setFilteredPositions(filteredPosition);

        // Verificar si la posición actual del empleado está dentro de las posiciones filtradas
        if (defaultVals.position_id && filteredPosition.some(pos => pos.id.toString() === defaultVals.position_id)) {
            setValue('position_id', defaultVals.position_id);
        } else {
            setValue('position_id', '');
        }
    }, [employee, employeePermissions, positions, reset, setValue]);

    // Actualizar posiciones filtradas cuando cambia la compañía
    useEffect(() => {
        const companyId = Number(watchCompany);
        if (companyId) {
            const filtered = positions.filter(position => position.company_id === companyId);
            setFilteredPositions(filtered);
            setValue('position_id', '');
        } else {
            setFilteredPositions([]);
            setValue('position_id', '');
        }
    }, [watchCompany, positions, setValue]);

    const handlePermissionChange = (permissionId: number) => {
        const currentPermissions = getValues('selected_permissions') as number[];

        if (currentPermissions.includes(permissionId)) {
            setValue('selected_permissions', currentPermissions.filter(id => id !== permissionId));
        } else {
            setValue('selected_permissions', [...currentPermissions, permissionId]);
        }
    };

    const onSubmit = (data: any) => {
        const payload: any = {
            first_name: data.first_name,
            last_name_1: data.last_name_1,
            last_name_2: data.last_name_2,
            username: data.username,
            company_id: Number(data.company_id),
            position_id: Number(data.position_id),
        };

        if (data.password) {
            payload.password = data.password;
            payload.password_confirmation = data.password_confirmation;
        }

        axios.patch(`/admin/employees/${employee.id}`, payload)
            .then(response => {
                if (data.enable_permissions) {
                    axios.post('/api/userpermissions', {
                        employee_id: employee.id,
                        permissions: data.selected_permissions,
                    })
                        .then(() => {
                            setSuccessMessage('¡Empleado actualizado con éxito!');
                            reset();
                            setStep(1);
                            onSuccess(); // Notifica al componente padre
                        })
                        .catch(error => {
                            console.error('Error al asignar permisos', error);
                            setErrorMessage(error.response?.data?.message || 'Ocurrió un error al asignar permisos.');
                        });
                } else {
                    axios.delete(`/api/userpermissions/${employee.id}`)
                        .then(() => {
                            setSuccessMessage('¡Empleado actualizado con éxito!');
                            reset();
                            setStep(1);
                            onSuccess(); // Notifica al componente padre
                        })
                        .catch(error => {
                            console.error('Error al eliminar permisos', error);
                            setErrorMessage(error.response?.data?.message || 'Ocurrió un error al eliminar permisos.');
                        });
                }
            })
            .catch(error => {
                console.error('Error al actualizar el empleado', error);
                setErrorMessage(error.response?.data?.message || 'Ocurrió un error al actualizar el empleado.');
            });
    };

    return (
        <div>
            <h3 className="">Editar Usuario</h3>

            {/* Lista de pasos */}
            <ul className="steps w-full">
                <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Datos del Empleado</li>
                <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Permisos</li>
            </ul>

            <form className="form_data_entry" onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
                    <>
                        {/* Paso 1: Datos del Empleado */}
                        {/* Nombre(s) */}
                        <div className="mt-4">
                            <Controller
                                name="first_name"
                                control={control}
                                rules={{
                                    required: 'El nombre es obligatorio',
                                    maxLength: {
                                        value: 50,
                                        message: 'El nombre no debe exceder los 50 caracteres'
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

                        {/* Primer apellido */}
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

                        {/* Segundo apellido */}
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

                        {/* Empresa */}
                        <div className="mt-4">
                            <Controller
                                name="company_id"
                                control={control}
                                rules={{required: 'La empresa es obligatoria'}}
                                render={({field}) => (
                                    <select {...field} className="input__data__entry">
                                        <option value="">Seleccione una empresa</option>
                                        {companies.map(company => (
                                            <option key={company.id}
                                                    value={company.id.toString()}>{company.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.company_id && <p className="text-red-600">{errors.company_id.message}</p>}
                        </div>
                        {watchAllFields.company_id === '' && (
                            <p className="text-red-600">La empresa es obligatoria</p>
                        )}

                        {/* Puesto */}
                        <div className="mt-4">
                            <Controller
                                name="position_id"
                                control={control}
                                render={({ field }) => (
                                    <select {...field} className="input__data__entry" disabled={!watchCompany}>
                                        <option value="">Seleccione un puesto</option>
                                        {filteredPositions.map(position => (
                                            <option key={position.id} value={position.id.toString()}>{position.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.position_id && <p className="text-red-600">{errors.position_id.message}</p>}
                        </div>

                        {/* Contraseña (opcional) */}
                        <div className="mt-4">
                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    minLength: { value: 4, message: 'La contraseña debe tener al menos 4 caracteres' }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="password"
                                        className="input__data__entry"
                                        placeholder="Contraseña (dejar vacío si no desea cambiar)"
                                    />
                                )}
                            />
                            {errors.password && <p className="text-red-600">{errors.password.message}</p>}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="mt-4">
                            <Controller
                                name="password_confirmation"
                                control={control}
                                rules={{
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

                        {/* Botones para avanzar al siguiente paso */}
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
                        {/* Enable Permissions */}
                        <div className="mt-4">
                            <label htmlFor="enable_permissions" className="flex items-center">
                                <Controller
                                    name="enable_permissions"
                                    control={control}
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

                        {/* Permissions Selection */}
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
                        <div className="mt-4 flex justify-end">
                            <button type="button" className="btn btn-cancel" onClick={onClose}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-info-mod mx-2"
                                onClick={() => setStep(step - 1)}
                            >
                                Anterior
                            </button>
                            <button type="submit" className="btn btn-success">
                                Guardar
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
                            <button className="btn btn-primary" onClick={onSuccess}>Aceptar</button>
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
                            <button className="btn btn-error" onClick={() => setErrorMessage('')}>Cerrar</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );

};

export default EditEmployee;
