import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CreateEmployeeProps {}

interface Permission {
    id: number;
    permission_name: string;
    permission_description: string;
}

interface Position {
    id: string;
    name: string;
}

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
        selected_permissions: number[];  // Campo para almacenar los permisos seleccionados
    }>({
        first_name: '',
        last_name_1: '',
        last_name_2: '',
        username: '',
        password: '',
        password_confirmation: '',
        position_id: '',
        enable_permissions: false,
        selected_permissions: [] // Inicializamos como un array vacío
    });

    const [permissions, setPermissions] = useState<Permission[]>([]); // Estado para los permisos
    const [positions, setPositions] = useState<Position[]>([]); // Estado para los puestos
    const [errors, setErrors] = useState({
        first_name: '',
        last_name_1: '',
        last_name_2: '',
        username: '',
        position_id: '',
        password: '',
        password_confirmation: ''
    });
    const [step, setStep] = useState(1);
    const totalSteps = 2;

    // Obtener permisos desde la API
    useEffect(() => {
        axios.get('api/permissions')
            .then(response => {
                setPermissions(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los permisos', error);
            });
    }, []);

    // Obtener posiciones desde la API
    useEffect(() => {
        axios.get('api/positions')
            .then(response => {
                setPositions(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los puestos', error);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const permissionId = parseInt(e.target.value, 10);
        const isChecked = e.target.checked;

        if (isChecked) {
            setData('selected_permissions', [...data.selected_permissions, permissionId]);
        } else {
            setData('selected_permissions', data.selected_permissions.filter(id => id !== permissionId));
        }
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
            // Guardar empleado y permisos
            axios.post(route('admin.employees.store'), data)
                .then(response => {
                    const employeeId = response.data.id;

                    if (data.enable_permissions) {
                        axios.post('api/userpermissions', {
                            user_id: employeeId,
                            permissions: data.selected_permissions // Enviamos los permisos seleccionados
                        })
                            .then(() => {
                                console.log('Permisos asignados correctamente');
                                reset();
                            })
                            .catch(error => {
                                console.error('Error al asignar los permisos', error);
                            });
                    } else {
                        reset();
                    }
                })
                .catch(error => {
                    console.error('Error al guardar el empleado', error);
                    if (error.response?.data?.errors) {
                        setErrors(error.response.data.errors);
                    }
                });
        }
    };

    return (
        <div className="container__25">
            <Head title="Registro de nuevos empleados" />
            <form onSubmit={handleSubmit}>

                <h1 className="text-2xl text-start font-bold my-4">Registro de nuevos empleados</h1>

                {step === 1 && (
                    <>
                        <div className="mt-4">
                            <input
                                id="first_name"
                                name="first_name"
                                value={data.first_name}
                                className="input input-bordered input-primary w-full max-w-xs"
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
                                className="input input-bordered input-primary w-full max-w-xs"
                                placeholder="Apellido paterno"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="last_name_2"
                                name="last_name_2"
                                value={data.last_name_2}
                                className="input input-bordered input-primary w-full max-w-xs"
                                placeholder="Apellido materno"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <input
                                id="username"
                                name="username"
                                value={data.username}
                                className="input input-bordered input-primary w-full max-w-xs"
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
                                className="input input-bordered input-primary w-full max-w-xs"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un puesto</option>
                                {positions.map((position: Position) => (
                                    <option key={position.id} value={position.id}>
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
                                className="input input-bordered input-primary w-full max-w-xs"
                                placeholder="Contraseña"
                                onChange={handleChange}
                                required
                            />
                            {errors.password && <p className="mt-2 text-red-600">{errors.password}</p>}
                        </div>

                        <div className="mt-4">
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="input input-bordered input-primary w-full max-w-xs"
                                placeholder="Confirmar contraseña"
                                onChange={handleChange}
                                required
                            />
                            {errors.password_confirmation && <p className="mt-2 text-red-600">{errors.password_confirmation}</p>}
                        </div>

                        <div className="mt-4 flex items-center justify-end">
                            <button className="btn btn-success" onClick={handleSubmit} disabled={processing}>
                                Siguiente
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="mt-4">
                            <label htmlFor="enable_permissions" className="input__label">Habilitar permisos
                                <input
                                    id="enable_permissions"
                                    name="enable_permissions"
                                    type="checkbox"
                                    checked={data.enable_permissions}
                                    className="ml-2 checkbox checkbox-primary"
                                    onChange={(e) => setData('enable_permissions', e.target.checked)}
                                />
                            </label>
                        </div>

                        {data.enable_permissions && (
                            <div className="mt-4">
                                <h2 className="text-lg font-semibold">Seleccione permisos:</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {permissions.map((permission: Permission) => (
                                        <label key={permission.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value={permission.id}
                                                checked={data.selected_permissions.includes(permission.id)}
                                                onChange={handleCheckboxChange}
                                                className="checkbox checkbox-primary mr-2"
                                            />
                                            {permission.permission_description}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">
                            <button className="btn btn-info" onClick={handlePrev} disabled={processing}>
                                Volver
                            </button>
                            <button className="btn btn-success" type="submit" disabled={processing}>
                                Guardar empleado
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}
