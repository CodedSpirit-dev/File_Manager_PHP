import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission, Company } from '@/types';


export default function CreateEmployee() {
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
    const [modalSuccess, setModalSuccess] = useState(false);
    const [modalError, setModalError] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 2;

    const watchAllFields = watch(); // Observa todos los campos para feedback en tiempo real
    const watchPassword = watch('password');
    const watchPasswordConfirmation = watch('password_confirmation');
    const watchEnablePermissions = watch('enable_permissions');

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
    }, [watchCompany, positions]);

    const handlePermissionChange = (permissionId: number) => {
        const currentPermissions = getValues('selected_permissions') as number[]; // Asegúrate de que sea un array de números

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
            axios.post('/admin/employees/store', data)
                .then(response => {
                    const employeeId = response.data.id;
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
                    console.error('Error al registrar el empleado', error);
                    setModalError(true);
                });
        }
    };

    return (
        <div className="container__25">
            <h1 className="text-2xl text-center font-bold my-4">Registro de nuevos empleados</h1>

            {/* Lista de pasos */}
            <ul className="steps w-full">
                <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Datos del empleado</li>
                <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Permisos</li>
            </ul>

            <form onSubmit={handleSubmit(onSubmit)}>
                {step === 1 && (
                    <>
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
                                }
                                }
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Nombre(s)"
                                    />
                                )}
                            />
                        </div>
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



                        <div className="mt-4">
                            <label>Primer apellido</label>
                            <Controller
                                name="last_name_1"
                                control={control}
                                rules={{ required: 'El primer apellido es obligatorio' }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Primer apellido"
                                    />
                                )}
                            />
                        </div>
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
                                {watchAllFields.last_name_1.match(/[^a-zA-ZÀ-ÿ\s]/) && (
                                    <p className="text-red-600">El primer apellido solo puede contener letras</p>
                                )}
                            </>
                        )}

                        <div className="mt-4">
                            <label>Segundo apellido</label>
                            <Controller
                                name="last_name_2"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Segundo apellido"
                                    />
                                )}
                            />
                        </div>
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
                                {watchAllFields.last_name_2.match(/[^a-zA-ZÀ-ÿ\s]/) && (
                                    <p className="text-red-600">El segundo apellido solo puede contener letras</p>
                                )}
                            </>
                        )}


                        <div className="mt-4">
                            <label>Nombre de usuario (CURP)</label>
                            <Controller
                                name="username"
                                control={control}
                                rules={{
                                    required: 'El nombre de usuario es obligatorio',
                                    maxLength: { value: 18, message: 'El nombre de usuario no debe exceder los 18 caracteres' }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="input__data__entry"
                                        placeholder="Nombre de usuario (CURP)"
                                    />
                                )}
                            />
                            {errors.username && <p className="text-red-600">{errors.username.message}</p>}
                        </div>

                        {watchAllFields.username && (
                            <>
                                {watchAllFields.username.length < 3 && (
                                    <p className="text-red-600">El primer apellido no debe tener menos de 3 caracteres</p>
                                )}
                                {watchAllFields.username.includes(' ') && (
                                    <p className="text-red-600">El primer apellido no debe tener espacios</p>
                                )}
                                {watchAllFields.username.length > 50 && (
                                    <p className="text-red-600">El primer apellido no debe exceder los 50 caracteres</p>
                                )}
                                {watchAllFields.username.match(/[^a-zA-Z0-9]/) && (
                                    <p className="text-red-600">El nombre de usuario apellido solo puede contener letras y numeros</p>
                                )}
                            </>
                        )}

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
                                            <option key={company.id} value={company.id}>{company.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>
                        {watchAllFields.company_id && (
                            <>
                                {watchAllFields.company_id === '' && <p className="text-red-600">El puesto es obligatorio</p>}
                            </>
                        )}

                        <div className="mt-4">
                            <label>Puesto</label>
                            <Controller
                                name="position_id"
                                control={control}
                                rules={{ required: 'El puesto es obligatorio' }}
                                render={({ field }) => (
                                    <select {...field} className="input__data__entry" disabled={watch('company_id') === ''}>
                                        <option value="">Seleccione un puesto</option>
                                        {filteredPositions.map(position => (
                                            <option key={position.id} value={position.id}>{position.name}</option>
                                        ))}
                                    </select>
                                )}
                            />
                        </div>
                        {watchAllFields.company_id === '' && <p className="text-red-600">Antes debes seleccionar una empresa</p>}

                        {watchAllFields.position_id && (
                            <>
                                {watchAllFields.position_id === '' && <p className="text-red-600">El puesto es obligatorio</p>}
                            </>
                        )}

                        <div className="mt-4">
                            <label>Contraseña</label>
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: 'La contraseña es obligatoria' }}
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
                            <label>Confirmar contraseña</label>
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
                        </div>

                        {/* Feedback en tiempo real sobre coincidencia de contraseñas */}
                        {watchPassword && watchPasswordConfirmation && watchPassword !== watchPasswordConfirmation && (
                            <p className="text-red-600">Las contraseñas no coinciden</p>
                        )}

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
                    <div className="mt-4">
                        <label htmlFor="enable_permissions">Habilitar permisos</label>
                        <Controller
                            name="enable_permissions"
                            control={control}
                            defaultValue={false} // Establece un valor inicial (booleano)
                            render={({ field }) => (
                                <input
                                    type="checkbox"
                                    className="ml-2 checkbox checkbox-primary"
                                    checked={field.value} // Controla el estado del checkbox
                                    onChange={(e) => field.onChange(e.target.checked)} // Actualiza el valor como booleano
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                    </div>



                    {watchEnablePermissions && (
                                <div className="mt-6">
                                    <label className="mb-3 text-xl text-center font-black block">Permisos</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissions.map(permission => (
                                            <label key={permission.id} className="flex items-center my-2">
                                                <input
                                                    type="checkbox"
                                                    checked={getValues('selected_permissions').includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)} // Cambia aquí
                                                    className="checkbox checkbox-primary mr-2"
                                                />
                                                <span>{permission.description}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}


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
                        <h3 className="font-bold text-lg">¡Empleado registrado con éxito!</h3>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => {setModalSuccess(false), setStep(1)}} >Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {modalError && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Error al registrar el empleado</h3>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setModalError(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
