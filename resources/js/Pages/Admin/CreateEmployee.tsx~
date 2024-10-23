import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Company, Position, HierarchyLevel } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
        position_id: '', // Lógica para seleccionar el puesto
        company_id: '', // Lógica para seleccionar la empresa
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
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

    useEffect(() => {
        axios.get('api/companies')
            .then(response => {
                setCompanies(response.data);
            })
            .catch(error => {
                console.error('Error al cargar las empresas', error);
            });

        axios.get('api/positions')
            .then(response => {
                setPositions(response.data);
            }).catch(error => {
            console.error('Error al cargar los puestos', error);
        });

        axios.get('api/hierarchylevels')
            .then(response => {
                setHierarchyLevels(response.data);
            }).catch(error => {
            console.error('Error al cargar los niveles de autorización', error);
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let validationErrors = {
            first_name: '',
            last_name_1: '',
            last_name_2: '',
            username: '',
            company_id: '',
            position_id: '',
            hierarchy_level: '',
            password: '',
            password_confirmation: ''
        };

        const positionId = parseInt(data.position_id, 10);
        const companyId = parseInt(data.company_id, 10);

        if (!data.first_name) validationErrors.first_name = 'El nombre es requerido';
        if (!data.last_name_1) validationErrors.last_name_1 = 'El apellido paterno es requerido';
        if (!data.last_name_2) validationErrors.last_name_2 = 'El apellido materno es requerido';
        if (!data.username) validationErrors.username = 'El nombre de usuario es requerido';
        if (isNaN(positionId)) validationErrors.position_id = "El puesto no debe estar vacío";
        if (isNaN(companyId)) validationErrors.company_id = "Debes seleccionar la empresa";
        if (!data.hierarchy_level) validationErrors.hierarchy_level = 'Debes seleccionar el nivel de autorización';
        if (!data.password) validationErrors.password = 'La contraseña es requerida';
        if (!data.password_confirmation) validationErrors.password_confirmation = 'La confirmación de la contraseña es requerida';

        if (Object.values(validationErrors).every(value => value === '')) {
            const upperCaseData = {
                ...data,
                first_name: data.first_name.toUpperCase(),
                last_name_1: data.last_name_1.toUpperCase(),
                last_name_2: data.last_name_2.toUpperCase(),
                username: data.username.toUpperCase(),
            };
            console.log("Data to send: ", upperCaseData);
            post(route('admin.employees.store'), {
                data: upperCaseData,
                //onFinish: () => reset("first_name", "last_name_1", "last_name_2", "username", "password", "hierarchy_level", "password_confirmation", "position_id", "company_id"),
            });
        } else {
            setErrors(validationErrors);
        }
    };

    return (
        <div className='container__25'>
            <Head title="Registro de nuevos empleados" />
            <form onSubmit={handleSubmit}>
                <div>
                    <label className='mt-10 input__label' htmlFor="first_name">Nombre(s)
                        <input
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            className="input__data__entry"
                            autoComplete="given-name"
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />
                    </label>
                    {errors.first_name && <p className="mt-2 text-red-600">{errors.first_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="last_name_1">Apellido paterno
                        <input
                            id="last_name_1"
                            name="last_name_1"
                            value={data.last_name_1}
                            className="input__data__entry"
                            autoComplete="family-name"
                            onChange={(e) => setData('last_name_1', e.target.value)}
                            required
                        />
                    </label>
                    {errors.last_name_1 && <p className="mt-2 text-red-600">{errors.last_name_1}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="last_name_2">Apellido materno
                        <input
                            id="last_name_2"
                            name="last_name_2"
                            value={data.last_name_2}
                            className="input__data__entry"
                            autoComplete="family-name"
                            onChange={(e) => setData('last_name_2', e.target.value)}
                            required
                        />
                    </label>
                    {errors.last_name_2 && <p className="mt-2 text-red-600">{errors.last_name_2}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="username">Nombre de usuario (CURP)
                        <input
                            id="username"
                            name="username"
                            value={data.username}
                            className="input__data__entry"
                            maxLength={18}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                        />
                    </label>
                    {errors.username && <p className="mt-2 text-red-600">{errors.username}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="company_id">Nombre de la empresa
                        <select
                            id="company_id"
                            name="company_id"
                            value={data.company_id}
                            className="input__data__entry"
                            onChange={(e) => setData('company_id', e.target.value)}
                            required
                        >
                            <option value="">Seleccione una empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errors.company_id && <p className="mt-2 text-red-600">{errors.company_id}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="position_id">Nombre del puesto
                        <select
                            id="position_id"
                            name="position_id"
                            value={data.position_id}
                            className="input__data__entry"
                            onChange={(e) => setData('position_id', e.target.value)}
                            required
                        >
                            <option value="">Seleccione un puesto</option>
                            {positions.map((position) => (
                                <option key={position.id} value={position.id}>
                                    {position.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errors.position_id && <p className="mt-2 text-red-600">{errors.position_id}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="hierarchy_level">Nivel de autorización
                        <select
                            id="hierarchy_level"
                            name="hierarchy_level"
                            value={data.hierarchy_level}
                            className="input__data__entry"
                            onChange={(e) => setData('hierarchy_level', e.target.value)}
                            required
                        >
                            <option value="">Seleccione un nivel de autorización</option>
                            {hierarchyLevels.map((hierarchyLevel) => (
                                <option key={hierarchyLevel.id} value={hierarchyLevel.id}>
                                    {hierarchyLevel.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errors.hierarchy_level && <p className="mt-2 text-red-600">{errors.hierarchy_level}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="password">Contraseña
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="input__data__entry"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </label>
                    {errors.password && <p className="mt-2 text-red-600">{errors.password}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="password_confirmation">Confirmar contraseña
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="input__data__entry"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </label>
                    {errors.password_confirmation && <p className="mt-2 text-red-600">{errors.password_confirmation}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-success" disabled={processing}>
                        Registrar empleado
                    </button>
                </div>
            </form>
        </div>
    );
}
