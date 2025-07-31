import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    // Manejo del error 401 (no autorizado)
    if (error.response && error.response.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("auth_user");

      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
      
      setTimeout(() => {
        isRedirecting = false;
      }, 3000);
    }
    
 
    if (error.response && error.response.status === 403) {

      const customError = new Error("No posees los permisos necesarios para realizar esta acción");
      customError.name = "ForbiddenError";
      customError.stack = error.stack;
      
      error.message = "No posees los permisos necesarios para realizar esta acción";
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
