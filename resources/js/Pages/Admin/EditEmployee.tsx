import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission, Company, Employee } from '@/types';

interface EditEmployeeProps {
    employee: Employee;
    positions: Position[];
    companies: Company[];
    onClose: () => void;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({ employee, positions, companies, onClose }) => {

    const { control, handleSubmit, setValue, watch, getValues, formState: { errors, isValid }, reset } = useForm({
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

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [modalSuccess, setModalSuccess] = useState(false);
    const [modalError, setModalError] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 2;

    const watchAllFields = watch();
    const watchPassword = watch('password');
    const watchPasswordConfirmation = watch('password_confirmation');
    const watchEnablePermissions = watch('enable_permissions');
    const watchCompany = watch('company_id');

    useEffect(() => {
        // Obtener todos los permisos disponibles
        axios.get('/api/permissions')
            .then(response => setPermissions(response.data))
            .catch(error => console.error('Error al cargar los permisos', error));

        // Obtener los permisos asignados al empleado
        axios.get(`/api/employees/${employee.id}/permissions`)
            .then(response => {
                const permissionIds = response.data.map((permission: Permission) => permission.id);
                const defaultVals = {
                    first_name: employee.first_name,
                    last_name_1: employee.last_name_1,
                    last_name_2: employee.last_name_2 || '',
                    username: employee.username,
                    position_id: employee.position_id.toString(),
                    company_id: employee.company_id ? employee.company_id.toString() : '',
                    password: '',
                    password_confirmation: '',
                    enable_permissions: permissionIds.length > 0,
                    selected_permissions: permissionIds,
                };
                reset(defaultVals);

                // Filtrar posiciones basadas en la empresa seleccionada
                const filteredPosition = positions.filter(position => position.company_id === Number(defaultVals.company_id));
                setFilteredPositions(filteredPosition);
            })
            .catch(error => console.error('Error al cargar los permisos del empleado', error));
    }, []);

    useEffect(() => {
        // Actualizar las posiciones filtradas cuando cambia la empresa
        const filteredPosition = positions.filter(position => position.company_id === Number(watchCompany));
        setFilteredPositions(filteredPosition);
        setValue('position_id', ''); // Reiniciar el puesto cuando cambia la empresa
    }, [watchCompany, positions]);

    const handlePermissionChange = (permissionId: number) => {
        const currentPermissions = getValues('selected_permissions') as number[];

        if (currentPermissions.includes(permissionId)) {
            setValue('selected_permissions', currentPermissions.filter(id => id !== permissionId));
        } else {
            setValue('selected_permissions', [...currentPermissions, permissionId]);
        }
    };

    const onSubmit = (data: any) => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            const payload = {
                ...data,
                position_id: data.position_id,
                company_id: data.company_id,
            };

            axios.patch(`/admin/employees/${employee.id}`, payload)
                .then(response => {
                    const employeeId = employee.id;

                    if (data.enable_permissions) {
                        axios.post('/api/userpermissions', {
                            employee_id: employeeId,
                            permissions: data.selected_permissions
                        })
                            .then(() => {
                                setModalSuccess(true);
                                reset();
                                setStep(1);
                            })
                            .catch(error => {
                                console.error('Error al asignar permisos', error);
                                setModalError(true);
                            });
                    } else {
                        setModalSuccess(true);
                        reset();
                        setStep(1);
                    }
                })
                .catch(error => {
                    console.error('Error al actualizar el empleado', error);
                    setModalError(true);
                });
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-5xl">
                <h1 className="text-2xl text-center font-bold my-4">Editar Empleado</h1>

                {/* Indicador de pasos */}
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Datos del empleado</li>
                    <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Permisos</li>
                </ul>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {step === 1 && (
                        <>
                            {/* Nombre(s) */}
                            <div className="mt-4">
                                <label>Nombre(s)</label>
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
                            </div>
                            {errors.first_name && <p className="text-red-600">{errors.first_name.message}</p>}
                            {watchAllFields.first_name && (
                                <>
                                    {watchAllFields.first_name.length < 3 && (
                                        <p className="text-red-600">El nombre no debe tener menos de 3 caracteres</p>
                                    )}
                                    {watchAllFields.first_name.length > 50 && (
                                        <p className="text-red-600">El nombre no debe exceder los 50 caracteres</p>
                                    )}
                                    {watchAllFields.first_name.match(/[^a-zA-ZÀ-ÿ\s]/) && (
                                        <p className="text-red-600">El nombre solo puede contener letras</p>
                                    )}
                                </>
                            )}

                            {/* Primer apellido */}
                            <div className="mt-4">
                                <label>Primer apellido</label>
                                <Controller
                                    name="last_name_1"
                                    control={control}
                                    rules={{
                                        required: 'El primer apellido es obligatorio',
                                        maxLength: {
                                            value: 50, message: 'El primer apellido no debe exceder los 50 caracteres'
                                        },
                                        pattern: {
                                            value: /^[a-zA-ZÀ-ÿ]+$/,
                                            message: 'El primer apellido solo puede contener letras sin espacios'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="input__data__entry"
                                            placeholder="Primer apellido"
                                        />
                                    )}
                                />
                            </div>
                            {errors.last_name_1 && <p className="text-red-600">{errors.last_name_1.message}</p>}
                            {watchAllFields.last_name_1 && (
                                <>
                                    {watchAllFields.last_name_1.length < 3 && (
                                        <p className="text-red-600">El primer apellido no debe tener menos de 3 caracteres</p>
                                    )}
                                    {watchAllFields.last_name_1.length > 50 && (
                                        <p className="text-red-600">El primer apellido no debe exceder los 50 caracteres</p>
                                    )}
                                    {watchAllFields.last_name_1.includes(' ') && (
                                        <p className="text-red-600">El primer apellido no debe tener espacios</p>
                                    )}
                                    {watchAllFields.last_name_1.match(/[^a-zA-ZÀ-ÿ]/) && (
                                        <p className="text-red-600">El primer apellido solo puede contener letras</p>
                                    )}
                                </>
                            )}

                            {/* Segundo apellido */}
                            <div className="mt-4">
                                <label>Segundo apellido</label>
                                <Controller
                                    name="last_name_2"
                                    control={control}
                                    rules={{
                                        maxLength: {
                                            value: 50, message: 'El segundo apellido no debe exceder los 50 caracteres'
                                        },
                                        pattern: {
                                            value: /^[a-zA-ZÀ-ÿ]*$/,
                                            message: 'El segundo apellido solo puede contener letras sin espacios'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="input__data__entry"
                                            placeholder="Segundo apellido"
                                        />
                                    )}
                                />
                            </div>
                            {errors.last_name_2 && <p className="text-red-600">{errors.last_name_2.message}</p>}
                            {watchAllFields.last_name_2 && (
                                <>
                                    {watchAllFields.last_name_2.length < 3 && (
                                        <p className="text-red-600">El segundo apellido no debe tener menos de 3 caracteres</p>
                                    )}
                                    {watchAllFields.last_name_2.length > 50 && (
                                        <p className="text-red-600">El segundo apellido no debe exceder los 50 caracteres</p>
                                    )}
                                    {watchAllFields.last_name_2.includes(' ') && (
                                        <p className="text-red-600">El segundo apellido no debe tener espacios</p>
                                    )}
                                    {watchAllFields.last_name_2.match(/[^a-zA-ZÀ-ÿ]/) && (
                                        <p className="text-red-600">El segundo apellido solo puede contener letras</p>
                                    )}
                                </>
                            )}

                            {/* Nombre de usuario */}
                            <div className="mt-4">
                                <label>Nombre de usuario (CURP)</label>
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{
                                        required: 'El nombre de usuario es obligatorio',
                                        maxLength: { value: 18, message: 'El nombre de usuario no debe exceder los 18 caracteres' },
                                        pattern: {
                                            value: /^[a-zA-Z0-9]+$/,
                                            message: 'El nombre de usuario solo puede contener letras y números sin espacios'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="input__data__entry"
                                            placeholder="Nombre de usuario (CURP)"
                                        />
                                    )}
                                />
                            </div>
                            {errors.username && <p className="text-red-600">{errors.username.message}</p>}
                            {watchAllFields.username && (
                                <>
                                    {watchAllFields.username.length < 3 && (
                                        <p className="text-red-600">El nombre de usuario no debe tener menos de 3 caracteres</p>
                                    )}
                                    {watchAllFields.username.length > 18 && (
                                        <p className="text-red-600">El nombre de usuario no debe exceder los 18 caracteres</p>
                                    )}
                                    {watchAllFields.username.includes(' ') && (
                                        <p className="text-red-600">El nombre de usuario no debe tener espacios</p>
                                    )}
                                    {watchAllFields.username.match(/[^a-zA-Z0-9]/) && (
                                        <p className="text-red-600">El nombre de usuario solo puede contener letras y números</p>
                                    )}
                                </>
                            )}

                            {/* Empresa */}
                            <div className="mt-4">
                                <label>Empresa</label>
                                <Controller
                                    name="company_id"
                                    control={control}
                                    rules={{ required: 'La empresa es obligatoria' }}
                                    render={({ field }) => (
                                        <select {...field} className="input__data__entry">
                                            <option value="">Seleccione una empresa</option>
                                            {companies.map(company => (
                                                <option key={company.id} value={company.id.toString()}>{company.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </div>
                            {errors.company_id && <p className="text-red-600">{errors.company_id.message}</p>}
                            {watchAllFields.company_id === '' && <p className="text-red-600">La empresa es obligatoria</p>}

                            {/* Puesto */}
                            <div className="mt-4">
                                <label>Puesto</label>
                                <Controller
                                    name="position_id"
                                    control={control}
                                    rules={{ required: 'El puesto es obligatorio' }}
                                    render={({ field }) => (
                                        <select {...field} className="input__data__entry" disabled={!watchCompany}>
                                            <option value="">Seleccione un puesto</option>
                                            {filteredPositions.map(position => (
                                                <option key={position.id} value={position.id.toString()}>{position.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </div>
                            {errors.position_id && <p className="text-red-600">{errors.position_id.message}</p>}
                            {watchAllFields.company_id === '' && <p className="text-red-600">Antes debes seleccionar una empresa</p>}
                            {watchAllFields.position_id === '' && <p className="text-red-600">El puesto es obligatorio</p>}

                            {/* Contraseña */}
                            <div className="mt-4">
                                <label>Contraseña (opcional)</label>
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
                            </div>
                            {errors.password && <p className="text-red-600">{errors.password.message}</p>}

                            <div className="mt-4">
                                <label>Confirmar contraseña</label>
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
                            </div>
                            {errors.password_confirmation && <p className="text-red-600">{errors.password_confirmation.message}</p>}
                            {watchPassword && watchPasswordConfirmation && watchPassword !== watchPasswordConfirmation && (
                                <p className="text-red-600">Las contraseñas no coinciden</p>
                            )}

                            {/* Botones de navegación */}
                            <div className="mt-4 flex justify-end">
                                <button type="button" className="btn btn-block" onClick={() => setStep(step + 1)} disabled={!isValid}>
                                    Siguiente
                                </button>
                            </div>
                            {!isValid && <p className="text-red-600">Todos los campos son obligatorios</p>}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Habilitar permisos */}
                            <div className="mt-4">
                                <label htmlFor="enable_permissions">Habilitar permisos</label>
                                <Controller
                                    name="enable_permissions"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            className="ml-2 checkbox checkbox-primary"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    )}
                                />
                            </div>

                            {/* Selección de permisos */}
                            {watchEnablePermissions && (
                                <div className="mt-6">
                                    <label className="mb-3 text-xl text-center font-black block">Permisos</label>
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
                            )}

                            {/* Botones de navegación */}
                            <div className="mt-4 flex justify-center">
                                <button type="button" className="btn size-2/4 mr-1" onClick={() => setStep(step - 1)}>
                                    Anterior
                                </button>
                                <button type="submit" className="btn size-2/4 ml-1">
                                    Guardar
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {/* Modal de éxito */}
                {modalSuccess && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">¡Empleado actualizado con éxito!</h3>
                            <div className="modal-action">
                                <button className="btn btn-primary" onClick={() => { setModalSuccess(false); onClose(); }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de error */}
                {modalError && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">Error al actualizar el empleado</h3>
                            <div className="modal-action">
                                <button className="btn btn-primary" onClick={() => setModalError(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón de cerrar */}
                <div className="modal-action">
                    <button className="btn btn-error" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default EditEmployee;
