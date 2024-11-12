// src/Pages/Admin/Position/CreatePosition.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useForm, Controller } from 'react-hook-form';
import { Company, HierarchyLevel } from "@/types";

interface CreatePositionProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePosition({ onClose, onSuccess }: CreatePositionProps) {
    const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            company_id: '',
            hierarchy_level: ''
        }
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Refs para modales
    const successModalRef = useRef<HTMLDialogElement | null>(null);
    const errorModalRef = useRef<HTMLDialogElement | null>(null);
    const confirmModalRef = useRef<HTMLDialogElement | null>(null);

    // Función para el manejo del envío del formulario
    const onSubmit = (data: { name: string; company_id: string; hierarchy_level: string }) => {
        axios.post('/admin/positions', data) // Asegúrate de que la ruta sea correcta
            .then(() => {
                setSuccessMessage('El puesto ha sido registrado exitosamente.');
                reset(); // Limpiar el formulario después del registro exitoso
                confirmModalRef.current?.close(); // Cerrar el modal de confirmación
                successModalRef.current?.showModal();  // Mostrar modal de éxito
                onSuccess(); // Notificar al componente padre
            })
            .catch(error => {
                confirmModalRef.current?.close(); // Cerrar el modal de confirmación
                if (error.response?.status === 480) {  // Conflicto: nombre ya tomado
                    setErrorMessage('El nombre del puesto ya está en uso.');
                } else {
                    setErrorMessage('Hubo un error al registrar el puesto.');
                }
                errorModalRef.current?.showModal();  // Mostrar modal de error general
            });
    };

    useEffect(() => {
        axios.get('/admin/companies') // Asegúrate de que la ruta sea correcta
            .then(response => setCompanies(response.data))
            .catch(error => console.error('Error al cargar las empresas', error));

        axios.get('/api/hierarchylevels') // Asegúrate de que la ruta sea correcta
            .then(response => setHierarchyLevels(response.data))
            .catch(error => console.error('Error al cargar los niveles jerárquicos', error));
    }, []);

    return (
        <>
            {/* Formulario de creación dentro del modal principal */}
            <div className='modal-box'>
                <form>
                    <h1 className="text-2xl text-center font-bold my-4">Registro de Nuevos Puestos</h1>

                    <div>
                        {/* Selección de empresa */}
                        <label className="input__data__entry mt-4" htmlFor="company_id">
                            <Controller
                                name="company_id"
                                control={control}
                                rules={{ required: 'La empresa es obligatoria' }}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        id="company_id"
                                        className="select select-bordered w-full"
                                    >
                                        <option value="">Seleccione una empresa</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.company_id && <p className="text-red-600 text-sm mt-1">{errors.company_id.message}</p>}
                        </label>

                        {/* Selección de nivel jerárquico */}
                        <div className='mt-4'>
                            <label className="input__data__entry" htmlFor="hierarchy_level">
                                <Controller
                                    name="hierarchy_level"
                                    control={control}
                                    rules={{ required: 'El nivel jerárquico es obligatorio' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            id="hierarchy_level"
                                            className="select select-bordered w-full"
                                        >
                                            <option value="">Seleccione un nivel jerárquico</option>
                                            {hierarchyLevels.map((hierarchy) => (
                                                <option key={hierarchy.level} value={hierarchy.level}>
                                                    {hierarchy.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.hierarchy_level && <p className="text-red-600 text-sm mt-1">{errors.hierarchy_level.message}</p>}
                            </label>
                        </div>

                        {/* Nombre del puesto */}
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
                                            className="input input-bordered w-full"
                                        />
                                    )}
                                />
                                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                            </label>
                        </div>
                    </div>

                    {/* Botones para registrar o cancelar */}
                    <div className="mt-6 flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => confirmModalRef.current?.showModal()}
                            disabled={!isValid}
                        >
                            Registrar Puesto
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de Confirmación */}
            <dialog ref={confirmModalRef} className="modal">
                <form method="dialog" className="modal-box">
                    <h3 className="font-bold text-lg text-center">¿Estás seguro de registrar este puesto?</h3>
                    <p className="py-4 text-center">Una vez registrado, podrás ver el puesto en la lista.</p>
                    <div className="modal-action justify-center">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => confirmModalRef.current?.close()}
                            disabled={!isValid}
                        >
                            No, cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isValid}
                        >
                            Sí, registrar puesto
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Modal de Éxito */}
            <dialog ref={successModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">Éxito</h3>
                    <p className="py-4 text-center text-green-600">{successMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-primary" onClick={() => {
                            successModalRef.current?.close();
                            onClose(); // Opcional: cerrar el modal principal después de aceptar
                        }}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error */}
            <dialog ref={errorModalRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">Error al Registrar Puesto</h3>
                    <p className="py-4 text-center text-red-600">{errorMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-error" onClick={() => errorModalRef.current?.close()}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </dialog>
        </>
        );
}
