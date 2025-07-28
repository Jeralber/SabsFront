import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionGuardProps {
  requiredRole: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredRole,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();
  
  if (!user) return fallback;
  
  const userRole = user.usuario.rol;
  

  const hasPermission = Array.isArray(requiredRole)
    ? requiredRole.includes(userRole)
    : userRole === requiredRole;
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};