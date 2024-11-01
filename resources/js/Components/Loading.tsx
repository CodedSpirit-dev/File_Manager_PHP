// src/components/Loading.tsx

import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
    );
};

export default Loading;
