import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from "axios";

export default function CreateCompany() {
    const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm({
        mode: 'onChange', // Se valida en cada cambio
        defaultValues: {
            name: '',
        }
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);


    const onSubmit = (data: { name: string }) => {
        axios.post('/admin/companies/store', data)
            .then(() => {
                setSuccessMessage('La empresa ha sido registrada exitosamente.');
                setErrorMessage('');
                setIsSuccessModalOpen(true); // Mostrar modal de éxito
                reset();
            })
            .catch(error => {
                if (error.response?.status === 450) {
                    setErrorMessage('El nombre de la empresa ya está en uso.');
                } else {
                    setErrorMessage('Hubo un error al registrar la empresa.');
                }
                setIsErrorModalOpen(true); // Mostrar modal de error
            });
    };


    const closeModal = () => {
        const successModal = document.getElementById('modal_company_success') as HTMLDialogElement | null;
        const errorModal = document.getElementById('modal_company_error') as HTMLDialogElement | null;
        successModal?.close();
        errorModal?.close();
    };

    const openSuccessModal = () => {
        const modal = document.getElementById('modal_company_success') as HTMLDialogElement | null;
        modal?.showModal();
    };

    const openErrorModal = () => {
        const modal = document.getElementById('modal_company_error') as HTMLDialogElement | null;
        modal?.showModal();
    };

    return (
        <div className='container__25 w-full'>
            <Head title="Registro de nuevas empresas" />
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl text-center font-bold my-4">Registro de nuevas empresas</h1>
                <div className="mt-4 input__data__entry">
                    <Controller
                        name="name"
                        control={control}
                        rules={{
                            required: 'El nombre es obligatorio',
                            minLength: {
                                value: 3,
                                message: 'El nombre debe tener al menos 3 caracteres'
                            },
                            pattern: {
                                value: /^[a-zA-Z0-9\s]+$/,
                                message: 'El nombre no debe contener caracteres especiales'
                            }
                        }}
                        render={({ field }) => (
                            <input
                                {...field}
                                className={`input__data__entry w-full ${errors.name ? 'border-red-600' : ''}`}
                                placeholder="Nombre de la empresa"
                            />
                        )}
                    />
                    {/* Mostrar mensaje de error si existe */}
                    {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button
                        className="btn btn-block"
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={!isValid} // Deshabilitar si el formulario no es válido
                    >
                        Registrar empresa
                    </button>

                    {/* Modal de éxito */}
                    <dialog id="modal_company_success" className="modal">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg text-center">Registro de empresa</h3>
                            <h3 className="text-center">{successMessage}</h3>
                            <div className="modal-action justify-center">
                                <button type="button" className="btn btn-info" onClick={closeModal}>Aceptar</button>
                            </div>
                        </div>
                    </dialog>
                </div>
            </form>

            {/* Modal de éxito */}
            {isSuccessModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-center">Registro de empresa</h3>
                        <h3 className="text-center">{successMessage}</h3>
                        <div className="modal-action justify-center">
                            <button type="button" className="btn btn-info" onClick={closeModal}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de error */}
            {isErrorModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h1 className="font-bold text-lg text-center">Error al registrar empresa</h1>
                        <h2 className="text-center text-red-600">{errorMessage}</h2>
                        <div className="modal-action justify-center">
                            <button className="btn btn-info" onClick={closeModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
