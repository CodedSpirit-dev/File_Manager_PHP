import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import { useForm } from 'react-hook-form';
import { Head, Link } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthProvider';
import logo from '@/assets/cepac-01.png';

interface LoginFormInputs {
    username: string;
    password: string;
}

export default function Login({
                                  status,
                                  canResetPassword,
                              }: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { user, hasPermission } = useAuth(); // Extract 'user'
    const isAuthenticated = user !== null; // Derive 'isAuthenticated'

    const {
        register,
        handleSubmit,
        setError,
        setFocus, // Extracted from useForm
        formState: { errors, isValid },
    } = useForm<LoginFormInputs>({
        mode: 'onChange',
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false); // State to handle loading

    useEffect(() => {
        if (isAuthenticated) {
            // Redirect authenticated user to the home page
            window.location.href = '/';
        } else {
            // Focus the email field when the component mounts
            setFocus('username');
        }
    }, [isAuthenticated, setFocus]);

    const onSubmit = async (data: LoginFormInputs) => {
        setIsSubmitting(true); // Start loading state
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
                    setError('username', {
                        type: 'server',
                        message: error.response.data.message || 'Error en el inicio de sesión',
                    });
                }
            } else {
                console.error(error);
                // You can add a general error message here if desired
            }
        } finally {
            setIsSubmitting(false); // End loading state
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
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="Logo" className="h-20 w-auto" />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>

                        <input
                            id="username"
                            type="email"
                            autoComplete="email"
                            className="input__data__entry"
                            {...register('username', {
                                required: 'El correo electrónico es requerido',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'El correo electrónico no es válido',
                                },
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
                            className="btn btn-block btn-primary flex items-center justify-center"
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner loading-xs mr-2"></span>
                            ) : null}
                            Iniciar sesión
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
