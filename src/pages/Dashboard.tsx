
import { useAuth } from "@/hooks/useAuth";
import { useMovimiento } from "@/hooks/useMovimiento";
import { useMaterial } from "@/hooks/useMaterial";
import { usePersona } from "@/hooks/usePersona";
import { useEffect, useState } from "react";

export const Dashboard = () => {
  const { user } = useAuth();
  const { movimientos } = useMovimiento();
  const { materiales } = useMaterial();
  const { personas } = usePersona();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    "/imagen1.png",
    "/imagen2.jpg",
    "/imagen3.jpeg",
    "/imagen4.webp",
    "/imagen5.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carouselImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Estadísticas mejoradas con más contexto
  const movimientosPendientes = movimientos.filter(m => m.estado === 'pendiente').length;
  const movimientosAprobados = movimientos.filter(m => m.estado === 'aprobado').length;
  const movimientosRechazados = movimientos.filter(m => m.estado === 'rechazado').length;
  const movimientosTotal = movimientos.length;
  
  const materialesDisponibles = materiales.filter(m => m.activo).length;
  const materialesInactivos = materiales.filter(m => !m.activo).length;
  const materialesTotal = materiales.length;
  
  const usuariosActivos = personas.filter(p => p.activo).length;
  const usuariosInactivos = personas.filter(p => !p.activo).length;
  const usuariosTotal = personas.length;
  
  // Cálculos de porcentajes y tendencias
  const tasaAprobacion = movimientosTotal > 0 ? Math.round((movimientosAprobados / movimientosTotal) * 100) : 0;
  const tasaRechazo = movimientosTotal > 0 ? Math.round((movimientosRechazados / movimientosTotal) * 100) : 0;
  const porcentajeMaterialesActivos = materialesTotal > 0 ? Math.round((materialesDisponibles / materialesTotal) * 100) : 0;
  const porcentajeUsuariosActivos = usuariosTotal > 0 ? Math.round((usuariosActivos / usuariosTotal) * 100) : 0;
  
  // Obtener fecha actual para contexto temporal
  const fechaActual = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % carouselImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          ¡Bienvenido, {user?.usuario?.nombre}!
        </h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Panel de Control - Sistema de Administración de Bodega SENA
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Última actualización: {fechaActual}
        </p>
      </div>

      <div className="mt-6 relative w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img 
                src={image} 
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        <button 
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex 
                  ? 'bg-white' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Resumen ejecutivo */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Resumen del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Total de Movimientos</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{movimientosTotal}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Inventario Total</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{materialesTotal}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Usuarios Registrados</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{usuariosTotal}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Movimientos Pendientes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Movimientos Pendientes</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{movimientosPendientes}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-medium">
                  {movimientosTotal > 0 ? `${Math.round((movimientosPendientes / movimientosTotal) * 100)}% del total` : 'Sin datos'}
                </p>
              </div>
            </div>
            {movimientosPendientes > 0 && (
              <div className="text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Requieren revisión y aprobación inmediata
          </div>
        </div>
        
        {/* Materiales Activos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Materiales Disponibles</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{materialesDisponibles}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                  {porcentajeMaterialesActivos}% del inventario total
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p>{materialesInactivos} inactivos</p>
              <p className="text-green-600 dark:text-green-400 font-medium">✓ Disponibles</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Listos para movimientos y asignaciones
          </div>
        </div>
        
        {/* Usuarios Activos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Activos</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{usuariosActivos}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                  {porcentajeUsuariosActivos}% de usuarios registrados
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <p>{usuariosInactivos} inactivos</p>
              <p className="text-blue-600 dark:text-blue-400 font-medium">● En línea</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Con acceso al sistema de bodega
          </div>
        </div>
        
        {/* Movimientos Aprobados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Movimientos Aprobados</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{movimientosAprobados}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                  Tasa de aprobación: {tasaAprobacion}%
                </p>
              </div>
            </div>
            {tasaAprobacion >= 80 ? (
              <div className="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            ) : (
              <div className="text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Procesados exitosamente en el sistema
          </div>
        </div>
        
        {/* Movimientos Rechazados */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Movimientos Rechazados</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{movimientosRechazados}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                  Tasa de rechazo: {tasaRechazo}%
                </p>
              </div>
            </div>
            {tasaRechazo > 20 ? (
              <div className="text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Requieren revisión de criterios
          </div>
        </div>
        
        {/* Eficiencia del Sistema */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eficiencia General</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white">{tasaAprobacion}%</p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                  {tasaAprobacion >= 90 ? 'Excelente' : tasaAprobacion >= 70 ? 'Buena' : 'Mejorable'}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              <div className={`w-16 h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden`}>
                <div 
                  className={`h-full transition-all duration-500 ${
                    tasaAprobacion >= 90 ? 'bg-green-500' : 
                    tasaAprobacion >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${tasaAprobacion}%` }}
                />
              </div>
              <p className="mt-1">Rendimiento</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Basado en movimientos procesados correctamente
          </div>
        </div>
      </div>
      
      {/* Alertas y recomendaciones */}
      {(movimientosPendientes > 5 || tasaRechazo > 20 || porcentajeMaterialesActivos < 80) && (
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border border-orange-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Alertas del Sistema
          </h3>
          <div className="space-y-2 text-sm">
            {movimientosPendientes > 5 && (
              <div className="flex items-center text-yellow-700 dark:text-yellow-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hay {movimientosPendientes} movimientos pendientes que requieren atención inmediata.
              </div>
            )}
            {tasaRechazo > 20 && (
              <div className="flex items-center text-red-700 dark:text-red-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                La tasa de rechazo ({tasaRechazo}%) es alta. Revisar criterios de aprobación.
              </div>
            )}
            {porcentajeMaterialesActivos < 80 && (
              <div className="flex items-center text-orange-700 dark:text-orange-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Solo {porcentajeMaterialesActivos}% del inventario está activo. Considerar reactivar materiales.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
