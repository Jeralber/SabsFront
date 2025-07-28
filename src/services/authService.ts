// src/services/authService.ts
import axios from "@/lib/axios";
import { LoginDto, User } from "@/types/auth";

const USER_KEY = "auth_user";

export const authService = {
  login: async (credentials: LoginDto): Promise<User> => {
    const backendCredentials = {
      correo: credentials.email,
      contrasena: credentials.password
    };
    
    console.log("Enviando credenciales adaptadas:", backendCredentials);
    
    try {
      const res = await axios.post("/auth/login", backendCredentials, {
        withCredentials: true,
      });
      
      console.log("Respuesta del servidor:", res.data);
      
      // Extraer los datos del usuario de la respuesta
      let serverUserData = res.data.user || res.data;
      
      // Crear un objeto que cumpla con la interfaz User
      let userData: User = {
        token: serverUserData.token || "",
        usuario: {
          id: serverUserData.id || 0,
          nombre: serverUserData.nombre || "",
          email: serverUserData.email || serverUserData.correo || "",
          rol: serverUserData.rol || "",
          permisos: serverUserData.permisos || []
        }
      };
      
      // Si el servidor ya devuelve la estructura correcta, usarla directamente
      if (serverUserData.usuario && serverUserData.usuario.nombre) {
        userData = serverUserData;
      }
      // Si el servidor devuelve una estructura anidada diferente
      else if (serverUserData.user && serverUserData.user.nombre) {
        userData = {
          token: serverUserData.token || "",
          usuario: serverUserData.user
        };
      }
      
      console.log("Datos de usuario adaptados:", userData);
      
      // Verificar que la estructura sea válida antes de guardarla
      if (!userData.usuario || !userData.usuario.nombre) {
        console.error("No se pudo adaptar la respuesta a la estructura esperada:", serverUserData);
        throw new Error("La respuesta del servidor no tiene la estructura esperada");
      }
      
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem(USER_KEY);

    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.warn(
        "Error en logout API, pero el usuario fue eliminado localmente",
        error
      );
    }
  },

  me: async (): Promise<User> => {
    const userData = localStorage.getItem(USER_KEY);

    if (!userData) {
      throw new Error("No hay usuario autenticado");
    }

    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Error parsing user data', e);
      localStorage.removeItem(USER_KEY);
      throw new Error("Error al procesar datos del usuario");
    }
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data', e);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(USER_KEY);
  },
};
