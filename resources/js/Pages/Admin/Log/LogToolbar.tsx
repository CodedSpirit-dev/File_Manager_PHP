// src/components/LogToolbar.tsx

import React from 'react';

interface LogToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    transactionFilter: string;
    setTransactionFilter: (filter: string) => void;
    transactionOptions: string[];
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

const LogToolbar: React.FC<LogToolbarProps> = ({
                                                   searchQuery,
                                                   setSearchQuery,
                                                   transactionFilter,
                                                   setTransactionFilter,
                                                   transactionOptions,
                                                   sortOrder,
                                                   setSortOrder,
                                               }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            {/* Búsqueda */}
            <input
                type="text"
                placeholder="Buscar por descripción o usuario"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full md:w-1/3"
            />

            {/* Filtro de Transacción */}
            <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="select select-bordered w-full md:w-1/4"
            >
                <option value="">Todas las Transacciones</option>
                {transactionOptions.map((transaction) => (
                    <option key={transaction} value={transaction}>
                        {transaction}
                    </option>
                ))}
            </select>

            {/* Ordenamiento */}
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="select select-bordered w-full md:w-1/4"
            >
                <option value="desc">Fecha Descendente</option>
                <option value="asc">Fecha Ascendente</option>
            </select>
        </div>
    );
};

export default LogToolbar;
