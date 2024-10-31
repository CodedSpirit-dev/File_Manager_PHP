import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Profile{
    first_name: string;
    last_name_1: string;
    username: string;
    position: string;
    company: string;
    registered_at: string;
    last_login_at: string;
}


export default function Profile({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        // Obtén los datos del perfil del usuario autenticado desde el backend
        axios.get('/profile')
            .then(response => setProfile(response.data as Profile)) // Asegúrate de usar el tipo correcto
            .catch(error => console.error("Error fetching profile:", error));
    }, []);

    return (
        <>
            <Head title="Perfil" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <h2 className="text-lg font-medium text-gray-900">Información del perfil</h2>
                        {profile ? (
                            <div className="mt-4 text-gray-700">
                                <p><strong>Nombre:</strong> {profile.first_name} {profile.last_name_1}</p>
                                <p><strong>Nombre de Usuario:</strong> {profile.username}</p>
                                <p><strong>Puesto:</strong> {profile.position}</p>
                                <p><strong>Compañía:</strong> {profile.company}</p>
                                <p><strong>Fecha de Registro:</strong> {new Date(profile.registered_at).toLocaleDateString()}</p>
                                <p><strong>Último Ingreso:</strong> {new Date(profile.last_login_at).toLocaleDateString()}</p>
                            </div>
                        ) : (
                            <p>Cargando información del perfil...</p>
                        )}
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status || ''}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </>
    );
}
