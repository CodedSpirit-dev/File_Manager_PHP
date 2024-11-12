// src/Pages/Admin/Position/positionApi.ts

import axios from 'axios';
import { Position } from '@/types';

export const getPositions = async (): Promise<Position[]> => {
    const response = await axios.get('/admin/positions');
    return response.data;
};

export const deletePosition = async (id: number): Promise<void> => {
    await axios.delete(`/admin/positions/${id}`);
};

export const getPositionCounts = async (id: number): Promise<{ employees_count: number }> => {
    const response = await axios.get(`/admin/positions/${id}/counts`);
    return response.data;
};

// Puedes agregar otras funciones como crear, editar, etc.
