import React, { useState, useRef } from 'react';
import { Company } from "@/types";
import axios from "axios";

interface EditCompanyProps {
    company: Company;
    onClose: (wasEdited: boolean) => void;
}

const EditCompany: React.FC<EditCompanyProps> = ({ company, onClose }) => {
    const [name, setName] = useState(company.name);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const confirmModalRef = useRef<HTMLDialogElement>(null);
    const successModalRef = useRef<HTMLDialogElement>(null);
    const errorModalRef = useRef<HTMLDialogElement>(null);

    const handleSave = async () => {
        setLoading(true);
        confirmModalRef.current?.close(); // Cierra el modal de confirmación

        try {
            await axios.put(`admin/companies/${company.id}`, { name });
            setLoading(false);
            setSuccessMessage("La empresa ha sido actualizada exitosamente.");
            successModalRef.current?.showModal(); // Abre el modal de éxito
        } catch (error: any) {
            setLoading(false);
            if (error.response && error.response.data && error.response.data.errors) {
                const serverErrors = error.response.data.errors;
                const errorMessages = Object.values(serverErrors).flat().join(' ');
                setError(errorMessages);
            } else {
                setError("Error al actualizar la empresa.");
            }
            errorModalRef.current?.showModal(); // Abre el modal de error
        }
    };

    const handleCloseSuccessModal = () => {
        successModalRef.current?.close();
        onClose(true); // Indica que la empresa fue editada
    };

    const handleCloseErrorModal = () => {
        errorModalRef.current?.close();
        onClose(false); // Cierra el modal sin indicar edición
    };

    const handleCancel = () => {
        onClose(false); // Indica que no se hicieron cambios
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Editar Empresa</h3>
                <div className="mt-4">
                    <label className="label">
                        <span className="label-text">Nombre de la Empresa</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-bordered w-full"
                        disabled={loading}
                    />
                </div>
                <div className="modal-action">
                    <button onClick={handleCancel} className="btn-cancel" disabled={loading}>Cancelar</button>
                    <button onClick={() => confirmModalRef.current?.showModal()} className={`btn-accept ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? '' : 'Guardar'}
                    </button>
                </div>
            </div>

            {/* Modal de Confirmación */}
            <dialog ref={confirmModalRef} id="modal_company_confirm" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">
                        ¿Estás seguro de actualizar la empresa <b>{name}</b>?
                    </h4>
                    <div className="modal-action justify-center">
                        <button className="btn-cancel" onClick={() => confirmModalRef.current?.close()} disabled={loading}>No, cancelar</button>
                        <button className="btn-accept" onClick={handleSave} disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : 'Sí, actualizar empresa'}
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Éxito */}
            <dialog ref={successModalRef} id="modal_company_success" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-center">Actualización de Empresa</h3>
                    <p className="text-center text-success">{successMessage}</p>
                    <div className="modal-action justify-center">
                        <button type="button" className="btn btn-info" onClick={handleCloseSuccessModal}>Aceptar</button>
                    </div>
                </div>
            </dialog>

            {/* Modal de Error */}
            <dialog ref={errorModalRef} id="modal_company_error" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h4 className="font-bold text-center">Error al Actualizar Empresa</h4>
                    <p className="text-center text-error">{error}</p>
                    <div className="modal-action justify-center">
                        <button className="btn-accept" onClick={handleCloseErrorModal}>Cerrar</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default EditCompany;
