import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {PageProps} from '@/types';
import {Head} from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {useState, useEffect} from 'react';
import axios from 'axios';

interface Profile {
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
            <Head title="Perfil"/>

            <div className="py-2">
                <div className="mx-auto max-w-7xl">


                    <div className="pb-8">
                        <div className="bg-white p-6 shadow-md rounded-lg min-w-full max-w-xl mx-auto">
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Tu información</h2>
                            {profile ? (
                                <div className="text-gray-700 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Nombre:</span>
                                            <span>{profile.first_name} {profile.last_name_1}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Nombre de Usuario:</span>
                                            <span>{profile.username}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Puesto:</span>
                                            <span>{profile.position}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Compañía:</span>
                                            <span>{profile.company}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Fecha de Registro:</span>
                                            <span>{new Date(profile.registered_at).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">Último Ingreso:</span>
                                            <span>{new Date(profile.last_login_at).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Cargando información del perfil...</p>
                            )}
                        </div>
                    </div>


                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl"/>
                    </div>

                </div>
            </div>
        </>
    );
}
