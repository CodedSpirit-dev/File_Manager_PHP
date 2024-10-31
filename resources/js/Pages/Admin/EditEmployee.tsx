import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { Position, Permission, Company } from '@/types';

interface EditEmployeeProps {
    employee: {
        id: number;
        first_name: string;
        last_name_1: string;
        last_name_2?: string;
        username: string;
        position_id: number;
        company_id: number;
    };
    positions: Position[];
    companies: Company[];
    onClose: () => void;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({ employee, positions, companies, onClose }) => {
    const { control, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm({
        mode: 'onChange',
        defaultValues: {
            first_name: employee.first_name,
            last_name_1: employee.last_name_1,
            last_name_2: employee.last_name_2 || '',
            username: employee.username,
            position_id: employee.position_id,
            company_id: employee.company_id,
            password: '',
            password_confirmation: '',
            enable_permissions: false,
            selected_permissions: [] as number[]
        }
    });

    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
    const [step, setStep] = useState(1); // Estado para manejar los pasos
    const [modalSuccess, setModalSuccess] = useState(false);
    const [modalError, setModalError] = useState(false);

    const watchCompany = watch('company_id');
    const watchEnablePermissions = watch('enable_permissions');

    useEffect(() => {
        axios.get('/api/permissions')
            .then(response => setPermissions(response.data))
            .catch(error => console.error('Error al cargar los permisos', error));
    }, []);

    useEffect(() => {
        // Filtrar posiciones basadas en la empresa seleccionada
        const filteredPosition = positions.filter(position => position.company_id === Number(watchCompany));
        setFilteredPositions(filteredPosition);
        setValue('position_id', 0); // Reiniciar el puesto seleccionado
    }, [watchCompany, positions]);

    const handlePermissionChange = (permissionId: number) => {
        const currentPermissions = getValues('selected_permissions') as number[];

        if (currentPermissions.includes(permissionId)) {
            setValue('selected_permissions', currentPermissions.filter(id => id !== permissionId));
        } else {
            setValue('selected_permissions', [...currentPermissions, permissionId]);
        }
    };

    const onSubmit = (data: any) => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // Enviar datos al backend
            const payload = {
                ...data,
                position_id: data.position_id,
                company_id: data.company_id,
            };

            axios.patch(`/admin/employees/${employee.id}`, payload)
                .then(response => {
                    const employeeId = response.data.id;

                    // Si se habilitan permisos, enviarlos
                    if (data.enable_permissions) {
                        axios.post('/api/userpermissions', {
                            employee_id: employeeId,
                            permissions: data.selected_permissions
                        })
                            .then(() => {
                                setModalSuccess(true);
                                setStep(1); // Reiniciar el paso
                            })
                            .catch(error => {
                                console.error('Error al asignar permisos', error);
                                setModalError(true);
                            });
                    } else {
                        setModalSuccess(true);
                        setStep(1); // Reiniciar el paso
                    }
                })
                .catch(error => {
                    console.error('Error al actualizar el empleado', error);
                    setModalError(true);
                });
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Editar Empleado</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Paso 1: Datos del empleado */}
                    {step === 1 && (
                        <>
                            <div className="mt-4">
                                <label>Nombre(s)</label>
                                <Controller
                                    name="first_name"
                                    control={control}
                                    rules={{
                                        required: 'El nombre es obligatorio',
                                        maxLength: { value: 50, message: 'El nombre no debe exceder los 50 caracteres' },
                                        pattern: { value: /^[a-zA-ZÀ-ÿ\s]+$/, message: 'El nombre solo puede contener letras' }
                                    }}
                                    render={({ field }) => (
                                        <input {...field} className="input__data__entry" placeholder="Nombre(s)" />
                                    )}
                                />
                                {errors.first_name && <p className="text-red-600">{errors.first_name.message}</p>}
                            </div>

                            <div className="mt-4">
                                <label>Primer apellido</label>
                                <Controller
                                    name="last_name_1"
                                    control={control}
                                    rules={{ required: 'El primer apellido es obligatorio' }}
                                    render={({ field }) => (
                                        <input {...field} className="input__data__entry" placeholder="Primer apellido" />
                                    )}
                                />
                                {errors.last_name_1 && <p className="text-red-600">{errors.last_name_1.message}</p>}
                            </div>

                            <div className="mt-4">
                                <label>Segundo apellido</label>
                                <Controller
                                    name="last_name_2"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} className="input__data__entry" placeholder="Segundo apellido" />
                                    )}
                                />
                            </div>

