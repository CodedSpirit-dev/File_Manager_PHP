// src/components/EditEmployee.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Company, Employee } from '@/types';

interface EditEmployeeProps {
    employee: Employee;
    positions: Position[];
    companies: Company[];
    onClose: () => void;
    onSuccess: () => void;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
                                                       employee,
                                                       positions,
                                                       companies,
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
            phone_number: '', // Nuevo campo de teléfono
            position_id: '',
            company_id: '',
            password: '',
            password_confirmation: '',
        },
    });

    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const watchAllFields = watch();
    const watchCompany = watch('company_id');

    // Inicializar Valores del Formulario
    useEffect(() => {
        const defaultVals = {
            first_name: employee.first_name,
            last_name_1: employee.last_name_1,
            last_name_2: employee.last_name_2 || '',
            username: employee.username,
            phone_number: employee.phone_number || '', // Incluir número de teléfono
            position_id: employee.position_id ? employee.position_id.toString() : '',
            company_id: employee.company_id ? employee.company_id.toString() : '',
            password: '',
            password_confirmation: '',
        };
        reset(defaultVals);

        // Filtrar posiciones basadas en la empresa seleccionada y establecer la posición del empleado
        const filteredPosition = positions.filter(
            (position) => position.company_id === Number(defaultVals.company_id)
        );
        setFilteredPositions(filteredPosition);

        // Verificar si la posición actual del empleado está dentro de las posiciones filtradas
        if (defaultVals.position_id && filteredPosition.some(pos => pos.id.toString() === defaultVals.position_id)) {
            setValue('position_id', defaultVals.position_id);
        } else {
            setValue('position_id', '');
        }
    }, [employee, positions, reset, setValue]);

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

    const onSubmit = (data: any) => {
        const payload: any = {
            first_name: data.first_name,
            last_name_1: data.last_name_1,
            last_name_2: data.last_name_2,
            phone_number: data.phone_number, // Incluir número de teléfono
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
                setSuccessMessage('¡Empleado actualizado con éxito!');
                reset({
                    ...data,
                    password: '',
                    password_confirmation: '',
                });
                onSuccess(); // Notifica al componente padre
            })
            .catch(error => {
                console.error('Error al actualizar el empleado', error);
                setErrorMessage(error.response?.data?.message || 'Ocurrió un error al actualizar el empleado.');
            });
    };

    return (
        <div className="mt-3">
            <h3 className="">Editar Usuario</h3>

            {/* Lista de pasos */}
            <ul className="steps w-full">
                <li className="step step-primary">Datos del Empleado</li>
            </ul>

            <form className="form_data_entry" onSubmit={handleSubmit(onSubmit)}>
                {/* Paso Único: Datos del Empleado */}
                <div>
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
                                    message: 'El segundo apellido solo puede contener letras y espacios'
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

                    {/* Correo Electrónico */}
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

                    {/* Nuevo Campo: Número de Teléfono */}
                    <div className="mt-4">
                        <Controller
                            name="phone_number"
                            control={control}
                            rules={{
                                required: 'El número de teléfono es obligatorio',
                                maxLength: {
                                    value: 15,
                                    message: 'El número de teléfono no debe exceder los 15 caracteres'
                                },
                                pattern: {
                                    value: /^[0-9+\-()\s]+$/,
                                    message: 'El número de teléfono contiene caracteres inválidos'
                                }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    className="input__data__entry"
                                    placeholder="Número de teléfono"
                                />
                            )}
                        />
                        {errors.phone_number && <p className="text-red-600">{errors.phone_number.message}</p>}
                    </div>
                    {/* Fin del Nuevo Campo */}

                    {/* Empresa */}
                    <div className="mt-4">
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
                        {errors.position_id && <p className="text-red-600">{errors.position_id.message}</p>}
                    </div>
                    {watchAllFields.company_id === '' && (
                        <p className="text-red-600">Antes debes seleccionar una empresa</p>
                    )}

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

                    {/* Botones para el formulario */}
                    <div className="mt-4 flex justify-end">
                        {/* Botón de cerrar */}
                        <button type="button" className="btn btn-cancel" onClick={onClose}>Cancelar</button>
                        <button
                            type="submit"
                            className="btn btn-accept ml-2"
                            disabled={!isValid}
                        >
                            Guardar
                        </button>
                    </div>
                    {!isValid && <p className="text-red-600">Todos los campos son obligatorios</p>}
                </div>
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
