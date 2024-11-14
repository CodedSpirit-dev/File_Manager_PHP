// src/components/CreateEmployee.tsx

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Company } from '@/types';

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
            phone_number: '', // Nuevo campo de teléfono
            password: '',
            password_confirmation: '',
            company_id: '',
            position_id: '',
        }
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const watchAllFields = watch();
    const confirmModalRef = useRef<HTMLDialogElement>(null);
    const successModalRef = useRef<HTMLDialogElement>(null);
    const errorModalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        axios.get('api/positions')
            .then(response => setPositions(response.data))
            .catch(error => console.error('Error al cargar los puestos', error));

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
        // Preparar el payload para crear al empleado
        const employeePayload = {
            first_name: data.first_name,
            last_name_1: data.last_name_1,
            last_name_2: data.last_name_2,
            phone_number: data.phone_number, // Incluir número de teléfono
            username: data.username,
            password: data.password,
            password_confirmation: data.password_confirmation,
            company_id: Number(data.company_id),
            position_id: Number(data.position_id),
        };

        axios.post('/admin/employees', employeePayload)
            .then(response => {
                setSuccessMessage('¡Usuario registrado con éxito!');
                reset();
                handleCloseConfirmModal();
                handleOpenSuccessModal();
            })
            .catch(error => {
                console.error('Error al registrar el usuario', error);
                setErrorMessage(error.response?.data?.message || 'Ocurrió un error al registrar el usuario.');
                handleCloseConfirmModal();
                handleOpenErrorModal();
            });
    };

    return (
        <div className={'mt-3'}>
            <h3 className="">Registro de nuevos usuarios</h3>

            {/* Lista de pasos */}
            <ul className="steps w-full">
                <li className={`step step-primary`}>Datos del Usuario</li>
            </ul>

            <form className={'form_data_entry'} onSubmit={handleSubmit(handleOpenConfirmModal)}>
                {/* Paso Único: Datos del Usuario */}
                <div>
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
