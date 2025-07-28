import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Agregar interceptor de solicitud para manejar tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("auth_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error al procesar el token:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRedirecting = false;

// Interceptor de respuesta para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    if (error.response && error.response.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("auth_user");

      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
      
      // Aumentar el tiempo para evitar problemas con redirecciones múltiples
      setTimeout(() => {
        isRedirecting = false;
      }, 3000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
