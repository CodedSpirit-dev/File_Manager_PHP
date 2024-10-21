import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function CreateEmployee() {
    const { data, setData, post, processing, reset } = useForm({
        first_name: '',
        last_name1: '',
        last_name2: '',
        user_name: '',
        password: '',
        hierarchy_level: '',
        password_confirmation: '',
        position_id: '', // Se debe manejar la logica para que se pueda seleccionar el puesto
        company_id: '', // Se debe manejar la logica para que se pueda seleccionar la empresa

    });

    const [errors, setErrors] = useState({
        first_name: '',
        last_name1: '',
        last_name2: '',
        user_name: '',
        position_id: '',
        company_id: '',
        hierarchy_level: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let validationErrors: {
            first_name: string;
            last_name1: string;
            last_name2: string;
            user_name: string;
            position_id: string;  // Debe ser una cadena vacía inicialmente
            company_id: string;   // Debe ser una cadena vacía inicialmente
            hierarchy_level: string;
            password: string;
            password_confirmation: string;
        } = {
            first_name: '',
            last_name1: '',
            last_name2: '',
            user_name: '',
            company_id: '',
            position_id: '',
            hierarchy_level: '',
            password: '',
            password_confirmation: ''
        };

        const positionId = parseInt(data.position_id, 10);
        const companyId = parseInt(data.company_id, 10);

        if (!data.first_name) {
            validationErrors.first_name = 'El nombre es requerido';
        }

        if (!data.last_name1) {
            validationErrors.last_name1 = 'El apellido paterno es requerido';
        }

        if (!data.last_name2) {
            validationErrors.last_name2 = 'El apellido materno es requerido';
        }

        if (!data.user_name) {
            validationErrors.user_name = 'El nombre de usuario es requerido';
        }
        if (isNaN(positionId)) {
            validationErrors.position_id = "El puesto no debe estar vacío";
        }

        if (isNaN(companyId)) {
            validationErrors.company_id = "Debes seleccionar la empresa";
        }

        if (!data.hierarchy_level) {
            validationErrors.hierarchy_level = 'Debes seleccionar el nivel de autorización';
        }

        if (!data.password) {
            validationErrors.password = 'La contraseña es requerida';
        }

        if (!data.password_confirmation) {
            validationErrors.password_confirmation = 'La confirmación de la contraseña es requerida';
        }

        // Si los errores son iguales a "" entonces se envía la petició
        if (Object.values(validationErrors).every((value) => value === '')) {
            console.log('Enviando petición');
            console.log(data);
        }

        post(route('registerEmployee'), {
            onFinish: () => reset("first_name", "last_name1", "last_name2", "user_name", "password", "hierarchy_level", "password_confirmation", "position_id", "company_id"),
        });

    }


    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('registerEmployee'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registro de nuevos empleados" />

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="first_name" className='input__label'>Nombre(s)
                    <input
                        id="first_name"
                        name="first_name"
                        value={data.first_name}
                        className="input__data__entry"
                        autoComplete="given-name"
                        autoFocus
                        onChange={(e) => setData('first_name', e.target.value)}
                        required
                    />
                    </label>
                    {errors.first_name && <p className="mt-2 text-red-600">{errors.first_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="last_name1">Apellido paterno
                    <input
                        id="last_name1"
                        name="last_name1"
                        value={data.last_name1}
                        className="input__data__entry"
                        autoComplete="given-name"
                        onChange={(e) => setData('last_name1', e.target.value)}
                        required
                    />
                    </label>
                    {errors.last_name1 && <p className="mt-2 text-red-600">{errors.last_name1}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="last_name2">Apellido materno
                    <input
                        id="last_name2"
                        name="last_name2"
                        value={data.last_name2}
                        className="input__data__entry"
                        autoComplete="given-name"
                        onChange={(e) => setData('last_name2', e.target.value)}
                        required
                    />
                    </label>
                    {errors.last_name2 && <p className="mt-2 text-red-600">{errors.last_name2}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="user_name">Nombre de usuario
                    <input
                        id="user_name"
                        name="user_name"
                        value={data.user_name}
                        className="input__data__entry"
                        autoComplete="given-name"
                        maxLength={18}
                        //minLength={18}
                        onChange={(e) => setData('user_name', e.target.value)}
                        required
                    />
                    </label>
                    {errors.user_name && <p className="mt-2 text-red-600">{errors.user_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="company_id">Nombre de la empresa
                    <input
                        id="company_id"
                        name="company_id"
                        value={data.company_id}
                        type='number'
                        className="input__data__entry"
                        autoComplete="given-name"
                        onChange={(e) => setData('company_id', e.target.value)}
                        required
                    />
                    </label>
                    {errors.company_id && <p className="mt-2 text-red-600">{errors.user_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="position_id">Nombre del puesto</label>
                    <input
                        id="position_id"
                        name="position_id"
                        value={data.position_id}
                        type='number'
                        className="input__data__entry"
                        onChange={(e) => setData('position_id', e.target.value)}
                        required
                    />
                    {errors.position_id && <p className="mt-2 text-red-600">{errors.user_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="hierarchy_level">Nivel de autorizacion</label>
                    <input
                        id="hierarchy_level"
                        name="hierarchy_level"
                        value={data.hierarchy_level}
                        type='number'
                        className="hierarchy_level"
                        onChange={(e) => setData('hierarchy_level', e.target.value)}
                        required
                    />
                    {errors.hierarchy_level && <p className="mt-2 text-red-600">{errors.user_name}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="password">Contraseña</label>
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
                    {errors.password && <p className="mt-2 text-red-600">{errors.password}</p>}
                </div>

                <div className="mt-4 input__label">
                    <label htmlFor="password_confirmation">Ingresa de nuevo la contraseña</label>
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
                    {errors.password_confirmation && <p className="mt-2 text-red-600">{errors.password_confirmation}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-success" disabled={processing}>
                        Registrar al empleado
                    </button>
                </div>

            </form>
        </GuestLayout>
    );
}
