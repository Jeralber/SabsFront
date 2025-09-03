import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';


interface UserPermissions {
  canAccess: (module: string) => boolean;
  canView: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => {
    if (!user?.usuario?.permisos) {
      return [];
    }
    return user.usuario.permisos;
  }, [user]);

  const userRole = useMemo(() => {
    return user?.usuario?.rol?.toLowerCase() || '';
  }, [user]);

  const canAccess = (module: string): boolean => {
    // Admin tiene acceso a todo
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }

    // Verificar permisos específicos del módulo
    return userPermissions.some(permission => 
      permission.toLowerCase().includes(module.toLowerCase())
    );
  };

  const canView = (module: string): boolean => {
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }
    return userPermissions.includes(`${module}.view`) || 
           userPermissions.includes(`${module}.read`);
  };

  const canCreate = (module: string): boolean => {
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }
    return userPermissions.includes(`${module}.create`);
  };

  const canEdit = (module: string): boolean => {
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }
    return userPermissions.includes(`${module}.edit`) || 
           userPermissions.includes(`${module}.update`);
  };

  const canDelete = (module: string): boolean => {
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }
    return userPermissions.includes(`${module}.delete`);
  };

  const hasPermission = (permission: string): boolean => {
    if (userRole === 'admin' || userRole === 'administrador') {
      return true;
    }
    return userPermissions.includes(permission);
  };

  return {
    canAccess,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasPermission
  };
};