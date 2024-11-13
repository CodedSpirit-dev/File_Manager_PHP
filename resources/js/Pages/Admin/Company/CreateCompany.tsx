import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createCompany } from "@/Pages/Admin/Company/companyApi";
import {Head} from "@inertiajs/react";

interface CreateCompanyProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCompany({ onClose, onSuccess }: CreateCompanyProps) {
    const { control, handleSubmit, formState: { errors, isValid }, reset, watch } = useForm({
        mode: 'onChange',
        defaultValues: { name: '' },
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const confirmModalRef = useRef<HTMLDialogElement>(null);
    const successModalRef = useRef<HTMLDialogElement>(null);
    const errorModalRef = useRef<HTMLDialogElement>(null);

    const companyName = watch('name'); // Obtenemos el nombre de la empresa desde el formulario

    const onSubmit = async (data: { name: string }) => {
        confirmModalRef.current?.close();
        setIsSubmitting(true);
        try {
            await createCompany(data);
            setSuccessMessage('Empresa registrada exitosamente.');
            setErrorMessage('');
            successModalRef.current?.showModal();
            onSuccess();
            reset();
        } catch (error: any) {
            // Manejo de errores del servidor
            if (error.response && error.response.data && error.response.data.errors) {
                const serverErrors = error.response.data.errors;
                const errorMessages = Object.values(serverErrors).flat().join(' ');
                setErrorMessage(errorMessages);
            } else {
                setErrorMessage('Error en el registro de la empresa.');
            }
            errorModalRef.current?.showModal();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseSuccessModal = () => {
        successModalRef.current?.close();
        onClose();
    };

    const handleCloseErrorModal = () => {
        errorModalRef.current?.close();
        onClose(); // Cierra el modal de crear compañía al cerrar el modal de error
    };

    return (
        <>
            <div className="modal-box">
                <h1 className="text-2xl text-center font-bold my-4">Nueva Empresa</h1>
                <form>
                    <Controller
                        name="name"
                        control={control}
                        rules={{
                            required: 'Nombre obligatorio',
                            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                            maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        }}
                        render={({ field }) => (
                            <input
                                {...field}
                                className={`input input-bordered w-full ${errors.name ? 'border-red-600' : ''}`}
                                placeholder="Nombre de la empresa"
                                disabled={isSubmitting}
                            />
                        )}
                    />
                    {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                    <div className="modal-action">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                        <button
                            type="button"
                            className={`btn-accept ${!isValid || isSubmitting ? 'btn-disabled' : ''}`}
                            onClick={() => confirmModalRef.current?.showModal()}
                            disabled={!isValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                'Registrar'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Confirmación */}
            <dialog ref={confirmModalRef} id="modal_company_confirm" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">
                        ¿Estás seguro de registrar a la empresa <b>{companyName}</b>?
                    </h4>
                    <div className="modal-action justify-center">
                        <button className="btn-cancel" onClick={() => confirmModalRef.current?.close()}>No, cancelar</button>
                        <button className="btn-accept" onClick={handleSubmit(onSubmit)}>Sí, registrar empresa</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Éxito */}
            <dialog ref={successModalRef} id="modal_company_success" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-center">Registro de Empresa</h3>
                    <p className="text-center text-success">{successMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-info" onClick={handleCloseSuccessModal}>Aceptar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error */}
            <dialog ref={errorModalRef} id="modal_company_error" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">Error al Registrar Empresa</h4>
                    <p className="text-center text-error">{errorMessage}</p>
                    <div className="modal-action justify-center">
                        <button className="btn-accept" onClick={handleCloseErrorModal}>Cerrar</button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
