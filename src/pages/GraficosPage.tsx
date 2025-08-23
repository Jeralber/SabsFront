import { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,  // Registrado para soportar Pie charts
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { useArea } from '../hooks/useArea';
import { useAreaCentro } from '../hooks/useAreaCentro';
import { useCategoriaMaterial } from '../hooks/useCategoriaMaterial';
import { useCentro } from '../hooks/useCentro';
import { useDetalles } from '../hooks/useDetalles';
import { useFicha } from '../hooks/useFicha';
import { useMaterial } from '../hooks/useMaterial';
import { useModulo } from '../hooks/useModulo';
import { useMovimiento } from '../hooks/useMovimiento';
import { useMunicipio } from '../hooks/useMunicipio';
import { useOpcion } from '../hooks/useOpcion';
import { usePermiso } from '../hooks/usePermiso';
import { usePersona } from '../hooks/usePersona';
import { useRol } from '../hooks/useRol';
import { useRolPermisoOpcion } from '../hooks/useRolPermisoOpcion';
import { useSede } from '../hooks/useSede';
import { useSitio } from '../hooks/useSitio';
import { useSolicitud } from '../hooks/useSolicitud';
import { useTipoMaterial } from '../hooks/useTipoMaterial';
import { useTipoMovimiento } from '../hooks/useTipoMovimiento';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { useTitulado } from '../hooks/useTitulado';
import { useUnidadMedida } from '../hooks/useUnidadMedida';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,  // Agregado para Pie charts
  Title,
  Tooltip,
  Legend
);

