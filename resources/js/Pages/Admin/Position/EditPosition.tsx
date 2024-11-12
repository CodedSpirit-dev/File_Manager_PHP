// src/Pages/Admin/Position/EditPosition.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position } from "@/types";

interface EditPositionProps {
    position: Position;
    onClose: (wasEdited: boolean) => void;
}

const EditPosition: React.FC<EditPositionProps> = ({ position, onClose }) => {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: position.name
        }
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Refs para los modales
    const confirmModalRef = useRef<HTMLDialogElement>(null);
    const successModalRef = useRef<HTMLDialogElement>(null);
    const errorModalRef = useRef<HTMLDialogElement>(null);

    // Función para manejar la actualización del puesto
    const onSubmit = async (data: { name: string }) => {
        setLoading(true);
        try {
            await axios.put(`/admin/positions/${position.id}`, data);
            setSuccessMessage('El puesto ha sido actualizado exitosamente.');
            onClose(true); // Notificar al componente padre que se ha editado
            confirmModalRef.current?.close(); // Cerrar el modal de confirmación
            successModalRef.current?.showModal(); // Abrir el modal de éxito
        } catch (error: any) {
            if (error.response?.status === 480) {
                setErrorMessage('La compañía ya tiene un puesto con el mismo nombre.');
            } else {
                setErrorMessage('Hubo un error al actualizar el puesto.');
            }
            errorModalRef.current?.showModal(); // Abrir el modal de error
        } finally {
            setLoading(false);
        }
    };

    // Función para abrir el modal de confirmación
    const handleUpdateClick = () => {
        confirmModalRef.current?.showModal();
    };

    // Función para confirmar la actualización
    const handleConfirmUpdate = () => {
        handleSubmit(onSubmit)();
    };

    // Funciones para cerrar los modales de éxito y error
    const handleCloseSuccessModal = () => {
        setSuccessMessage('');
        successModalRef.current?.close();
    };

    const handleCloseErrorModal = () => {
        setErrorMessage('');
        errorModalRef.current?.close();
    };

    return (
        <div className={'modal-box'}>
            {/* Formulario para editar el puesto */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl text-center font-bold my-4">Editar Puesto</h1>

                <div>
                    {/* Campo para el nombre del puesto */}
                    <div className='mt-4'>
                        <label className='input__data__entry' htmlFor="name">
                            <Controller
                                name="name"
                                control={control}
                                rules={{
                                    required: 'El nombre del puesto es obligatorio',
                                    minLength: {
                                        value: 3,
                                        message: 'El nombre debe tener al menos 3 caracteres'
                                    }
                                }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        placeholder="Nombre del puesto"
                                        id="name"
                                        className="input__data__entry w-full"
                                    />
                                )}
                            />
                            {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                        </label>
                    </div>
                </div>

                {/* Botones para enviar o cancelar */}
                <div className="mt-6 flex items-center justify-end space-x-4">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onClose(false)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdateClick}
                        disabled={!isValid || loading}
                    >
                        {loading ? <span className="loading loading-spinner"></span> : 'Actualizar puesto'}
                    </button>
                </div>
            </form>

            {/* Modal de Confirmación */}
            <dialog ref={confirmModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">
                        ¿Estás seguro de actualizar el puesto <b>{position.name}</b>?
                    </h4>
                    <div className="modal-action justify-center">
                        <button className="btn-cancel" onClick={() => confirmModalRef.current?.close()} disabled={loading}>
                            No, cancelar
                        </button>
                        <button className="btn-accept" onClick={handleConfirmUpdate} disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : 'Sí, actualizar puesto'}
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Éxito */}
            <dialog ref={successModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-center">Actualización de Puesto</h3>
                    <p className="text-center text-green-600">{successMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-info" onClick={handleCloseSuccessModal}>Aceptar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error */}
            <dialog ref={errorModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">Error al Actualizar Puesto</h4>
                    <p className="text-center text-error">{errorMessage}</p>
                    <div className="modal-action justify-center">
                        <button className="btn btn-error" onClick={handleCloseErrorModal}>Cerrar</button>
                    </div>
                </div>
            </dialog>
        </div>
    );

};

export default EditPosition;
