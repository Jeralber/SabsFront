import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // Importar desde el contexto

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};