import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Timer: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutos en segundos

    useEffect(() => {
        // Función para manejar interacciones del usuario
        const resetTimer = () => setTimeLeft(300);

        // Listeners para detectar actividad del usuario
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);

        // Intervalo para contar el tiempo
        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup de efectos
        return () => {
            clearInterval(timerId);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
        };
    }, []);

    // Función para manejar el logout
    const handleLogout = () => {
        axios.post('/logout').finally(() => {
            window.location.href = '/login';
        });
    };

    // Convertir tiempo restante a formato mm:ss
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="text-gray-700">
            {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;
