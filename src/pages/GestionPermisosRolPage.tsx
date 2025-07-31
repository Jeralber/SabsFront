import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader, Button, Select, SelectItem } from '@heroui/react';
import { useRol } from '../hooks/useRol';
import { useModulo } from '../hooks/useModulo';
import { rolPermisoOpcionService } from '../services/rolPermisoOpcionService';
import { addToast } from '@heroui/react';
import { Shield, Save, RotateCcw } from 'lucide-react';

// Tipo actualizado para incluir el campo 'asignado'
interface PermisoDisponible {
  id: number;
  nombre: string;
  codigo: string;
  opcionId?: number;
  opcionNombre?: string;
  asignado?: boolean; // Cambiar a opcional
}

const GestionPermisosRolPage: React.FC = () => {
  const { roles } = useRol();
  const { modulos } = useModulo();
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
  const [permisosDisponibles, setPermisosDisponibles] = useState<PermisoDisponible[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Definir las acciones estándar
  const accionesEstandar = ['ver', 'crear', 'editar', 'eliminar'];

  useEffect(() => {
    if (selectedRolId) {
      cargarPermisosDisponibles(selectedRolId);
    } else {
      setPermisosDisponibles([]);
      setPermisosSeleccionados(new Set());
    }
  }, [selectedRolId]);

  const cargarPermisosDisponibles = async (rolId: number) => {
    setLoading(true);
    try {
      // Usar la nueva consulta del backend que incluye el campo 'asignado'
      const response = await rolPermisoOpcionService.findAllPermisosDisponibles(rolId);
      const permisos = Array.isArray(response.data) ? response.data : [];
      
      setPermisosDisponibles(permisos);
      
      // Inicializar permisos seleccionados basándose en el campo 'asignado'
      const seleccionados = new Set<string>();
      permisos.forEach(permiso => {
        if (permiso.asignado === true) { // Verificación explícita
          const key = permiso.opcionId ? 
            `${permiso.id}-${permiso.opcionId}` : 
            `${permiso.id}`;
          seleccionados.add(key);
        }
      });
      setPermisosSeleccionados(seleccionados);
      
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos disponibles',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const isPermisoSelected = useCallback((moduloNombre: string, accion: string) => {
    const moduloNorm = normalizeString(moduloNombre);
    const accionNorm = normalizeString(accion);
    
    const permisoEncontrado = permisosDisponibles.find(p => {
      const nombreNorm = normalizeString(p.nombre);
      const opcionNorm = p.opcionNombre ? normalizeString(p.opcionNombre) : '';
      const combined = nombreNorm + ' ' + opcionNorm;
      
      return combined.includes(moduloNorm) && combined.includes(accionNorm);
    });
    
    if (permisoEncontrado) {
      const key = permisoEncontrado.opcionId ? 
        `${permisoEncontrado.id}-${permisoEncontrado.opcionId}` : 
        `${permisoEncontrado.id}`;
      return permisosSeleccionados.has(key);
    }
    
    return false;
  }, [permisosDisponibles, permisosSeleccionados]);

  const togglePermiso = (moduloNombre: string, accion: string) => {
    const moduloNorm = normalizeString(moduloNombre);
    const accionNorm = normalizeString(accion);
    
    const permisoEncontrado = permisosDisponibles.find(p => {
      const nombreNorm = normalizeString(p.nombre);
      const opcionNorm = p.opcionNombre ? normalizeString(p.opcionNombre) : '';
      const combined = nombreNorm + ' ' + opcionNorm;
      
      return combined.includes(moduloNorm) && combined.includes(accionNorm);
    });
    
    if (permisoEncontrado) {
      const key = permisoEncontrado.opcionId ? 
        `${permisoEncontrado.id}-${permisoEncontrado.opcionId}` : 
        `${permisoEncontrado.id}`;
      
      setPermisosSeleccionados(prev => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }
  };

  const handleGuardarPermisos = async () => {
    setSaving(true);
    try {
      const permisosData = Array.from(permisosSeleccionados).map(seleccion => {
        const [permisoId, opcionId] = seleccion.split('-').map(Number);
        return {
          permisoId,
          opcionId: opcionId || undefined
        };
      });

      if (selectedRolId !== null) {
        await rolPermisoOpcionService.asignarPermisosARol(selectedRolId, permisosData);
        addToast({
          title: 'Éxito',
          description: 'Permisos guardados correctamente',
          color: 'success'
        });
        // Recargar permisos para reflejar los cambios
        await cargarPermisosDisponibles(selectedRolId);
      }
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron guardar los permisos',
        color: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedRolId) {
      cargarPermisosDisponibles(selectedRolId);
    }
  };

  // Calcular número de permisos asignados
  const permisosAsignadosCount = permisosDisponibles.filter(p => p.asignado).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Permisos por Rol
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Seleccionar Rol</h2>
        </CardHeader>
        <CardBody>
          <Select
            label="Rol"
            placeholder="Seleccione un rol"
            value={selectedRolId?.toString() || ''}
            onChange={(e) => setSelectedRolId(e.target.value ? parseInt(e.target.value) : null)}
            className="max-w-md"
          >
            {roles.map((rol) => (
              <SelectItem key={rol.id.toString()}>
                {rol.nombre}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
      </Card>

      {selectedRolId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Matriz de Permisos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Seleccione los permisos para cada módulo
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                color="danger"
                variant="bordered"
                startContent={<RotateCcw size={16} />}
                onClick={handleReset}
                isDisabled={loading || saving}
              >
                Restablecer
              </Button>
              <Button
                color="success"
                startContent={<Save size={16} />}
                onClick={handleGuardarPermisos}
                isLoading={saving}
                isDisabled={loading}
              >
                Guardar Permisos
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {selectedRolId && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Permisos Asignados: {permisosAsignadosCount}
                </h4>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Cargando permisos...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                        Módulo
                      </th>
                      {accionesEstandar.map(accion => (
                        <th key={accion} className="text-center p-4 font-semibold text-gray-900 dark:text-white capitalize">
                          {accion}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modulos.map((modulo) => (
                      <tr key={modulo.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                          {modulo.nombre}
                        </td>
                        {accionesEstandar.map(accion => {
                          const isSelected = isPermisoSelected(modulo.nombre, accion);
                          return (
                            <td key={accion} className="p-4 text-center">
                              <div 
                                className={`w-6 h-6 border-2 rounded cursor-pointer flex items-center justify-center transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-400 bg-white dark:bg-gray-700 dark:border-gray-600'
                                }`}
                                onClick={() => togglePermiso(modulo.nombre, accion)}
                              >
                                {isSelected && (
                                  <span className="text-white font-bold text-sm">✓</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default GestionPermisosRolPage;

