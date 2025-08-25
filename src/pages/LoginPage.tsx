import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/organisms/LoginForm";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Imágenes de fondo verificadas que existen en public
  const backgroundImages = [
    '/imagen1.png',
    '/imagen2.jpg', 
    '/imagen3.jpeg',
    '/imagen4.webp',
    '/imagen5.jpg'
  ];

  // Precargar imágenes para evitar parpadeos
  useEffect(() => {
    const preloadImages = () => {
      backgroundImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
  }, []);

  // Efecto para cambiar automáticamente las imágenes cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % backgroundImages.length;
        setImageLoaded(false); // Reset para la nueva imagen
        setImageError(false);
        return nextIndex;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo base con gradiente vibrante - siempre visible */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 animate-gradient-x" />
      
      {/* Imagen de fondo con manejo de errores mejorado */}
      <div className="absolute inset-0">
        <img
          src={backgroundImages[currentImageIndex]}
          alt="Background"
          className={`w-full h-full object-cover transition-all duration-1000 ${
            imageLoaded && !imageError 
              ? 'opacity-70 blur-sm scale-105' 
              : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            filter: imageLoaded && !imageError ? 'blur(2px) brightness(0.8)' : 'none',
            transform: imageLoaded && !imageError ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        
        {/* Overlay adicional para mejor contraste */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>
      
      {/* Contenido principal con backdrop blur mejorado */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden w-full max-w-5xl border border-white/20">
        {/* Panel izquierdo - Logo */}
        <div className="lg:w-1/2 w-full bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-8 lg:p-12">
          <div className="text-center space-y-6">
            <img
              src="/logo.png"
              alt="SABS Logo"
              className="w-full max-w-sm lg:max-w-md drop-shadow-xl mx-auto transition-transform hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                SABS
              </h1>
              <p className="text-gray-600 text-sm lg:text-base font-medium">
                Sistema Administrativo de Bodega SENA
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario */}
        <div className="lg:w-1/2 w-full p-8 lg:p-12 flex flex-col justify-center bg-white/90 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Bienvenido
              </h2>
              <p className="text-gray-600">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            <LoginForm />

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              © {new Date().getFullYear()} SABS - Sistema de Administración de Bodega SENA
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicadores del carrusel mejorados */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentImageIndex(index);
              setImageLoaded(false);
              setImageError(false);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
              index === currentImageIndex 
                ? 'bg-white border-white shadow-lg scale-125' 
                : 'bg-white/30 border-white/50 hover:bg-white/60 hover:border-white/80 hover:scale-110'
            }`}
            aria-label={`Ir a imagen ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Indicador de carga de imagen */}
      {!imageLoaded && !imageError && (
        <div className="absolute top-4 right-4 z-20">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
