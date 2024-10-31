import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const getFiles = async (path = 'public') => {
    const response = await axios.get(`/files`, {
        params: { path }
    });
    return response.data;
};


export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`/files/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const deleteFile = async (filename) => {
    const response = await axios.delete(`/files/delete/${filename}`);
    return response.data;
};


export const createFolder = async (folderName, path = 'public') => {
    const response = await axios.post(`/files/createfolder`, {
        folder_name: folderName,
        path
    });

    return response.data;
};

export const getUserHierarchy = async () => {
    const response = await axios.get('/user/hierarchy');
    return response.data;
};
