import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef<HTMLInputElement | null>(null);
    const currentPasswordInput = useRef<HTMLInputElement | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm({
        mode: 'onChange', // Habilita la validación en tiempo real
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const watchPassword = watch('password');
    const watchPasswordConfirmation = watch('password_confirmation');

    const onSubmit = async (data: any) => {
        try {
            await axios.put('/password/update', data);

            // Si la solicitud es exitosa, mostramos el modal de éxito
            setModalMessage('¡Contraseña actualizada con éxito!');
            setModalVisible(true);
            reset();
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                const serverErrors = error.response.data.errors;

                if (serverErrors.current_password) {
                    if (
                        serverErrors.current_password.includes('The password is incorrect.') ||
                        serverErrors.current_password.includes('La contraseña actual es incorrecta.')
                    ) {
                        // Mostrar modal de contraseña incorrecta
                        setModalMessage('Contraseña incorrecta');
                        setModalVisible(true);
                        reset({ current_password: '' });
                        currentPasswordInput.current?.focus();
                    } else {
                        setError('current_password', { type: 'server', message: serverErrors.current_password[0] });
                        currentPasswordInput.current?.focus();
                    }
                }
                if (serverErrors.password) {
                    setError('password', { type: 'server', message: serverErrors.password[0] });
                    reset({ password: '', password_confirmation: '' });
                    passwordInput.current?.focus();
                }
                if (serverErrors.password_confirmation) {
                    setError('password_confirmation', { type: 'server', message: serverErrors.password_confirmation[0] });
                }
            } else {
                // Manejar otros errores
                console.error('An error occurred:', error);
            }
        }
    };

    return (
        <section>
            <header>
                <h2 className="text-2xl font-bold text-center mt-4">Actualizar contraseña</h2>

                <p className="mt-1 text-sm text-gray-600 text-center">
                    Asegúrate de que tu cuenta esté usando una contraseña larga y aleatoria para mantenerla segura.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                {/* Contraseña actual */}
                <div>
                    <label htmlFor="current_password" className="input__label">
                        Contraseña actual
                    </label>

                    <input
                        id="current_password"
                        {...register('current_password', { required: 'La contraseña actual es obligatoria' })}
                        type="password"
                        className="input__data__entry"
                        autoComplete="current-password"
                        ref={(e) => {
                            register('current_password').ref(e);
                            currentPasswordInput.current = e;
                        }}
                    />

                    {errors.current_password && (
                        <p className="text-red-600 mt-2">{errors.current_password.message}</p>
                    )}
                </div>

                {/* Nueva contraseña */}
                <div>
                    <label htmlFor="password" className="input__label">
                        Nueva contraseña
                    </label>

                    <input
                        id="password"
                        {...register('password', {
                            required: 'La nueva contraseña es obligatoria',
                            minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
                        })}
                        type="password"
                        className="input__data__entry"
                        autoComplete="new-password"
                        ref={(e) => {
                            register('password').ref(e);
                            passwordInput.current = e;
                        }}
                    />

                    {errors.password && (
                        <p className="text-red-600 mt-2">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                    <label htmlFor="password_confirmation" className="input__label">
                        Confirmar contraseña
                    </label>

                    <input
                        id="password_confirmation"
                        {...register('password_confirmation', {
                            required: 'Debe confirmar la nueva contraseña',
                            validate: (value) =>
                                value === watchPassword || 'Las contraseñas no coinciden',
                        })}
                        type="password"
                        className="input__data__entry"
                        autoComplete="new-password"
                    />

                    {errors.password_confirmation && (
                        <p className="text-red-600 mt-2">{errors.password_confirmation.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="btn btn-primary min-w-full max-w-xl"
                    >
                        Guardar
                    </button>
                </div>
            </form>

            {/* Modal de éxito o error */}
            {modalVisible && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">{modalMessage}</h3>
                        <div className="modal-action">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setModalVisible(false);
                                    if (modalMessage === '¡Contraseña actualizada con éxito!') {
                                        // Recargar la página o componente si es necesario
                                        window.location.reload();
                                    }
                                }}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
