// resources/js/Pages/Auth/Login.tsx
import React from 'react';
import axios from '../../axiosConfig';
import { useForm } from 'react-hook-form';
import { Head, Link } from '@inertiajs/react';

interface LoginFormInputs {
    username: string;
    password: string;
    remember: boolean;
}

export default function Login({
                                  status,
                                  canResetPassword,
                              }: {
    status?: string;
    canResetPassword: boolean;
}) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isValid },
    } = useForm<LoginFormInputs>({
        mode: 'onChange', // Validación en tiempo real
        defaultValues: {
            remember: true, // Checkbox marcado por defecto
        },
    });

    const onSubmit = async (data: LoginFormInputs) => {
        try {
            await axios.post('/login', data);
            window.location.href = '/';
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                const serverErrors = error.response.data.errors;
                if (serverErrors) {
                    Object.keys(serverErrors).forEach((field) => {
                        setError(field as keyof LoginFormInputs, {
                            type: 'server',
                            message: serverErrors[field][0],
                        });
                    });
                } else {
                    // En caso de que haya un mensaje de error general
                    setError('username', {
                        type: 'server',
                        message: error.response.data.message || 'Error en el inicio de sesión',
                    });
                }
            } else {
                console.error(error);
            }
        }
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <form
                    className="container__25 bg-white p-6 rounded-md shadow-md mx-4 md:mx-0"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Nombre de usuario
                        </label>

                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            className="input__data__entry"
                            {...register('username', {
                                required: 'El nombre de usuario es requerido',
                            })}
                        />

                        {errors.username && (
                            <p className="mt-2 text-sm text-red-600">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            className="input__data__entry"
                            {...register('password', {
                                required: 'La contraseña es requerida',
                            })}
                        />

                        {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="mt-4 block">
                        {/* Checkbox estándar */}
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-indigo-600"
                                {...register('remember')}
                            />
                            <span className="ml-2 text-sm text-gray-600">
                                Recuérdame
                            </span>
                        </label>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        {canResetPassword && (
                            <Link
                                href="/password/reset"
                                className="text-sm text-gray-600 underline hover:text-gray-900"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!isValid}
                        >
                            Iniciar sesión
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
