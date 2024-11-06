// src/components/FileManager/Components/Breadcrumb.tsx

import React from 'react';

interface BreadcrumbProps {
    currentPath: string;
    onNavigateTo: (path: string) => void;
    hierarchyLevel: number;
    companyName: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
                                                   currentPath,
                                                   onNavigateTo,
                                                   hierarchyLevel,
                                                   companyName,
                                               }) => {
    const pathSegments = currentPath.split('/').filter(Boolean); // Segmentos de la ruta, excluyendo vacíos

    // Determinar los segmentos a mostrar en el breadcrumb
    let displaySegments: string[];
    let offset = 0; // Para ajustar los índices al navegar

    if (hierarchyLevel > 0) {
        // Excluir 'public' y 'companyName' de los segmentos mostrados
        displaySegments = pathSegments.slice(2);
        offset = 2;
    } else {
        displaySegments = pathSegments;
        offset = 0;
    }

    // Función para navegar a una ruta específica
    const handleNavigate = (index: number) => {
        // Construir la ruta completa incluyendo los segmentos omitidos
        const segmentsToNavigate = pathSegments.slice(0, index + 1 + offset);
        const path = segmentsToNavigate.join('/') || 'public';
        onNavigateTo(path);
    };

    return (
        <nav className="breadcrumbs font-black">
            <ul className="bg-base-100 m-0 px-4 py-4 font-black shadow-sm rounded-t-lg text-sm sm:text-base md:text-lg lg:text-xl">
                {/* Botón Home */}
                <li>
                    <button
                        onClick={() =>
                            hierarchyLevel === 0
                                ? onNavigateTo('public')
                                : onNavigateTo(`public/${companyName}`)
                        }
                        className="hover:underline flex items-center"
                    >
                        <svg
                            className="w-5 h-5 mr-2 inline"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M19.707 9.293l-2-2-7-7a1 1 0 00-1.414 0l-7 7-2 2a1 1 0 001.414 1.414L2 10.414V18a2 2 0 002 2h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a2 2 0 002-2v-7.586l.293.293a1 1 0 001.414-1.414z" />
                        </svg>
                        Inicio
                    </button>
                </li>
                {/* Segmentos de la ruta */}
                {displaySegments.map((segment, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleNavigate(index)}
                            className="text-primary-content font-medium hover:underline"
                        >
                            {segment}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Breadcrumb;
