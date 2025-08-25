import { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
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
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function GraficosPage() {
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

  // Mapa de datos por módulo
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

  const filteredData = useMemo(() => filterDataByTime(data), [data, timeFilter]);

  // Función auxiliar para generar colores consistentes
  const getConsistentColors = (num: number) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // blue-500
      'rgba(16, 185, 129, 0.8)',   // emerald-500
      'rgba(245, 101, 101, 0.8)',  // red-400
      'rgba(251, 191, 36, 0.8)',   // amber-400
      'rgba(139, 92, 246, 0.8)',   // violet-500
      'rgba(236, 72, 153, 0.8)',   // pink-500
      'rgba(6, 182, 212, 0.8)',    // cyan-500
      'rgba(34, 197, 94, 0.8)',    // green-500
    ];
    return Array.from({ length: num }, (_, i) => colors[i % colors.length]);
  };

  // GRÁFICOS ESPECÍFICOS POR MÓDULO

  // 1. Fichas: Cantidad de personas por ficha
  const getFichasPersonasChart = () => {
    if (selectedModule !== 'Ficha') return null;
    
    const fichasConPersonas = fichas.map(ficha => {
      const personasEnFicha = personas.filter(persona => persona.fichaId === ficha.id).length;
      return {
        nombre: ficha.numero || `Ficha ${ficha.id}`,
        cantidad: personasEnFicha
      };
    }).filter(item => item.cantidad > 0);

    return {
      labels: fichasConPersonas.map(item => item.nombre),
      datasets: [{
        label: 'Personas por Ficha',
        data: fichasConPersonas.map(item => item.cantidad),
        backgroundColor: getConsistentColors(fichasConPersonas.length),
        borderColor: getConsistentColors(fichasConPersonas.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // 2. Municipios: Cantidad de centros por municipio
  const getMunicipiosCentrosChart = () => {
    if (selectedModule !== 'Municipio') return null;
    
    const municipiosConCentros = municipios.map(municipio => {
      const centrosEnMunicipio = centros.filter(centro => centro.municipioId === municipio.id).length;
      return {
        nombre: municipio.nombre,
        cantidad: centrosEnMunicipio
      };
    }).filter(item => item.cantidad > 0);

    return {
      labels: municipiosConCentros.map(item => item.nombre),
      datasets: [{
        label: 'Centros por Municipio',
        data: municipiosConCentros.map(item => item.cantidad),
        backgroundColor: getConsistentColors(municipiosConCentros.length),
        borderColor: getConsistentColors(municipiosConCentros.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // 3. Materiales: Niveles de stock
  const getMaterialesStockChart = () => {
    if (selectedModule !== 'Material') return null;
    
    const materialesConStock = materiales.map(material => ({
      nombre: material.nombre,
      stock: material.stock || 0,
      stockMinimo: material.stock || 0
    })).filter(item => item.stock > 0);

    return {
      labels: materialesConStock.map(item => item.nombre),
      datasets: [
        {
          label: 'Stock Actual',
          data: materialesConStock.map(item => item.stock),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        },
        {
          label: 'Stock Mínimo',
          data: materialesConStock.map(item => item.stockMinimo),
          backgroundColor: 'rgba(245, 101, 101, 0.8)',
          borderColor: 'rgba(245, 101, 101, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  // 4. Sitios: Cantidad de materiales por sitio
  const getSitiosMaterialesChart = () => {
    if (selectedModule !== 'Sitio') return null;
    
    const sitiosConMateriales = sitios.map(sitio => {
      const materialesEnSitio = materiales.filter(material => material.sitioId === sitio.id).length;
      return {
        nombre: sitio.nombre,
        cantidad: materialesEnSitio
      };
    }).filter(item => item.cantidad > 0);

    return {
      labels: sitiosConMateriales.map(item => item.nombre),
      datasets: [{
        label: 'Materiales por Sitio',
        data: sitiosConMateriales.map(item => item.cantidad),
        backgroundColor: getConsistentColors(sitiosConMateriales.length)
      }]
    };
  };

  // 5. Movimientos: Tendencias por mes
  const getMovimientosTendenciasChart = () => {
    if (selectedModule !== 'Movimiento') return null;
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const entradas = meses.map(() => 0);
    const salidas = meses.map(() => 0);
    
    movimientos.forEach(movimiento => {
      const mes = new Date(movimiento.fechaCreacion).getMonth();
      if (movimiento.tipoMovimiento?.nombre?.toLowerCase().includes('entrada')) {
        entradas[mes]++;
      } else {
        salidas[mes]++;
      }
    });

    return {
      labels: meses,
      datasets: [
        {
          label: 'Entradas',
          data: entradas,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Salidas',
          data: salidas,
          borderColor: 'rgba(245, 101, 101, 1)',
          backgroundColor: 'rgba(245, 101, 101, 0.2)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  // Gráficos generales memoizados
  const memoizedBarData = useMemo(() => ({
    labels: ['Activos', 'Inactivos'],
    datasets: [{
      label: 'Conteo',
      data: [
        filteredData.filter(item => item.activo).length,
        filteredData.filter(item => !item.activo).length
      ],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 101, 101, 0.8)'],
      borderColor: ['rgba(34, 197, 94, 1)', 'rgba(245, 101, 101, 1)'],
      borderWidth: 2
    }]
  }), [filteredData]);

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
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  }, [filteredData]);

  // Opciones de gráficos con soporte para tema oscuro
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)' // gray-500 para compatibilidad con ambos temas
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)', // gray-900
        titleColor: 'rgb(243, 244, 246)', // gray-100
        bodyColor: 'rgb(243, 244, 246)', // gray-100
        borderColor: 'rgb(75, 85, 99)', // gray-600
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(107, 114, 128)' // gray-500
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)' // gray-500 with opacity
        }
      },
      y: {
        ticks: {
          color: 'rgb(107, 114, 128)' // gray-500
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)' // gray-500 with opacity
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Gráficos por Módulo
      </h1>
      
      {/* Controles de filtro */}
      <div className="flex justify-center mb-6 space-x-4">
        <select
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
          value={selectedModule || ''}
          onChange={(e) => setSelectedModule(e.target.value || null)}
        >
          <option value="">Selecciona un módulo</option>
          {Object.keys(dataMap).map(module => (
            <option key={module} value={module}>{module}</option>
          ))}
        </select>
        <select
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Gráficos específicos por módulo */}
          {selectedModule === 'Ficha' && getFichasPersonasChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Personas por Ficha
              </h2>
              <div className="h-80">
                <Bar data={getFichasPersonasChart()!} options={chartOptions} />
              </div>
            </div>
          )}

          {selectedModule === 'Municipio' && getMunicipiosCentrosChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Centros por Municipio
              </h2>
              <div className="h-80">
                <Doughnut data={getMunicipiosCentrosChart()!} options={pieOptions} />
              </div>
            </div>
          )}

          {selectedModule === 'Material' && getMaterialesStockChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Niveles de Stock
              </h2>
              <div className="h-80">
                <Bar data={getMaterialesStockChart()!} options={chartOptions} />
              </div>
            </div>
          )}

          {selectedModule === 'Sitio' && getSitiosMaterialesChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Materiales por Sitio
              </h2>
              <div className="h-80">
                <Pie data={getSitiosMaterialesChart()!} options={pieOptions} />
              </div>
            </div>
          )}

          {selectedModule === 'Movimiento' && getMovimientosTendenciasChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700 col-span-full">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Tendencias de Movimientos
              </h2>
              <div className="h-80">
                <Line data={getMovimientosTendenciasChart()!} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Gráficos generales */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
              Activos vs Inactivos
            </h2>
            <div className="h-80">
              <Bar data={memoizedBarData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
              Nuevos Registros por Mes
            </h2>
            <div className="h-80">
              <Line data={memoizedLineData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {!selectedModule && (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Selecciona un módulo
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elige un módulo del menú desplegable para ver sus gráficos específicos
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraficosPage;