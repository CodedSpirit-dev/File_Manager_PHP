import axios from 'axios';

const API_BASE_URL = '/admin/companies';
axios.defaults.withCredentials = true;

export interface Company {
    id: number;
    name: string;
    // Otros campos según tu modelo
}

// Función para manejar errores
const handleError = (error: any) => {
    throw error;
};


// Obtener la lista de empresas
export const getCompanies = async (): Promise<Company[] | undefined> => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        handleError(error);
        return undefined;
    }
};

// Crear una nueva empresa
export const createCompany = async (companyData: { name: string }): Promise<Company | undefined> => {
    try {
        const response = await axios.post(API_BASE_URL, companyData);
        return response.data.company;
    } catch (error) {
        handleError(error);
        return undefined;
    }
};

// Obtener datos de una empresa específica
export const getCompany = async (id: number): Promise<Company | undefined> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}/edit`);
        return response.data.company;
    } catch (error) {
        handleError(error);
        return undefined;
    }
};

// Actualizar una empresa
export const updateCompany = async (id: number, companyData: { name: string }): Promise<Company | undefined> => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, companyData);
        return response.data.company;
    } catch (error) {
        handleError(error);
        return undefined;
    }
};

// Eliminar una empresa
export const deleteCompany = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
        handleError(error);
    }
};
