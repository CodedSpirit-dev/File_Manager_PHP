import { Head } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from "axios";

export default function CreateCompany() {
    const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
        }
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

    // Referencia al modal de confirmación
    const confirmModalRef = useRef<HTMLDialogElement | null>(null);

    // Función para manejar el envío del formulario (cuando se confirma)
    const onSubmit = (data: { name: string }) => {
        confirmModalRef.current?.close(); // Cerrar modal de confirmación al confirmar
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

    // Función para abrir el modal de confirmación
    const openConfirmModal = () => {
        confirmModalRef.current?.showModal();
    };

    // Función para cerrar los modales de éxito y error, que también cierra el modal de confirmación si está abierto
    const closeModal = () => {
        setIsSuccessModalOpen(false);
        setIsErrorModalOpen(false);
        confirmModalRef.current?.close();
    };

    return (
        <div className='container__25 w-full'>
            <Head title="Registro de nuevas empresas" />
            <form onSubmit={(e) => { e.preventDefault(); openConfirmModal(); }}>
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
                            maxLength: {
                                value: 50,
                                message: 'El nombre no debe tener más de 50 caracteres'
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
                    {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button
                        className="btn btn-block"
                        type="button"
                        onClick={openConfirmModal}
                        disabled={!isValid}
                    >
                        Registrar empresa
                    </button>
                </div>
            </form>

            {/* Modal de confirmación */}
            <dialog ref={confirmModalRef} id="modal_company_confirm" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">¿Estás seguro de registrar esta empresa?</h3>
                    <div className="modal-action justify-center">
                        <button className="btn m-3 btn-info" onClick={() => confirmModalRef.current?.close()}>No, cancelar</button>
                        <button className="btn m-3 btn-warning" onClick={handleSubmit(onSubmit)}>Sí, registrar compañía</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de éxito */}
            {isSuccessModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-center">Registro de empresa</h3>
                        <p className="text-center">{successMessage}</p>
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
                        <p className="text-center text-red-600">{errorMessage}</p>
                        <div className="modal-action justify-center">
                            <button className="btn btn-info" onClick={closeModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
