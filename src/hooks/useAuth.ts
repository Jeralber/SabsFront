import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { LoginDto, User } from "@/types/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar la sesión al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener el usuario del localStorage a través del servicio
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {
        // Si hay un error, simplemente establecer el usuario como null
        // No es necesario registrar el error en la consola ya que es un comportamiento esperado
        // cuando no hay usuario autenticado
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const loginMutation = useMutation<User, Error, LoginDto>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data);
    },
  });

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Error durante el cierre de sesión:", error);
      // Asegurarse de que el usuario se establezca como null incluso si hay un error
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    loginStatus: loginMutation.status,
    loginError: loginMutation.error,
    loginIsPending: loginMutation.isPending,
    logout
  };
};
