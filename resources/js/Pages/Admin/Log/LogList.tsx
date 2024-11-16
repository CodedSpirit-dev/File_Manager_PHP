import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogToolbar from './LogToolbar';
import LogDetailsModal from './LogDetailsModal';
// @ts-ignore
import UAParser from 'ua-parser-js';
import {Head} from "@inertiajs/react";

interface Log {
    id: number;
    user_id: number | null;
    transaction_id: string;
    description: string;
    date: string;
    ip_address: string | null;
    user_agent: string | null;
    user_name: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    device?: string;
}

interface ParsedUserAgent {
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
}

const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const parseUserAgent = (userAgent: string | null): ParsedUserAgent => {
    if (!userAgent) {
        return {
            browser: 'N/A',
            browserVersion: '',
            os: 'N/A',
            osVersion: '',
            device: 'N/A',
        };
    }

    try {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        return {
            browser: result.browser.name || 'N/A',
            browserVersion: result.browser.version || '',
            os: result.os.name || 'N/A',
            osVersion: result.os.version || '',
            device: result.device.type
                ? `${result.device.vendor || ''} ${result.device.model || ''} (${result.device.type})`.trim()
                : 'Desktop',
        };
    } catch (error) {
        console.error('Error parsing user agent:', error);
        return {
            browser: 'N/A',
            browserVersion: '',
            os: 'N/A',
            osVersion: '',
            device: 'N/A',
        };
    }
};

const LogList: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [transactionFilter, setTransactionFilter] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [transactionOptions, setTransactionOptions] = useState<string[]>([]);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (logs.length > 0) {
            const uniqueTransactions = Array.from(new Set(logs.map((log) => log.transaction_id)));
            setTransactionOptions(uniqueTransactions);
        }
    }, [logs]);

    useEffect(() => {
        applyFilters();
    }, [logs, searchQuery, sortOrder, transactionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Log[]>('/api/logs');

            const parsedLogs = response.data.map((log) => {
                const parsedUA = parseUserAgent(log.user_agent);
                return {
                    ...log,
                    browser: parsedUA.browser,
                    browserVersion: parsedUA.browserVersion,
                    os: parsedUA.os,
                    osVersion: parsedUA.osVersion,
                    device: parsedUA.device,
                };
            });

            setLogs(parsedLogs);
        } catch (error) {
            setError('Error al cargar los registros');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let updatedLogs = [...logs];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            updatedLogs = updatedLogs.filter(
                (log) =>
                    log.description.toLowerCase().includes(query) ||
                    (log.user_name && log.user_name.toLowerCase().includes(query))
            );
        }

        if (transactionFilter) {
            updatedLogs = updatedLogs.filter(
                (log) => log.transaction_id.toLowerCase() === transactionFilter.toLowerCase()
            );
        }

        updatedLogs.sort((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        });

        setFilteredLogs(updatedLogs);
    };

    const openModal = (log: Log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedLog(null);
        setIsModalOpen(false);
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

            <Head title={'Logs'} />
            <h2 className="text-center mb-4 text-2xl font-semibold">Historial de Logs</h2>

            {/* LogToolbar */}
            <LogToolbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                transactionFilter={transactionFilter}
                setTransactionFilter={setTransactionFilter}
                transactionOptions={transactionOptions}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
            />

            <div className="overflow-x-auto">
                <table className="table w-full table-zebra">
                    <thead>
                    <tr className="text-primary-content">
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Transacción</th>
                        <th>Descripción</th>
                        <th>Fecha y Hora</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-base-200">
                            <td>{log.id}</td>
                            <td>{log.user_name || 'N/A'}</td>
                            <td>{log.transaction_id}</td>
                            <td title={log.description}>
                                {truncateText(log.description, 60)}
                            </td>
                            <td>
                                {new Date(log.date).toLocaleString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </td>
                            <td>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openModal(log)}
                                >
                                    Ver Detalles
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <LogDetailsModal
                    log={selectedLog}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default LogList;
