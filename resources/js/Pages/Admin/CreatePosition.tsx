import React, { useEffect, useState, useRef } from 'react';
import axios from "axios";
import { useForm, Controller } from 'react-hook-form';
import { Company, HierarchyLevel } from "@/types";

export default function CreatePosition() {
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
    const [nameErrorMessage, setNameErrorMessage] = useState('');

    // Refs para modales
    const successModalRef = useRef<HTMLDialogElement | null>(null);
    const errorModalRef = useRef<HTMLDialogElement | null>(null);
    const nameErrorModalRef = useRef<HTMLDialogElement | null>(null);
    const confirmModalRef = useRef<HTMLDialogElement | null>(null);

    // Función para el manejo del envío del formulario
    const onSubmit = (data: { name: string; company_id: string; hierarchy_level: string }) => {
        axios.post('/api/positions', data)
            .then(() => {
                setSuccessMessage('El puesto ha sido registrado exitosamente.');
                reset(); // Limpiar el formulario después del registro exitoso
                confirmModalRef.current?.close(); // Cerrar el modal de confirmación
                successModalRef.current?.showModal();  // Mostrar modal de éxito
            })
            .catch(error => {
                if (error.response?.status === 480) {  // Conflicto: nombre ya tomado
                    setErrorMessage('El nombre del puesto ya está en uso.');
                    errorModalRef.current?.showModal(); // Mostrar modal de error por nombre
                } else {
                    setErrorMessage('Hubo un error al registrar el puesto.');
                    errorModalRef.current?.showModal();  // Mostrar modal de error general
                }
            });
    };

    useEffect(() => {
        axios.get('api/companies')
            .then(response => setCompanies(response.data))
            .catch(error => console.error('Error al cargar las empresas', error));

        axios.get('api/hierarchylevels')
            .then(response => setHierarchyLevels(response.data))
            .catch(error => console.error('Error al cargar los niveles jerárquicos', error));
    }, []);

    return (
        <div className='container__25'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="text-2xl text-center font-bold my-4">Registro de nuevos puestos</h1>

                <div>
                    {/* Selección de empresa */}
                    <label className="input__data__entry mt-10" htmlFor="company_id">
                        <Controller
                            name="company_id"
                            control={control}
                            rules={{ required: 'La empresa es obligatoria' }}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    id="company_id"
                                    className="input__data__entry w-full"
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
                        {errors.company_id && <p className="text-red-600">{errors.company_id.message}</p>}
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
                                        className="input__data__entry w-full"
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
                            {errors.hierarchy_level && <p className="text-red-600">{errors.hierarchy_level.message}</p>}
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
                                        className="input__data__entry w-full"
                                    />
                                )}
                            />
                            {errors.name && <p className="text-red-600">{errors.name.message}</p>}
                        </label>
                    </div>
                </div>

                {/* Botón para abrir el modal de confirmación */}
                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-block" type="button" onClick={() => confirmModalRef.current?.showModal()} disabled={!isValid}>
                        Registrar puesto
                    </button>
                </div>
            </form>

            {/* Modal de confirmación */}
            <dialog ref={confirmModalRef} id="modal_position_confirm" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">¿Estás seguro de registrar este puesto?</h3>
                    <div className="modal-action justify-center">
                        <button className="btn m-3 btn-info" onClick={() => confirmModalRef.current?.close()}>No, cancelar</button>
                        <button className="btn m-3 btn-warning" onClick={handleSubmit(onSubmit)}>Sí, registrar puesto</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de éxito */}
            <dialog ref={successModalRef} id="modal_position_success" className="modal">
                <div className="modal-box">
                    <h1 className="font-bold text-lg text-center">Se ha registrado el puesto</h1>
                    <h2 className="font-bold text-lg text-center text-green-600">{successMessage}</h2>
                    <div className="modal-action justify-center">
                        <button className="btn btn-success" onClick={() => successModalRef.current?.close()}>Cerrar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de error general */}
            <dialog ref={errorModalRef} id="modal_position_error" className="modal">
                <div className="modal-box">
                    <h1 className="font-bold text-lg text-center">Error al registrar puesto</h1>
                    <h2 className="text-center text-red-600">{errorMessage}</h2>
                    <div className="modal-action justify-center">
                        <button className="btn btn-info" onClick={() => errorModalRef.current?.close()}>Cerrar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de error por nombre ya tomado */}
            <dialog ref={nameErrorModalRef} id="modal_position_name_error" className="modal">
                <div className="modal-box">
                    <h1 className="font-bold text-lg text-center text-red-600">{nameErrorMessage}</h1>
                    <div className="modal-action justify-center">
                        <button className="btn btn-info" onClick={() => nameErrorModalRef.current?.close()}>Cerrar</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
