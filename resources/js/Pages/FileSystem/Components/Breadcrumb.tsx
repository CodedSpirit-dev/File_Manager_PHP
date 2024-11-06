// src/components/FileManager/Components/Breadcrumb.tsx

import React from 'react';

interface BreadcrumbProps {
    currentPath: string;
    onNavigateTo: (path: string) => void;
    hierarchyLevel: number;
    companyName: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigateTo, hierarchyLevel, companyName }) => {
    const pathSegments = currentPath.split('/').filter(Boolean); // Segmentos de la ruta, excluyendo vacíos

    // Determina qué segmentos se muestran en el breadcrumb
    const displaySegments = hierarchyLevel > 0
        ? pathSegments.filter((segment) => segment !== 'public')
        : pathSegments;

    // Función para navegar a una ruta específica
    const handleNavigate = (index: number) => {
        const path = displaySegments.slice(0, index + 1).join('/') || 'public';
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
                        <svg className="w-5 h-5 mr-2 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                        </svg>
                        Home
                    </button>
                </li>
                {/* Segmentos de la ruta (ej. SGI y subdirectorios) */}
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
