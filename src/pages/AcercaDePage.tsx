import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { personaService } from "@/services/personaService";
import { PersonaCompleta } from "@/types/persona.types";
import { 
  User, Mail, Phone, Calendar, MapPin, Building, GraduationCap, Shield, 
  Clock, Activity, Award, BookOpen, Users, Settings, Info, 
  Globe, Briefcase, Star, TrendingUp, Database, Code
} from "lucide-react";

export default function AcercaDePage() {
  const { user } = useAuth();
  const [personaCompleta, setPersonaCompleta] = useState<PersonaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const cargarInformacionCompleta = async () => {
      if (!user?.usuario?.id) {
        setError("No se pudo obtener la información del usuario");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await personaService.getCompletaById(user.usuario.id);
        
        if (Array.isArray(response.data)) {
          setPersonaCompleta(response.data[0] || null);
        } else {
          setPersonaCompleta(response.data);
        }
      } catch (err) {
        console.error("Error al cargar información completa:", err);
        setError("Error al cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };

    cargarInformacionCompleta();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando información del perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!personaCompleta) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 px-6 py-4 rounded-lg">
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            No se encontró información del usuario
          </div>
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number | undefined;
    subtitle?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
      green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
      orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20",
      red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20",
      teal: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/20"
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 ml-3">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value || "No asignado"}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    );
  };

  const StatCard = ({ icon: Icon, title, value, change, color }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${color} flex items-center mt-1`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.includes('green') ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: User },
    { id: 'academic', label: 'Información Académica', icon: GraduationCap },
    { id: 'location', label: 'Ubicación', icon: MapPin },
    { id: 'system', label: 'Sistema', icon: Settings },
    { id: 'about', label: 'Acerca del Sistema', icon: Info }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard icon={Mail} title="Correo Electrónico" value={personaCompleta.correo} color="blue" />
            <InfoCard icon={Phone} title="Teléfono" value={personaCompleta.telefono} color="green" />
            <InfoCard icon={Calendar} title="Edad" value={`${personaCompleta.edad} años`} color="purple" />
            <InfoCard icon={Shield} title="Rol" value={personaCompleta.rolNombre} color="orange" />
            <InfoCard icon={Activity} title="Estado" value={personaCompleta.personaActiva ? 'Activo' : 'Inactivo'} color={personaCompleta.personaActiva ? "green" : "red"} />
            <InfoCard icon={Clock} title="Última Sesión" value="Hoy" subtitle="Conectado actualmente" color="teal" />
          </div>
        );
      
      case 'academic':
        return (
          <div className="space-y-6">
            {(personaCompleta.fichaNumero || personaCompleta.tituladoNombre) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personaCompleta.fichaNumero && (
                  <InfoCard
                    icon={GraduationCap}
                    title="Ficha"
                    value={personaCompleta.fichaNumero}
                    subtitle={`${personaCompleta.cantidadAprendices || 0} aprendices`}
                    color="blue"
                  />
                )}
                {personaCompleta.tituladoNombre && (
                  <InfoCard
                    icon={BookOpen}
                    title="Programa de Formación"
                    value={personaCompleta.tituladoNombre}
                    color="green"
                  />
                )}
                {personaCompleta.areaNombre && (
                  <InfoCard
                    icon={Building}
                    title="Área"
                    value={personaCompleta.areaNombre}
                    color="purple"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No hay información académica disponible</p>
              </div>
            )}
          </div>
        );
      
      case 'location':
        return (
          <div className="space-y-6">
            {(personaCompleta.centroNombre || personaCompleta.sedeNombre || personaCompleta.municipioNombre) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personaCompleta.centroNombre && (
                  <InfoCard
                    icon={Building}
                    title="Centro"
                    value={personaCompleta.centroNombre}
                    color="blue"
                  />
                )}
                {personaCompleta.sedeNombre && (
                  <InfoCard
                    icon={MapPin}
                    title="Sede"
                    value={personaCompleta.sedeNombre}
                    subtitle={personaCompleta.sedeDireccion}
                    color="green"
                  />
                )}
                {personaCompleta.municipioNombre && (
                  <InfoCard
                    icon={Globe}
                    title="Municipio"
                    value={personaCompleta.municipioNombre}
                    color="purple"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No hay información de ubicación disponible</p>
              </div>
            )}
          </div>
        );
      
      case 'system':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Sesiones Activas"
                value="1"
                change="+0% desde ayer"
                color="text-green-600 dark:text-green-400"
              />
              <StatCard
                icon={Activity}
                title="Tiempo en Sistema"
                value="2.5h"
                change="+15% esta semana"
                color="text-blue-600 dark:text-blue-400"
              />
              <StatCard
                icon={Award}
                title="Permisos Activos"
                value={personaCompleta.rolNombre ? "Sí" : "No"}
                color="text-purple-600 dark:text-purple-400"
              />
              <StatCard
                icon={Shield}
                title="Nivel de Acceso"
                value={personaCompleta.rolNombre || "Básico"}
                color="text-orange-600 dark:text-orange-400"
              />
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuración de la Cuenta
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ID de Usuario</span>
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{personaCompleta.identificacion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estado de la Cuenta</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      personaCompleta.personaActiva ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      personaCompleta.personaActiva ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {personaCompleta.personaActiva ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Último Acceso</span>
                  <span className="text-sm text-gray-900 dark:text-white">Hoy, {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center mb-4">
                <Code className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Sistema SABS</h3>
              </div>
              <p className="text-blue-100 mb-4">
                Sistema de Administración de Bienes y Servicios - Una solución integral para la gestión de inventarios, 
                movimientos y reportes en instituciones educativas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <Database className="h-6 w-6 mb-2" />
                  <h4 className="font-semibold mb-1">Gestión de Datos</h4>
                  <p className="text-sm text-blue-100">Base de datos robusta y segura</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Users className="h-6 w-6 mb-2" />
                  <h4 className="font-semibold mb-1">Multi-usuario</h4>
                  <p className="text-sm text-blue-100">Roles y permisos personalizados</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <h4 className="font-semibold mb-1">Reportes</h4>
                  <p className="text-sm text-blue-100">Análisis y estadísticas avanzadas</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Características Principales
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Gestión completa de inventarios
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Sistema de movimientos y aprobaciones
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Reportes y gráficos en tiempo real
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Gestión de usuarios y permisos
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Historial completo de movimientos
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
                  Información Técnica
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Versión:</span>
                    <span className="font-mono text-gray-900 dark:text-white">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frontend:</span>
                    <span className="font-mono text-gray-900 dark:text-white">React + TypeScript</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Backend:</span>
                    <span className="font-mono text-gray-900 dark:text-white">Node.js + Express</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Base de Datos:</span>
                    <span className="font-mono text-gray-900 dark:text-white">MySQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Última Actualización:</span>
                    <span className="font-mono text-gray-900 dark:text-white">{new Date().toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
              <User className="h-16 w-16 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {personaCompleta.personaNombre} {personaCompleta.apellido}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {personaCompleta.rolNombre || "Sin rol asignado"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                ID: {personaCompleta.identificacion}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                personaCompleta.personaActiva ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                personaCompleta.personaActiva ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {personaCompleta.personaActiva ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8 border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}