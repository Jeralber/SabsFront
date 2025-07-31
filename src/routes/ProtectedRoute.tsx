import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  module?: string;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  module,
  fallbackPath = '/'
}) => {
  const { user } = useAuth();
  const { hasPermission, canAccess } = usePermissions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user.usuario.rol?.toLowerCase() === 'admin' || 
                  user.usuario.rol?.toLowerCase() === 'administrador';

  // Admin tiene acceso a todo
  if (isAdmin) {
    return <>{children}</>;
  }

  // Verificar permiso específico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Verificar acceso por módulo
  if (module && !canAccess(module)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-500">No tienes permisos para acceder a este módulo.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};