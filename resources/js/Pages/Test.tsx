import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Test() {
    // Utilizamos el hook useForm de Inertia para manejar los campos y el envío
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        apellido: '',
    });

    // Manejar el envío del formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Enviar el formulario a la ruta que maneja la creación en el backend
        post('directorio');
    };

    return (
            <section className="bg-white dark:bg-gray-800">
                <div className="container px-6 py-8 mx-auto">
                    <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
                        Añadir Persona
                    </h2>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300"
                            />
                            {errors.nombre && <span className="text-red-500 text-sm">{errors.nombre}</span>}
                        </div>

                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                Apellido
                            </label>
                            <input
                                type="text"
                                name="apellido"
                                id="apellido"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300"
                            />
                            {errors.apellido && <span className="text-red-500 text-sm">{errors.apellido}</span>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                {processing ? 'Guardando...' : 'Añadir Persona'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
    );
}
