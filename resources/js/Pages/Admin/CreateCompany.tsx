import {Head, useForm} from '@inertiajs/react';
import React, { useState } from 'react';

export default function CreateCompany() {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
    });

    const [errors, setErrors] = useState({
        name: ''
    });

    // Estado para mostrar mensaje de éxito
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = () => {
        let validationErrors = { name: '' };

        if (!data.name) validationErrors.name = 'El nombre de la empresa es requerido';

        if (!validationErrors.name) {
            post(route('admin.companies.store'), {
                onFinish: () => {
                    reset('name');
                    setSuccessMessage('La empresa ha sido registrada exitosamente.'); // Mostrar mensaje de éxito
                    closeModal(); // Cerrar modal después de registro exitoso
                },
            });
        } else {
            setErrors(validationErrors);
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('modal_company_confirm') as HTMLDialogElement | null;
        modal?.close();
    };

    const openModal = () => {
        const modal = document.getElementById('modal_company_confirm') as HTMLDialogElement | null;
        modal?.showModal();
    };

    return (
        <div className='container__25'>
            <Head title="Registro de nuevas empresas" />
            <form onSubmit={(e) => e.preventDefault()}>
                <h1 className="text-2xl text-start font-bold my-4">Registro de empresas</h1>
                <div className="mt-4">
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className="input input-bordered input-primary w-full max-w-xs "
                        placeholder="Nombre de la empresa"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    {errors.name && <p className="mt-2 text-red-600">{errors.name}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-success" onClick={openModal} disabled={processing}>
                        Registrar empresa
                    </button>
                </div>
            </form>

            {/* Mostrar mensaje de éxito si la empresa fue registrada */}
            {successMessage && (
                <div role="alert" className="alert alert-success mt-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 shrink-0 stroke-current"
                        fill="none"
                        viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Modal de confirmación */}
            <dialog id="modal_company_confirm" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">¿Estás seguro de registrar esta empresa?</h3>
                    <div className="modal-action justify-center">
                        <button className="btn m-3 btn-info" onClick={closeModal}>No, cancelar</button>
                        <button className="btn m-3 btn-warning" onClick={handleSubmit}>Sí, registrar empresa</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
