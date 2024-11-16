import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Deshabilitar F12, clic derecho y combinaciones de teclas para inspección
document.addEventListener('keydown', (event) => {
    // Deshabilitar F12
    if (event.key === 'F12') {
        event.preventDefault();
    }

    // Deshabilitar Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C y Ctrl+U
    if ((event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key)) || (event.ctrlKey && event.key === 'U')) {
        event.preventDefault();
    }
});

// Deshabilitar clic derecho
document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
