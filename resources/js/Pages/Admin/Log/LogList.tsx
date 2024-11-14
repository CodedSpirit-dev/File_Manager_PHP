// src/components/LogList.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogToolbar from './LogToolbar';

interface Log {
    id: number;
    user_id: number | null; // Actualizado para permitir null
    transaction_id: string;
    description: string;
    date: string;
    ip_address: string | null;
    user_agent: string | null;
    user_name?: string;
}

const LogList: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for Toolbar
    const [searchQuery, setSearchQuery] = useState('');
    const [transactionFilter, setTransactionFilter] = useState('');

    // Ordenamiento por columnas
    const [sortConfig, setSortConfig] = useState<{ key: keyof Log; direction: 'asc' | 'desc' }>({
        key: 'date',
        direction: 'desc',
    });

    // Opciones de filtro de transacción
    const [transactionOptions, setTransactionOptions] = useState<string[]>([]);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            const uniqueTransactions = Array.from(new Set(logs.map(log => log.transaction_id)));
            setTransactionOptions(uniqueTransactions);
        }
    }, [logs]);

    useEffect(() => {
        applyFilters();
    }, [logs, searchQuery, sortConfig, transactionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Log[]>('/api/logs');
            setLogs(response.data);
        } catch (error) {
            setError('Error al cargar los registros');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let updatedLogs = [...logs];

        // Filtrar por búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            updatedLogs = updatedLogs.filter(
                (log) =>
                    log.description.toLowerCase().includes(query) ||
                    (log.user_name && log.user_name.toLowerCase().includes(query))
            );
        }

        // Filtrar por transacción
        if (transactionFilter) {
            updatedLogs = updatedLogs.filter(
                (log) => log.transaction_id.toLowerCase() === transactionFilter.toLowerCase()
            );
        }

        // Ordenar por la configuración de sortConfig
        updatedLogs.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'user_name') {
                // Usar 'user_name' o 'user_id' como fallback
                aValue = a.user_name ? a.user_name.toLowerCase() : (a.user_id !== null && a.user_id !== undefined ? a.user_id.toString() : '');
                bValue = b.user_name ? b.user_name.toLowerCase() : (b.user_id !== null && b.user_id !== undefined ? b.user_id.toString() : '');
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            } else if (sortConfig.key === 'date') {
                // Convertir a objetos Date para comparar
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            } else {
                // Otros campos
                aValue = a[sortConfig.key];
                bValue = b[sortConfig.key];
                if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredLogs(updatedLogs);
    };

    const handleSort = (key: keyof Log) => {
        setSortConfig((prevConfig) => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-base-100">
                <span className="loading loading-dots loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-error">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-base-100">
            <h2 className="text-center mb-4 text-2xl font-semibold">Historial de Logs</h2>

            {/* Toolbar Component */}
            <LogToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                transactionFilter={transactionFilter}
                setTransactionFilter={setTransactionFilter}
                transactionOptions={transactionOptions}
                sortOrder={sortConfig.direction}
                setSortOrder={(direction) => setSortConfig((prev) => ({ ...prev, direction }))}
            />

            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                    <tr className="text-primary-content">
                        <th
                            className="px-4 py-2 text-center cursor-pointer"
                            onClick={() => handleSort('id')}
                        >
                            ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                            className="px-4 py-2 text-center cursor-pointer"
                            onClick={() => handleSort('user_name')}
                        >
                            Usuario {sortConfig.key === 'user_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                            className="px-4 py-2 text-center cursor-pointer"
                            onClick={() => handleSort('transaction_id')}
                        >
                            Transacción {sortConfig.key === 'transaction_id' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                            className="px-4 py-2 text-center cursor-pointer"
                            onClick={() => handleSort('description')}
                        >
                            Descripción {sortConfig.key === 'description' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th
                            className="px-4 py-2 text-center cursor-pointer"
                            onClick={() => handleSort('date')}
                        >
                            Fecha y Hora {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                        </th>
                        <th className="px-4 py-2 text-center">IP Address</th>
                        <th className="px-4 py-2 text-center">User Agent</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-base-200">
                                <td className="border px-4 py-2 text-center">{log.id}</td>
                                <td className="border px-4 py-2 text-center">{log.user_name || log.user_id}</td>
                                <td className="border px-4 py-2 text-center">{log.transaction_id}</td>
                                <td className="border px-4 py-2 text-center">{log.description}</td>
                                <td className="border px-4 py-2 text-center">
                                    {new Date(log.date).toLocaleString('es-ES', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    })}
                                </td>
                                <td className="border px-4 py-2 text-center">{log.ip_address || 'N/A'}</td>
                                <td className="border px-4 py-2 text-center">{log.user_agent || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={7} className="text-center py-4">
                                No hay registros para mostrar.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );

};

export default LogList;
