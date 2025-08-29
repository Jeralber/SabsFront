import axios from 'axios';

const axiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ❌ COMENTAR TEMPORALMENTE PARA DEBUGGING
/*
// Interceptor de respuesta para manejar errores 401
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response && error.response.status === 401 && !isRedirecting) {
      isRedirecting = true;
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        window.location.href = '/login';
        isRedirecting = false;
      }, 1000);
    }
    
    return Promise.reject(error);
  }
);
*/

export default axiosInstance;
