import axios from "@/lib/axios";

// Interfaz ajustada para coincidir con DTO del backend
export interface PasswordRecoveryRequest {
  correo: string;
  identificacion: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export const passwordRecoveryService = {
  // Función requestReset ajustada
  requestReset: async (request: PasswordRecoveryRequest): Promise<{ message: string }> => {
    try {
      const response = await axios.post("/auth/password-recovery/request", request);
      console.log('Solicitud enviada:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      throw error;
    }
  },

  // Nueva función requestPasswordReset
  async requestPasswordReset(correo: string, identificacion: string) {
    const response = await axios.post('/auth/password-recovery/request', { correo, identificacion });
    return response.data; // { message, token }
  },

  // Verificar token de recuperación
  verifyToken: async (token: string): Promise<{ valid: boolean; correo?: string }> => {
    try {
      const response = await axios.get(`/auth/password-recovery/verify/${token}`);
      return response.data;
    } catch (error) {
      console.error("Error al verificar token:", error);
      throw error;
    }
  },

  // Método actualizado para resetPassword con token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await axios.post("/auth/password-recovery/reset", {
        token,
        nuevaContrasena: newPassword
      });
      return response.data;
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      throw error;
    }
  }
};