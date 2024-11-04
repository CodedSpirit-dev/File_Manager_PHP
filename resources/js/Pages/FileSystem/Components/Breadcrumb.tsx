// src/components/FileManager/Components/Breadcrumb.tsx

import React from 'react';

interface BreadcrumbProps {
    currentPath: string;
    onNavigateTo: (path: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigateTo }) => {
    const pathSegments = currentPath.split('/').filter(Boolean); // Segmentos de la ruta, excluyendo vacíos

    // Construcción de las rutas de cada nivel
    const handleNavigate = (index: number) => {
        const path = pathSegments.slice(0, index + 1).join('/') || 'public';
        onNavigateTo(path);
    };

    return (
        <nav className="breadcrumbs font-black">
            <ul className="bg-base-100 m-0 px-4 py-4 font-black shadow-sm rounded-t-lg text-sm sm:text-base md:text-lg lg:text-xl">
                <li>
                    <button
                        onClick={() => onNavigateTo('public')}
                        className="hover:underline flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                        </svg>
                        Home
                    </button>
                </li>
                {pathSegments.map((segment, index) => (
                    <li key={index}>
                        <button
                            onClick={() => handleNavigate(index)}
                            className={`text-primary-content font-medium hover:underline ${
                                index === pathSegments.length - 1
                                    ? 'text-neutral-content'
                                    : 'text-primary hover:underline'
                            }`}
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
