// resources/js/axiosConfig.ts
import axios from 'axios';

// Obtener el token CSRF del meta tag
const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

if (token) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

// Configurar Axios para enviar cookies
axios.defaults.withCredentials = true;

export default axios;
