import { useCallback } from 'react';
import { addToast } from '@heroui/react';

export const useToast = () => {
  const showSuccess = useCallback((message: string) => {
    addToast({
      title: 'Éxito',
      description: message,
      color: 'success', // Cambiar de 'status' a 'color'
    });
  }, []);

  const showError = useCallback((message: string) => {
    addToast({
      title: 'Error',
      description: message,
      color: 'danger', // Cambiar de 'status' a 'color' y usar 'danger' en lugar de 'error'
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    addToast({
      title: 'Advertencia',
      description: message,
      color: 'warning', // Cambiar de 'statusColor' a 'color'
      
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    addToast({
      title: 'Información',
      description: message,
      color: 'primary', // Cambiar de 'statusColor' a 'color' y usar 'primary' en lugar de 'info'
    });
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};