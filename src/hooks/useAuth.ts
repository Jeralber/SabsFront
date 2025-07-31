import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { LoginDto, User } from "@/types/auth";
import { useEffect, useState } from "react";
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
       
        const userData = await authService.me();
        setUser(userData);
      } catch (error) {

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
