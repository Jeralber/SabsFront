import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Button } from "@/components/atoms/Button";
import { ArrowLeft, Mail, User, Send, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { passwordRecoveryService } from "@/services/passwordRecoveryService";

interface PasswordRecoveryFormProps {
  onBackToLogin: () => void;
}

export const PasswordRecoveryForm = ({ onBackToLogin }: PasswordRecoveryFormProps) => {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<'request' | 'changePassword' | 'success'>('request');
  const [correo, setCorreo] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Corregir useParams - usar 'token' en lugar de 'resetToken'
  const { token: tokenFromURL } = useParams();
  
  // Corregir useEffect - depender de tokenFromURL y asignar al estado token
  useEffect(() => {
    // Agregar después de la línea 26
    useEffect(() => {
      console.log('=== DEBUG TOKEN ===');
      console.log('Current URL:', window.location.href);
      console.log('URL pathname:', window.location.pathname);
      console.log('Token from URL:', tokenFromURL);
      console.log('useParams result:', useParams());
      console.log('==================');
      
      if (tokenFromURL) {
        console.log('Token found, setting step to changePassword');
        setToken(tokenFromURL);
        setStep('changePassword');
        verifyTokenValidity(tokenFromURL);
      } else {
        console.log('No token found in URL');
      }
    }, [tokenFromURL]);
    if (tokenFromURL) {
      console.log('Token found, setting step to changePassword');
      setToken(tokenFromURL); // Asignar el token al estado
      setStep('changePassword');
      verifyTokenValidity(tokenFromURL); // Pasar el token directamente
    } else {
      console.log('No token found in URL');
    }
  }, [tokenFromURL]); // Cambiar dependencia a tokenFromURL

  const verifyTokenValidity = async (tokenToVerify?: string) => {
    const tokenToUse = tokenToVerify || token;
    if (!tokenToUse) return;
    
    try {
      setIsLoading(true);
      await passwordRecoveryService.verifyToken(tokenToUse);
    } catch (error) {
      setError('Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await passwordRecoveryService.requestReset({
        correo,
        identificacion
      });
      
      setStep('changePassword');
    } catch (error: any) {
      setError(error.message || "Error al verificar los datos. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setIsLoading(true);
    try {
      const response = await passwordRecoveryService.requestPasswordReset(correo, identificacion);
      setSuccess(response.message);
      if (response.token) {

        setResetToken(response.token);
        setStep('changePassword'); 
      } else {
        setStep('success');
      }
    } catch (err) {
      setError('Error en la solicitud. Verifica los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    // Usa 'resetToken' en lugar de useParams token
    const tokenToUse = resetToken || token;
    console.log('Token to use:', tokenToUse); // Debug logging
    console.log('resetToken:', resetToken, 'URL token:', token); // Debug logging
    
    if (!tokenToUse) {
      console.error('No token available'); // Debug logging
      setError('Token no disponible. Por favor, solicita un nuevo enlace de recuperación.');
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      await passwordRecoveryService.resetPassword(tokenToUse, newPassword);
      setSuccess('Contraseña restablecida exitosamente.');
      setStep('success');
    } catch (err) {
      console.error('Error resetting password:', err); // Debug logging
      setError('Error al restablecer la contraseña. Token inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              ¡Contraseña Cambiada!
            </h3>
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Button 
              onClick={onBackToLogin}
              variant="secondary"
              className="w-full py-3 text-base font-medium transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ir al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'changePassword') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Nueva Contraseña
            </h3>
            <p className="text-green-100 text-sm leading-relaxed">
              {token ? 'Ingresa tu nueva contraseña' : 'Ingresa tu nueva contraseña para completar la recuperación'}
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Error
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 text-white border-0"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Cambiando contraseña...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Cambiar Contraseña
                    </>
                  )}
                </Button>

                {!token && (
                  <Button 
                    type="button"
                    onClick={() => setStep('request')}
                    variant="secondary"
                    className="w-full py-3 text-base font-medium transition-all duration-200 hover:scale-[1.02] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Recuperar Contraseña
          </h3>
          <p className="text-green-100 text-sm leading-relaxed">
            Ingresa tu información para verificar tu identidad
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleVerifyUser} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                      Error en la verificación
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="tu.correo@ejemplo.com"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número de Identificación
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="12345678"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !correo || !identificacion}
                className="w-full py-3 text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 text-white border-0"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Verificar Datos
                  </>
                )}
              </Button>

              <Button 
                type="button"
                onClick={onBackToLogin}
                variant="secondary"
                className="w-full py-3 text-base font-medium transition-all duration-200 hover:scale-[1.02] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};