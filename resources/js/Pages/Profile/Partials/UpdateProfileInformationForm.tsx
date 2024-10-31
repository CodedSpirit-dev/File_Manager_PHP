import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';

interface UpdateProfileInformationProps {
    mustVerifyEmail: boolean;
    status: string;
    className?: string;
}

export default function UpdateProfileInformation({
                                                     mustVerifyEmail,
                                                     status,
                                                     className = '',
                                                 }: UpdateProfileInformationProps) {
    const user = usePage().props.auth.user;

    // Estado para manejar los datos del formulario
    const { data, setData, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    // Estados para el manejo de mensajes y modales
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalSuccess, setModalSuccess] = useState(false);
    const [modalError, setModalError] = useState(false);

    // Función para manejar el envío del formulario
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        axios.patch('/profile', data)
            .then(() => {
                // Manejar éxito
                setSuccessMessage('Perfil actualizado exitosamente.');
                setErrorMessage('');
                setModalSuccess(true);
            })
            .catch(error => {
                // Manejar error
                setErrorMessage('Hubo un error al actualizar el perfil.');
                setSuccessMessage('');
                setModalError(true);
            });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Información del perfil
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Actualiza la información del perfil y la dirección de correo electrónico de tu cuenta.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nombre" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Correo electrónico" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Tu dirección de correo electrónico no está verificada.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Haz clic aquí para reenviar el correo de verificación.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                Se ha enviado un nuevo enlace de verificación a tu dirección de correo electrónico.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Guardado.
                        </p>
                    </Transition>
                </div>
            </form>

            {/* Modal de éxito */}
            {modalSuccess && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Perfil actualizado exitosamente</h3>
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
                        <h3 className="font-bold text-lg">Error al actualizar el perfil</h3>
                        <p className="py-4">{errorMessage}</p>
                        <div className="modal-action">
                            <button className="btn btn-primary" onClick={() => setModalError(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
