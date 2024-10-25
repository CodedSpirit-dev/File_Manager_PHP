import { Head, useForm } from '@inertiajs/react';
import { Position } from '@/types';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Permission {
    id: number;
    permission_description: string;
}

interface CreateEmployeeProps {}

export default function CreateEmployee({}: CreateEmployeeProps) {
    const { data, setData, post, processing, reset } = useForm<{
        first_name: string;
        last_name_1: string;
        last_name_2: string;
        username: string;
        password: string;
        password_confirmation: string;
        position_id: string;
        enable_permissions: boolean;
        selected_permissions: number[]; // Para almacenar los IDs de permisos seleccionados
    }>({
        first_name: '',
        last_name_1: '',
        last_name_2: '',
        username: '',
        password: '',
        password_confirmation: '',
        position_id: '',
        enable_permissions: false,
        selected_permissions: [] // Iniciar como un array vacío
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]); // Estado para almacenar los permisos

    const [modalSuccess, setModalSuccess] = useState(false);
    const [modalError, setModalError] = useState(false);

    const [step, setStep] = useState(1);
    const totalSteps = 2;

    // Obtener los puestos
    useEffect(() => {
        axios.get('/api/positions')
            .then(response => {
                setPositions(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los puestos', error);
            });

        // Obtener los permisos
        axios.get('/api/permissions')
            .then(response => {
                setPermissions(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los permisos', error);
            });
    }, []);

    // Manejar cambio de checkbox de permisos
    const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const permissionId = Number(e.target.value);

        if (e.target.checked) {
            // Agregar el permiso al array si está seleccionado
            setData('selected_permissions', [...data.selected_permissions, permissionId]);
        } else {
            // Eliminar el permiso si se deselecciona
            setData('selected_permissions', data.selected_permissions.filter(id => id !== permissionId));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(e.target.name as keyof typeof data, e.target.checked);
    };

    const handlePrev = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Guardar empleado
            axios.post(route('admin.employees.store'), data)
                .then(response => {
                    const employeeId = response.data.id; // Obtener ID del empleado creado

                    if (data.enable_permissions) {
                        // Asignar permisos al empleado
                        axios.post('api/userpermissions', {
                            employee_id: employeeId, // Enviar el ID del empleado
                            permissions: data.selected_permissions // Enviar el array de permisos seleccionados
                        })
                            .then(() => {
                                setModalSuccess(true); // Mostrar modal de éxito
                                reset(); // Reiniciar el formulario
                                setStep(1); // Volver al primer paso
                            })
                            .catch(error => {
                                console.error('Error al asignar los permisos', error);
                                setModalError(true); // Mostrar modal de error
                            });
                    } else {
                        setModalSuccess(true); // Mostrar modal de éxito
                        reset(); // Reiniciar el formulario
                        setStep(1); // Volver al primer paso
                    }
                })
                .catch(error => {
                    console.error('Error al guardar el empleado', error);
                    if (error.response?.data?.errors) {
                        setModalError(true);
                    }
                });
        }
    };

    return (
        <div className="container__25">
            <Head title="Registro de nuevos empleados" />
            <form className={'h-auto'} onSubmit={handleSubmit}>
                <h1 className="text-2xl text-center font-bold my-4">Registro de nuevos empleados</h1>
                {/* Lista de pasos */}
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Registrar nuevo empleado</li>
                    <li className={`step ${step === 2 ? 'step-primary' : ''}`}>Elegir los permisos para el nuevo usuario</li>
                </ul>

                {step === 1 && (
                    <>
                        <div className="mt-4">
                            <input
                                id="first_name"
                                name="first_name"
                                value={data.first_name}
                                className="input__data__entry"
                                placeholder="Nombre(s)"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="last_name_1"
                                name="last_name_1"
                                value={data.last_name_1}
                                className="input__data__entry "
                                placeholder="Primer apellido"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="last_name_2"
                                name="last_name_2"
                                value={data.last_name_2}
                                className="input__data__entry"
                                placeholder="Segundo apellido"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="username"
                                name="username"
                                value={data.username}
                                className="input__data__entry"
                                placeholder="Nombre de usuario (CURP)"
                                maxLength={18}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <select
                                id="position_id"
                                name="position_id"
                                value={data.position_id}
                                className="input__data__entry"
                                onChange={handleChange}
                                required
                            >
                                <option className={'input__data__entry'} value="">Seleccione un puesto</option>
                                {positions.map((position: Position) => (
                                    <option className={'input__data__entry'} key={position.id} value={position.id}>
                                        {position.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="input__data__entry"
                                placeholder="Contraseña"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="input__data__entry"
                                placeholder="Confirmar contraseña"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <button
                                className="btn btn-block"
                                onClick={handleSubmit} disabled={processing}>
                                Siguiente
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="mt-4">
                            <label htmlFor="enable_permissions" className="input__label">
                                Habilitar permisos
                                <input
                                    id="enable_permissions"
                                    name="enable_permissions"
                                    type="checkbox"
                                    checked={data.enable_permissions}
                                    className="ml-2 checkbox checkbox-primary"
                                    onChange={handleCheckboxChange}
                                />
                            </label>
                        </div>

                        {data.enable_permissions && (
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                {permissions.map((permission: Permission) => (
                                    <div key={permission.id}>
                                        <label htmlFor={`permission_${permission.id}`} className="input__label ">
                                            <input
                                                id={`permission_${permission.id}`}
                                                type="checkbox"
                                                value={permission.id}
                                                checked={data.selected_permissions.includes(permission.id)}
                                                onChange={handlePermissionChange}
                                                className="checkbox checkbox-primary mr-5"
                                            />
                                            {permission.permission_description}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 flex justify-between">
                        <button className="btn btn-block" onClick={handlePrev}>
                                Anterior
                            </button>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button className="btn btn-block " onClick={handleSubmit} disabled={processing}>
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
                            <button className="btn btn-primary" onClick={() => setModalSuccess(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {modalError && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Error al registrar el empleado</h3>
                        <p>Por favor, verifica los campos e inténtalo nuevamente.</p>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setModalError(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