                            <div className="mt-4">
                                <label>Nombre de usuario (CURP)</label>
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{
                                        required: 'El nombre de usuario es obligatorio',
                                        maxLength: { value: 18, message: 'El nombre de usuario no debe exceder los 18 caracteres' }
                                    }}
                                    render={({ field }) => (
                                        <input {...field} className="input__data__entry" placeholder="Nombre de usuario (CURP)" />
                                    )}
                                />
                                {errors.username && <p className="text-red-600">{errors.username.message}</p>}
                            </div>

                            <div className="mt-4">
                                <label>Empresa</label>
                                <Controller
                                    name="company_id"
                                    control={control}
                                    rules={{ required: 'La empresa es obligatoria' }}
                                    render={({ field }) => (
                                        <select {...field} className="input__data__entry">
                                            <option value="">Seleccione una empresa</option>
                                            {companies.map(company => (
                                                <option key={company.id} value={company.id}>{company.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.company_id && <p className="text-red-600">{errors.company_id.message}</p>}
                            </div>

                            <div className="mt-4">
                                <label>Puesto</label>
                                <Controller
                                    name="position_id"
                                    control={control}
                                    rules={{ required: 'El puesto es obligatorio' }}
                                    render={({ field }) => (
                                        <select {...field} className="input__data__entry" disabled={watch('company_id') === null}>
                                            <option value="">Seleccione un puesto</option>
                                            {filteredPositions.map(position => (
                                                <option key={position.id} value={position.id}>{position.name}</option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.position_id && <p className="text-red-600">{errors.position_id.message}</p>}
                            </div>

                            <div className="mt-4">
                                <label>Contraseña (opcional)</label>
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} type="password" className="input__data__entry" placeholder="Contraseña (dejar vacío si no desea cambiar)" />
                                    )}
                                />
                            </div>

                            <div className="mt-4">
                                <label>Confirmar contraseña (opcional)</label>
                                <Controller
                                    name="password_confirmation"
                                    control={control}
                                    render={({ field }) => (
                                        <input {...field} type="password" className="input__data__entry" placeholder="Confirmar contraseña" />
                                    )}
                                />
                            </div>

                            <div className="modal-action">
                                <button type="button" className="btn" onClick={() => setStep(step + 1)}>
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )}

                    {/* Paso 2: Asignación de permisos */}
                    {step === 2 && (
                        <>
                            <div className="mt-4">
                                <label htmlFor="enable_permissions">Habilitar permisos</label>
                                <Controller
                                    name="enable_permissions"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            className="ml-2 checkbox checkbox-primary"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    )}
                                />
                            </div>

                            {watchEnablePermissions && (
                                <div className="mt-6">
                                    <label className="mb-3 text-xl text-center font-black block">Permisos</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissions.map(permission => (
                                            <label key={permission.id} className="flex items-center my-2">
                                                <input
                                                    type="checkbox"
                                                    checked={getValues('selected_permissions').includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)}
                                                    className="checkbox checkbox-primary mr-2"
                                                />
                                                <span>{permission.permission_description}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-center">
                                <button type="button" className="btn size-2/4 mr-1" onClick={() => setStep(step - 1)}>
                                    Anterior
                                </button>
                                <button type="submit" className="btn size-2/4 ml-1">
                                    Guardar
                                </button>
                            </div>
                        </>
                    )}
                </form>

                {/* Modal de éxito */}
                {modalSuccess && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">¡Empleado actualizado con éxito!</h3>
                            <div className="modal-action">
                                <button className="btn btn-primary" onClick={() => { setModalSuccess(false); onClose(); }}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de error */}
                {modalError && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">Error al actualizar el empleado</h3>
                            <div className="modal-action">
                                <button className="btn btn-primary" onClick={() => setModalError(false)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditEmployee;