function GraficosPage() {
  // Estados para el módulo seleccionado y el filtro de tiempo
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'days' | 'weeks' | 'months' | 'years'>('months');
  const [data, setData] = useState<any[]>([]);

  // Hooks para obtener datos de diferentes módulos
  const { areas } = useArea();
  const { areasCentro } = useAreaCentro();
  const { categoriasMaterial } = useCategoriaMaterial();
  const { centros } = useCentro();
  const { detalles } = useDetalles();
  const { fichas } = useFicha();
  const { materiales } = useMaterial();
  const { modulos } = useModulo();
  const { movimientos } = useMovimiento();
  const { municipios } = useMunicipio();
  const { opciones } = useOpcion();
  const { permisos } = usePermiso();
  const { personas } = usePersona();
  const { roles } = useRol();
  const { rolPermisosOpciones } = useRolPermisoOpcion();
  const { sedes } = useSede();
  const { sitios } = useSitio();
  const { solicitudes } = useSolicitud();
  const { tiposMaterial } = useTipoMaterial();
  const { tiposMovimiento } = useTipoMovimiento();
  const { tiposSitio } = useTipoSitio();
  const { titulados } = useTitulado();
  const { unidadesMedida } = useUnidadMedida();

  // Mapa de datos por módulo para fácil acceso
  const dataMap: { [key: string]: any[] } = {
    Area: areas,
    AreaCentro: areasCentro,
    CategoriaMaterial: categoriasMaterial,
    Centro: centros,
    Detalles: detalles,
    Ficha: fichas,
    Material: materiales,
    Modulo: modulos,
    Movimiento: movimientos,
    Municipio: municipios,
    Opcion: opciones,
    Permiso: permisos,
    Persona: personas,
    Rol: roles,
    RolPermisoOpcion: rolPermisosOpciones,
    Sede: sedes,
    Sitio: sitios,
    Solicitud: solicitudes,
    TipoMaterial: tiposMaterial,
    TipoMovimiento: tiposMovimiento,
    TipoSitio: tiposSitio,
    Titulado: titulados,
    UnidadMedida: unidadesMedida,
  };

  // Efecto para actualizar datos cuando cambia el módulo seleccionado
  useEffect(() => {
    if (selectedModule && dataMap[selectedModule]) {
      setData(dataMap[selectedModule]);
    }
  }, [selectedModule, ...Object.values(dataMap)]);

  // Función para filtrar datos por rango de tiempo
  const filterDataByTime = (data: any[]) => {
    const now = new Date();
    let daysBack = 0;
    switch (timeFilter) {
      case 'days': daysBack = 7; break;
      case 'weeks': daysBack = 30; break;
      case 'months': daysBack = 365; break;
      case 'years': daysBack = 365 * 5; break;
    }
    const cutoff = new Date(now.setDate(now.getDate() - daysBack));
    return data.filter(item => new Date(item.fechaCreacion) > cutoff);
  };

  // Datos filtrados memoizados para evitar recálculos innecesarios
  const filteredData = useMemo(() => filterDataByTime(data), [data, timeFilter]);

  // Datos para gráfico de barras (Activos vs Inactivos) - memoizado
  const memoizedBarData = useMemo(() => ({
    labels: ['Activos', 'Inactivos'],
    datasets: [{
      label: 'Conteo',
      data: [
        filteredData.filter(item => item.activo).length,
        filteredData.filter(item => !item.activo).length
      ],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
    }],
  }), [filteredData]);

  // Datos para gráfico de líneas (Nuevos Registros por Mes) - memoizado
  const memoizedLineData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const counts = months.map(() => 0);
    filteredData.forEach((item: any) => {
      const month = new Date(item.fechaCreacion).getMonth();
      counts[month]++;
    });
    return {
      labels: months,
      datasets: [{
        label: 'Nuevos Registros',
        data: counts,
        borderColor: 'rgba(153, 102, 255, 1)',
        tension: 0.1,
      }],
    };
  }, [filteredData]);

  // Función auxiliar para generar colores aleatorios para pie charts
  const getRandomColors = (num: number) => {
    return Array.from({ length: num }, () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);
  };
  
  // Función para datos de Distribución por Categoría/Tipo
  const getCategoryDistribution = () => {
    const categories = {} as Record<string, number>;
    filteredData.forEach((item: any) => {
      const cat = item.categoriaMaterial?.nombre || item.tipoMaterial?.nombre || 'Desconocido';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return {
      labels: Object.keys(categories),
      datasets: [{ data: Object.values(categories), backgroundColor: getRandomColors(Object.keys(categories).length) }],
    };
  };

  // 2. Activos vs Inactivos (movida antes de useMemo)
  const getActiveInactive = () => ({
    labels: ['Activos', 'Inactivos'],
    datasets: [{ data: [filteredData.filter((i: any) => i.activo).length, filteredData.filter((i: any) => !i.activo).length], backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'] }],
  });

  // 3. Distribución por Ubicación (movida antes de useMemo)
  const getLocationDistribution = () => {
    const locations = {} as Record<string, number>;
    filteredData.forEach((item: any) => {
      const loc = item.sitio?.nombre || item.centro?.nombre || 'Desconocido';
      locations[loc] = (locations[loc] || 0) + 1;
    });
    return {
      labels: Object.keys(locations),
      datasets: [{ data: Object.values(locations), backgroundColor: getRandomColors(Object.keys(locations).length) }],
    };
  };

  // 4. Tipos de Movimientos (movida antes de useMemo)
  const getMovementTypes = () => {
    const types = {} as Record<string, number>;
    filteredData.forEach((item: any) => {
      const type = item.tipoMovimiento?.nombre || 'Desconocido';
      types[type] = (types[type] || 0) + 1;
    });
    return {
      labels: Object.keys(types),
      datasets: [{ data: Object.values(types), backgroundColor: getRandomColors(Object.keys(types).length) }],
    };
  };

  // 5. Por Unidad de Medida (movida antes de useMemo)
  const getUnitDistribution = () => {
    const units = {} as Record<string, number>;
    filteredData.forEach((item: any) => {
      const unit = item.unidadMedida?.nombre || 'Desconocido';
      units[unit] = (units[unit] || 0) + 1;
    });
    return {
      labels: Object.keys(units),
      datasets: [{ data: Object.values(units), backgroundColor: getRandomColors(Object.keys(units).length) }],
    };
  };

  // 6. Estado de Solicitudes/Detalles (movida antes de useMemo)
  const getStatusDistribution = () => {
    const statuses = {} as Record<string, number>;
    filteredData.forEach((item: any) => {
      const status = item.estado || 'Desconocido';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return {
      labels: Object.keys(statuses),
      datasets: [{ data: Object.values(statuses), backgroundColor: getRandomColors(Object.keys(statuses).length) }],
    };
  };

  const memoizedCategoryDistribution = useMemo(() => getCategoryDistribution(), [filteredData]);
  const memoizedActiveInactive = useMemo(() => getActiveInactive(), [filteredData]);
  const memoizedLocationDistribution = useMemo(() => getLocationDistribution(), [filteredData]);
  const memoizedMovementTypes = useMemo(() => getMovementTypes(), [filteredData]);
  const memoizedUnitDistribution = useMemo(() => getUnitDistribution(), [filteredData]);
  const memoizedStatusDistribution = useMemo(() => getStatusDistribution(), [filteredData]);

  // Dentro del componente GraficosPage, después de las funciones de datos:
  
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  // Opciones tipadas para cada tipo de gráfico
  const barOptions: import('chart.js').ChartOptions<'bar'> = {
    animation: {
      duration: 1500,
      easing: 'easeOutBounce' as const,
      delay: 100,
    },
    plugins: {
      legend: { position: 'top' as const },
    },
  };
  
  const lineOptions: ChartOptions<'line'> = {
    animation: {
      duration: 1500,
      easing: 'easeOutBounce' as const,
      delay: 100,
    },
    plugins: {
      legend: { position: 'top' as const },
    },
  };
  
  const pieOptions: ChartOptions<'pie'> = {
    animation: {
      duration: 1500,
      easing: 'easeOutBounce' as const,
      delay: 100,
    },
    plugins: {
      legend: { position: 'top' as const },
    },
  };
  
  // En el return JSX, usa las versiones memoizadas:
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Gráficos por Módulo</h1>
      <div className="flex justify-center mb-6 space-x-4">
        <select
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedModule || ''}
          onChange={(e) => setSelectedModule(e.target.value || null)}
        >
          <option value="">Selecciona un módulo</option>
          {Object.keys(dataMap).map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
        <select
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as 'days' | 'weeks' | 'months' | 'years')}
        >
          <option value="days">Últimos 7 días</option>
          <option value="weeks">Últimos 30 días</option>
          <option value="months">Último año</option>
          <option value="years">Últimos 5 años</option>
        </select>
      </div>
  
      {selectedModule && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Activos vs Inactivos</h2>
            <Bar data={memoizedBarData} options={barOptions} />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
            <h2 className="text-xl font-semibold mb-4 text-center">Nuevos Registros por Mes </h2>
            <Line data={memoizedLineData} options={lineOptions} />
          </div>
  
          {/* Pie Charts condicionales por módulo con estilos Tailwind y animaciones */}
          {(selectedModule === 'Material' || selectedModule === 'CategoriaMaterial' || selectedModule === 'TipoMaterial') && (
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4 text-center">Distribución por Categoría/Tipo</h2>
              <Pie data={memoizedCategoryDistribution} options={pieOptions} />
            </div>
          )}
          {(selectedModule.includes('Area') || selectedModule.includes('Centro') || selectedModule === 'Sitio') && (
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4 text-center">Distribución por Ubicación</h2>
              <Pie data={memoizedLocationDistribution} options={pieOptions} />
            </div>
          )}
          {selectedModule === 'Movimiento' && (
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4 text-center">Tipos de Movimientos</h2>
              <Pie data={memoizedMovementTypes} options={pieOptions} />
            </div>
          )}
          {selectedModule === 'Material' && (
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4 text-center">Por Unidad de Medida</h2>
              <Pie data={memoizedUnitDistribution} options={pieOptions} />
            </div>
          )}
          {(selectedModule === 'Solicitud' || selectedModule === 'Detalles') && (
            <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105">
              <h2 className="text-xl font-semibold mb-4 text-center">Estado de Solicitudes/Detalles</h2>
              <Pie data={memoizedStatusDistribution} options={pieOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Nota: Define las funciones getCategoryDistribution, etc., fuera del useMemo, pero llámalas dentro de useMemo para memoizar sus resultados.
export default GraficosPage;