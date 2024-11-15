// src/components/CompanyBadge.tsx

import React from 'react';

interface CompanyBadgeProps {
    companyName: string;
}

// Mapeo de nombres de compañías a clases de Tailwind CSS y color de texto
const companyStyles: {
    [key: string]: {
        backgroundClass: string;
        textColor: string;
    };
} = {
    'Dicatho': { backgroundClass: 'bg-dicatho', textColor: 'text-white' },
    'Pachinos': { backgroundClass: 'bg-pachinos', textColor: 'text-white' },
    'CEPAC': { backgroundClass: 'bg-cepac', textColor: 'text-white' },
    'VSP': { backgroundClass: 'bg-vsp', textColor: 'text-white' },
    'La Penitencia': { backgroundClass: 'bg-penitencia', textColor: 'text-black' },
};

// Función para obtener las clases basadas en el nombre de la compañía
const getCompanyStyles = (companyName: string): { backgroundClass: string; textColor: string } => {
    return companyStyles[companyName] || { backgroundClass: 'bg-secondary', textColor: 'text-secondary-content' };
};

const CompanyBadge: React.FC<CompanyBadgeProps> = ({ companyName }) => {
    const { backgroundClass, textColor } = getCompanyStyles(companyName);
    return (
        <span className={`mt-1 inline-block ${backgroundClass} ${textColor} text-xs px-2 py-1 rounded`}>
            {companyName}
        </span>
    );
};

export default CompanyBadge;
