import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/organisms/LoginForm";
import { Navigate } from "react-router-dom";

export const LoginPage = () => {
  const { user, isLoading } = useAuth();

  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/fondo.png')" }}
    >
      <div className="bg-white rounded-2xl shadow-xl flex flex-col lg:flex-row overflow-hidden w-full max-w-5xl">
        {/* Lado izquierdo con imagen ilustrativa */}
        <div className="lg:w-1/2 w-full bg-white flex items-center justify-center p-8">
          <img
            src="/logo.png"
            alt="SABS Ilustración"
            className="w-full max-w-sm lg:max-w-md"
          />
        </div>

        {/* Lado derecho con el formulario */}
        <div className="lg:w-1/2 w-full p-8 flex flex-col justify-center bg-white">
          <h1 className="text-2xl font-bold text-center text-green-600">SABS</h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Sistema Administrativo de Bodega Sena
          </p>

          <LoginForm />

          <div className="mt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SABS - Sistema de Administración de Bodega
          </div>
        </div>
      </div>
    </div>
  );
};
