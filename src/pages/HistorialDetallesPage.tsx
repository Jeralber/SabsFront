import React, { useEffect, useState } from 'react';
import { useDetalles } from '../hooks/useDetalles';
import { usePersona } from '../hooks/usePersona';
import { useAuth } from '../hooks/useAuth';
import { Filter, Calendar, User, Package, MapPin, Building, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/atoms/Card';
import { Badge } from '../components/atoms/Badge';
import { toast } from 'react-hot-toast';

const HistorialDetallesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { historial, loading, error, fetchHistorialCompleto, fetchHistorialPorPersona, aprobarDetalle, rechazarDetalle } = useDetalles();
  const { personas } = usePersona();
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [updatingStates, setUpdatingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (selectedPersonaId) {
      fetchHistorialPorPersona(selectedPersonaId);
    } else {
      fetchHistorialCompleto();
    }
  }, [selectedPersonaId, fetchHistorialCompleto, fetchHistorialPorPersona]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return 'bg-green-100 text-green-800 border-green-200';
      case 'RECHAZADO': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ENTREGADO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEVUELTO': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateDetalleEstado = async (detalleId: number, accion: string, item: any) => {
    if (!user?.usuario.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (item.estado !== 'PENDIENTE') {
      toast.error('Solo se pueden modificar detalles pendientes');
      return;
    }

    const updateKey = `${detalleId}-${accion}`;
    setUpdatingStates(prev => ({ ...prev, [updateKey]: true }));

    try {
      const userId = user.usuario.id;

      if (accion === 'aprobar') {
        await aprobarDetalle(detalleId, userId);
        toast.success(`Detalle #${detalleId} aprobado exitosamente`);
      } else if (accion === 'rechazar') {
        await rechazarDetalle(detalleId, userId);
        toast.success(`Detalle #${detalleId} rechazado exitosamente`);
      } else {
        throw new Error('Acción no válida para detalles');
      }

      if (selectedPersonaId) {
        await fetchHistorialPorPersona(selectedPersonaId);
      } else {
        await fetchHistorialCompleto();
      }

    } catch (error) {
      console.error(`Error al ${accion} detalle:`, error);
      toast.error(`Error al ${accion} el detalle: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUpdatingStates(prev => ({ ...prev, [updateKey]: false }));
    }
  };

  const getActionButtons = (item: any) => {
    const detalleId = item.detalleId;
    const currentEstado = item.estado;
    
    // Solo mostrar botones para detalles pendientes
    if (currentEstado !== 'PENDIENTE') {
      return (
        <div className="text-xs text-gray-500 italic">
          Estado: {currentEstado} (No modificable)
        </div>
      );
    }

    const buttons = [
      {
        accion: 'aprobar',
        label: 'Aprobar',
        icon: CheckCircle,
        color: 'bg-green-500 hover:bg-green-600 text-white'
      },
      {
        accion: 'rechazar',
        label: 'Rechazar',
        icon: XCircle,
        color: 'bg-red-500 hover:bg-red-600 text-white'
      }
    ];

    return buttons.map((button) => {
      const updateKey = `${detalleId}-${button.accion}`;
      const isUpdating = updatingStates[updateKey];
      const IconComponent = button.icon;

      return (
        <button
          key={button.accion}
          onClick={() => handleUpdateDetalleEstado(detalleId, button.accion, item)}
          disabled={isUpdating}
          className={`
            flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors
            ${button.color}
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title={button.label}
        >
          <IconComponent className="h-3 w-3" />
          {isUpdating ? 'Actualizando...' : button.label}
        </button>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial de Detalles</h1>
          <p className="text-muted-foreground">
            Consulta el historial completo de detalles procesados
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPersonaId || ''}
              onChange={(e) => setSelectedPersonaId(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las personas</option>
              {personas.map(persona => (
                <option key={persona.id} value={persona.id}>
                  {persona.nombre} {persona.apellido || ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Volver 
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {historial.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontró historial de detalles</p>
          </div>
        ) : (
          historial.map((item: any) => (
            <Card key={item.detalleId} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {item.materialNombre}
                  </CardTitle>
                  <Badge className={getEstadoColor(item.estado)}>
                    {item.estado}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {item.materialDescripcion}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="border-b pb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Acciones</p>
                  <div className="flex flex-wrap gap-2">
                    {getActionButtons(item)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cantidad</p>
                    <p className="text-lg font-semibold text-gray-900">{item.cantidad}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Detalle ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{item.detalleId}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium text-gray-700">Solicitante</p>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {item.personaNombre} {item.personaApellido}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {item.personaIdentificacion}
                  </p>
                  {item.personaCorreo && (
                    <p className="text-xs text-gray-500">
                      {item.personaCorreo}
                    </p>
                  )}
                  {item.personaTelefono && (
                    <p className="text-xs text-gray-500">
                      Tel: {item.personaTelefono}
                    </p>
                  )}
                </div>

                {(item.fichaNumero || item.tituladoNombre) && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium text-gray-700">Información Académica</p>
                    </div>
                    {item.fichaNumero && (
                      <p className="text-sm text-gray-900">
                        Ficha: <span className="font-medium">{item.fichaNumero}</span>
                      </p>
                    )}
                    {item.tituladoNombre && (
                      <p className="text-sm text-gray-900">
                        Programa: <span className="font-medium">{item.tituladoNombre}</span>
                      </p>
                    )}
                    {item.areaNombre && (
                      <p className="text-xs text-gray-500">
                        Área: {item.areaNombre}
                      </p>
                    )}
                  </div>
                )}

                {(item.centroNombre || item.sedeNombre) && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      <p className="text-sm font-medium text-gray-700">Ubicación</p>
                    </div>
                    {item.centroNombre && (
                      <p className="text-sm text-gray-900">
                        Centro: <span className="font-medium">{item.centroNombre}</span>
                      </p>
                    )}
                    {item.sedeNombre && (
                      <p className="text-sm text-gray-900">
                        Sede: <span className="font-medium">{item.sedeNombre}</span>
                      </p>
                    )}
                    {item.sedeDireccion && (
                      <p className="text-xs text-gray-500">
                        {item.sedeDireccion}
                      </p>
                    )}
                    {item.municipioNombre && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{item.municipioNombre}</p>
                      </div>
                    )}
                  </div>
                )}

                {item.solicitudDescripcion && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Solicitud</p>
                    <p className="text-sm text-gray-700">{item.solicitudDescripcion}</p>
                    {item.solicitudEstado && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.solicitudEstado}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <p className="text-sm font-medium text-gray-700">Fechas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Creado: {formatDate(item.fechaSolicitud)}
                    </p>
                    {item.fechaActualizacion && item.fechaActualizacion !== item.fechaSolicitud && (
                      <p className="text-xs text-gray-500">
                        Actualizado: {formatDate(item.fechaActualizacion)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorialDetallesPage;