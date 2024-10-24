import { Company, Position, HierarchyLevel, Permission } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CreateEmployeeProps {}

export default function CreateEmployee({}: CreateEmployeeProps) {
    const { data, setData, post, processing, reset } = useForm({
        first_name: '',
        last_name_1: '',
        last_name_2: '',
        username: '',
        password: '',
        hierarchy_level: '',
        password_confirmation: '',
        position_id: '',
        company_id: '',
    });

    const [positions, setPositions] = useState<Position[]>([]);
    const [errors, setErrors] = useState({
        first_name: '',
        last_name_1: '',
        last_name_2: '',
        username: '',
        position_id: '',
        company_id: '',
        hierarchy_level: '',
        password: '',
        password_confirmation: ''
    });

    // Cargar los puestos
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.employees.store'), {
            data,
            onFinish: () => reset(),
        });
    };

    return (
        <div className='container__25'>
            <Head title="Registro de nuevos empleados" />
            <form onSubmit={handleSubmit}>

                <h1 className="text-2xl text-start font-bold my-4">Registro de nuevos empleados</h1>
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
                    {errors.first_name && <p className="mt-2 text-red-600">{errors.first_name}</p>}
                </div>

                {/* Apellido Paterno */}
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
                    {errors.last_name_1 && <p className="mt-2 text-red-600">{errors.last_name_1}</p>}
                </div>

                {/* Apellido Materno */}
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
                    {errors.last_name_2 && <p className="mt-2 text-red-600">{errors.last_name_2}</p>}
                </div>

                {/* Usuario */}
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
                    {errors.username && <p className="mt-2 text-red-600">{errors.username}</p>}
                </div>

                {/* Puesto */}
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
                        {positions.map((position) => (
                            <option key={position.id} value={position.id}>
                                {position.name}
                            </option>
                        ))}
                    </select>
                    {errors.position_id && <p className="mt-2 text-red-600">{errors.position_id}</p>}
                </div>

                {/* Contraseña */}
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

                {/* Confirmar contraseña */}
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

                {/* Botón de enviar */}
                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-success" disabled={processing}>
                        Registrar empleado
                    </button>
                </div>
            </form>
        </div>
    );
}
