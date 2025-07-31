import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Select, SelectItem, Checkbox } from '@heroui/react';
import { useRol } from '../hooks/useRol';
import { useModulo } from '../hooks/useModulo';
import { rolPermisoOpcionService, PermisoDisponible } from '../services/rolPermisoOpcionService';
import { permisoService } from '../services/permisoService';
import { opcionService } from '../services/opcionService';
import { RolPermisoOpcion } from '../types/rol-permiso-opcion.types';
import { addToast } from '@heroui/react';
import { Shield, Save, RotateCcw } from 'lucide-react';

const GestionPermisosRolPage: React.FC = () => {
  const { roles } = useRol();
  const { modulos } = useModulo();
  const [selectedRolId, setSelectedRolId] = useState<number | null>(null);
  const [permisosDisponibles, setPermisosDisponibles] = useState<PermisoDisponible[]>([]);
  const [permisosAsignados, setPermisosAsignados] = useState<RolPermisoOpcion[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Definir las acciones estándar
  const accionesEstandar = ['ver', 'crear', 'editar', 'eliminar'];

  useEffect(() => {
    cargarPermisosDisponibles();
  }, []);

  useEffect(() => {
    if (selectedRolId) {
      cargarPermisosDelRol(selectedRolId);
    } else {
      setPermisosAsignados([]);
      setPermisosSeleccionados([]);
    }
  }, [selectedRolId]);

  const cargarPermisosDisponibles = async () => {
    try {
      const [permisosResponse, opcionesResponse] = await Promise.all([
        permisoService.getAllWithOpcionYModulo(),
        opcionService.getAllWithPermisos()
      ]);
      
      const permisos = Array.isArray(permisosResponse.data) ? permisosResponse.data : [];
      const opciones = Array.isArray(opcionesResponse.data) ? opcionesResponse.data : [];
      
      const permisosDisponibles: PermisoDisponible[] = [];
      
      permisos.forEach(permiso => {
        permisosDisponibles.push({
          id: permiso.id,
          nombre: permiso.nombre
        });
        
        opciones.forEach(opcion => {
          permisosDisponibles.push({
            id: permiso.id,
            nombre: permiso.nombre,
            opcionId: opcion.id,
            opcionNombre: opcion.nombre
          });
        });
      });
      
      setPermisosDisponibles(permisosDisponibles);
    } catch (error) {
      console.error('Error al cargar permisos disponibles:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos disponibles',
        color: 'danger'
      });
    }
  };

  const cargarPermisosDelRol = async (rolId: number) => {
    setLoading(true);
    try {
      const response = await rolPermisoOpcionService.getPermisosByRol(rolId);
      const permisos = Array.isArray(response.data) ? response.data : [];
      setPermisosAsignados(permisos);
      
      const seleccionados = permisos.map(p => {
        if (p.opcionId) {
          return `${p.permisoId}-${p.opcionId}`;
        }
        return `${p.permisoId}`;
      });
      setPermisosSeleccionados(seleccionados);
    } catch (error) {
      console.error('Error al cargar permisos del rol:', error);
      addToast({
        title: 'Error',
        description: 'No se pudieron cargar los permisos del rol',
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPermisos = async () => {
    if (!selectedRolId) {
      addToast({
        title: 'Error',
        description: 'Debe seleccionar un rol',
        color: 'danger'
      });
      return;
    }

    setSaving(true);
    try {
      const permisosData = permisosSeleccionados.map(seleccion => {
        const [permisoId, opcionId] = seleccion.split('-').map(Number);
        return {
          permisoId,
          opcionId: opcionId || undefined
        };
      });

      await rolPermisoOpcionService.asignarPermisosARol(selectedRolId, permisosData);
      
      addToast({
        title: 'Éxito',
        description: 'Permisos guardados correctamente',
        color: 'success'
      });
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
      cargarPermisosDelRol(selectedRolId);
    }
  };

  const isPermisoSelected = (moduloNombre: string, accion: string): boolean => {
    const permisoKey = `${moduloNombre.toLowerCase()}.${accion}`;
    return permisosSeleccionados.some(seleccion => {
      const permiso = permisosDisponibles.find(p => {
        const key = p.opcionId ? `${p.id}-${p.opcionId}` : `${p.id}`;
        return key === seleccion;
      });
      return permiso && permiso.nombre.toLowerCase().includes(permisoKey);
    });
  };

  const togglePermiso = (moduloNombre: string, accion: string) => {
    const permisoEncontrado = permisosDisponibles.find(p => {
      const nombrePermiso = p.nombre.toLowerCase();
      const moduloLower = moduloNombre.toLowerCase();
      return nombrePermiso.includes(`${moduloLower}.${accion}`) || 
             (nombrePermiso.includes(moduloLower) && p.opcionNombre?.toLowerCase().includes(accion));
    });

    if (permisoEncontrado) {
      const key = permisoEncontrado.opcionId ? 
        `${permisoEncontrado.id}-${permisoEncontrado.opcionId}` : 
        `${permisoEncontrado.id}`;
      
      setPermisosSeleccionados(prev => {
        if (prev.includes(key)) {
          return prev.filter(p => p !== key);
        } else {
          return [...prev, key];
        }
      });
    }
  };

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
                color="secondary"
                variant="bordered"
                startContent={<RotateCcw size={16} />}
                onClick={handleReset}
                isDisabled={loading || saving}
              >
                Restablecer
              </Button>
              <Button
                color="primary"
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
                              <Checkbox
                                isSelected={isSelected}
                                onChange={() => togglePermiso(modulo.nombre, accion)}
                                color="success"
                                size="lg"
                                className="data-[selected=true]:text-green-600"
                              />
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

