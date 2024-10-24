import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from "axios";
import { Company, HierarchyLevel } from "@/types";

export default function CreatePosition() {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        company_id: '',
        hierarchy_level: ''
    });

    const [companies, setCompanies] = useState<Company[]>([]);
    const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);
    const [errors, setErrors] = useState({
        name: ''
    });

    // Estado para mostrar mensaje de éxito
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = () => {
        let validationErrors = { name: '' };

        if (!data.name) validationErrors.name = 'El nombre del puesto es requerido';

        if (!validationErrors.name) {
            post(route('api.positions.store'), {
                onFinish: () => {
                    reset('name');
                    setSuccessMessage('El puesto ha sido registrado exitosamente.'); // Mostrar mensaje de éxito
                    closeModal(); // Cerrar modal después de registro exitoso
                },
            });
        } else {
            setErrors(validationErrors);
        }
    };

    const closeModal = () => {
        const modal = document.getElementById('modal_position_confirm') as HTMLDialogElement | null;
        modal?.close();
    };

    const openModal = () => {
        const modal = document.getElementById('modal_position_confirm') as HTMLDialogElement | null;
        modal?.showModal();
    };

    useEffect(() => {
        axios.get('api/companies')
            .then(response => {
                setCompanies(response.data);
            })
            .catch(error => {
                console.error('Error al cargar las empresas', error);
            });

        axios.get('api/hierarchylevels')
            .then(response => {
                setHierarchyLevels(response.data);
            })
            .catch(error => {
                console.error('Error al cargar los niveles jerárquicos', error);
            });
    }, []);

    return (
        <div className='container__25'>
            <form onSubmit={(e) => e.preventDefault()}>
                <div>
                    {/* Selección de empresa */}
                    <label className="mt-10 input__label" htmlFor="company_id">Nombre de la empresa
                        <select
                            id="company_id"
                            name="company_id"
                            value={data.company_id}
                            className="input__data__entry"
                            onChange={(e) => setData('company_id', e.target.value)}
                            required
                        >
                            <option value="">Seleccione una empresa</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Selección de nivel jerárquico */}
                    <label className="mt-10 input__label" htmlFor="hierarchy_level">Nivel Jerárquico
                        <select
                            id="hierarchy_level"
                            name="hierarchy_level"
                            value={data.hierarchy_level}
                            className="input__data__entry"
                            onChange={(e) => setData('hierarchy_level', e.target.value)}
                            required
                        >
                            <option value="">Seleccione un nivel jerárquico</option>
                            {hierarchyLevels.map((hierarchy) => (
                                <option key={hierarchy.level} value={hierarchy.level}>
                                    {hierarchy.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Nombre del puesto */}
                    <label className='mt-10 input__label' htmlFor="name">Nombre del puesto
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="input__data__entry"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </label>
                    {errors.name && <p className="mt-2 text-red-600">{errors.name}</p>}
                </div>

                {/* Botón para abrir el modal de confirmación */}
                <div className="mt-4 flex items-center justify-end">
                    <button className="btn btn-success" onClick={openModal}>
                        Registrar puesto
                    </button>
                </div>
            </form>

            {/* Mostrar mensaje de éxito si el puesto fue registrado */}
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
            <dialog id="modal_position_confirm" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-center">¿Estás seguro de registrar este puesto?</h3>
                    <div className="modal-action justify-center">
                        <button className="btn m-3 btn-info" onClick={closeModal}>No, cancelar</button>
                        <button className="btn m-3 btn-warning" onClick={handleSubmit}>Sí, registrar puesto</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
