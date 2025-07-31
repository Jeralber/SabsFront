import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { personaService } from "@/services/personaService";
import { PersonaCompleta } from "@/types/persona.types";
import { User, Mail, Phone, Calendar, MapPin, Building, GraduationCap,  Shield } from "lucide-react";

export default function AcercaDePage() {
  const { user } = useAuth();
  const [personaCompleta, setPersonaCompleta] = useState<PersonaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!personaCompleta) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No se encontró información del usuario
        </div>
      </div>
    );
  }

  const InfoCard = ({ icon: Icon, title, value, subtitle }: {
    icon: any;
    title: string;
    value: string | number | undefined;
    subtitle?: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center mb-3">
        <Icon className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">
        {value || "No asignado"}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-600">{subtitle}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="bg-blue-100 rounded-full p-4">
              <User className="h-16 w-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {personaCompleta.personaNombre} {personaCompleta.apellido}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {personaCompleta.rolNombre || "Sin rol asignado"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ID: {personaCompleta.identificacion}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={Mail}
              title="Correo Electrónico"
              value={personaCompleta.correo}
            />
            <InfoCard
              icon={Phone}
              title="Teléfono"
              value={personaCompleta.telefono}
            />
            <InfoCard
              icon={Calendar}
              title="Edad"
              value={`${personaCompleta.edad} años`}
            />
            <InfoCard
              icon={Shield}
              title="Rol"
              value={personaCompleta.rolNombre}
            />
          </div>
        </div>

        {(personaCompleta.fichaNumero || personaCompleta.tituladoNombre) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Académica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personaCompleta.fichaNumero && (
                <InfoCard
                  icon={GraduationCap}
                  title="Ficha"
                  value={personaCompleta.fichaNumero}
                  subtitle={`${personaCompleta.cantidadAprendices || 0} aprendices`}
                />
              )}
              {personaCompleta.tituladoNombre && (
                <InfoCard
                  icon={GraduationCap}
                  title="Programa de Formación"
                  value={personaCompleta.tituladoNombre}
                />
              )}
              {personaCompleta.areaNombre && (
                <InfoCard
                  icon={Building}
                  title="Área"
                  value={personaCompleta.areaNombre}
                />
              )}
            </div>
          </div>
        )}

        {(personaCompleta.centroNombre || personaCompleta.sedeNombre || personaCompleta.municipioNombre) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Ubicación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personaCompleta.centroNombre && (
                <InfoCard
                  icon={Building}
                  title="Centro"
                  value={personaCompleta.centroNombre}
                />
              )}
              {personaCompleta.sedeNombre && (
                <InfoCard
                  icon={MapPin}
                  title="Sede"
                  value={personaCompleta.sedeNombre}
                  subtitle={personaCompleta.sedeDireccion}
                />
              )}
              {personaCompleta.municipioNombre && (
                <InfoCard
                  icon={MapPin}
                  title="Municipio"
                  value={personaCompleta.municipioNombre}
                />
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Estado de la Cuenta</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              personaCompleta.personaActiva ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`font-semibold ${
              personaCompleta.personaActiva ? 'text-green-700' : 'text-red-700'
            }`}>
              {personaCompleta.personaActiva ? 'Cuenta Activa' : 'Cuenta Inactiva'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}