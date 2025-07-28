import { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/auth";
import { authService } from "@/services/authService";


interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        console.log("No hay usuario autenticado o error al obtener usuario");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      // No necesitamos retornar nada aquí, ya que el estado se actualiza con setUser
    } catch (error) {
      console.error("Error durante el login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error durante el logout:", error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
