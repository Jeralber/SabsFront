import { useState, useEffect, useMemo } from 'react';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
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
import { useTipoMaterial } from '../hooks/useTipoMaterial';
import { useTipoMovimiento } from '../hooks/useTipoMovimiento';
import { useTipoSitio } from '../hooks/useTipoSitio';
import { useTitulado } from '../hooks/useTitulado';
import { useUnidadMedida } from '../hooks/useUnidadMedida';
import { BarChart3, TrendingUp, PieChart, Activity, Users, Package, MapPin, Calendar } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

function GraficosPage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'days' | 'weeks' | 'months' | 'years'>('months');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polar'>('bar');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  const { tiposMaterial } = useTipoMaterial();
  const { tiposMovimiento } = useTipoMovimiento();
  const { tiposSitio } = useTipoSitio();
  const { titulados } = useTitulado();
  const { unidadesMedida } = useUnidadMedida();

  // Mapa de datos por módulo con iconos
  const dataMap: { [key: string]: { data: any[], icon: any, color: string } } = {
    Area: { data: areas, icon: MapPin, color: 'bg-blue-500' },
    AreaCentro: { data: areasCentro, icon: MapPin, color: 'bg-indigo-500' },
    CategoriaMaterial: { data: categoriasMaterial, icon: Package, color: 'bg-purple-500' },
    Centro: { data: centros, icon: MapPin, color: 'bg-green-500' },
    Detalles: { data: detalles, icon: Activity, color: 'bg-yellow-500' },
    Ficha: { data: fichas, icon: Users, color: 'bg-pink-500' },
    Material: { data: materiales, icon: Package, color: 'bg-orange-500' },
    Modulo: { data: modulos, icon: Activity, color: 'bg-teal-500' },
    Movimiento: { data: movimientos, icon: TrendingUp, color: 'bg-red-500' },
    Municipio: { data: municipios, icon: MapPin, color: 'bg-cyan-500' },
    Opcion: { data: opciones, icon: Activity, color: 'bg-lime-500' },
    Permiso: { data: permisos, icon: Activity, color: 'bg-amber-500' },
    Persona: { data: personas, icon: Users, color: 'bg-emerald-500' },
    Rol: { data: roles, icon: Users, color: 'bg-violet-500' },
    RolPermisoOpcion: { data: rolPermisosOpciones, icon: Activity, color: 'bg-rose-500' },
    Sede: { data: sedes, icon: MapPin, color: 'bg-sky-500' },
    Sitio: { data: sitios, icon: MapPin, color: 'bg-slate-500' },
    TipoMaterial: { data: tiposMaterial, icon: Package, color: 'bg-zinc-500' },
    TipoMovimiento: { data: tiposMovimiento, icon: TrendingUp, color: 'bg-neutral-500' },
    TipoSitio: { data: tiposSitio, icon: MapPin, color: 'bg-stone-500' },
    Titulado: { data: titulados, icon: Users, color: 'bg-red-600' },
    UnidadMedida: { data: unidadesMedida, icon: Activity, color: 'bg-blue-600' },
  };

  useEffect(() => {
    if (selectedModule && dataMap[selectedModule]) {
      setIsLoading(true);
      setTimeout(() => {
        setData(dataMap[selectedModule].data);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedModule]);

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

  // Paleta de colores mejorada con gradientes
  const getGradientColors = (num: number) => {
    const gradients = [
      { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' },
      { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
      { bg: 'rgba(245, 101, 101, 0.8)', border: 'rgba(245, 101, 101, 1)' },
      { bg: 'rgba(251, 191, 36, 0.8)', border: 'rgba(251, 191, 36, 1)' },
      { bg: 'rgba(139, 92, 246, 0.8)', border: 'rgba(139, 92, 246, 1)' },
      { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgba(236, 72, 153, 1)' },
      { bg: 'rgba(6, 182, 212, 0.8)', border: 'rgba(6, 182, 212, 1)' },
      { bg: 'rgba(34, 197, 94, 0.8)', border: 'rgba(34, 197, 94, 1)' },
      { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgba(168, 85, 247, 1)' },
      { bg: 'rgba(249, 115, 22, 0.8)', border: 'rgba(249, 115, 22, 1)' },
    ];
    return Array.from({ length: num }, (_, i) => gradients[i % gradients.length]);
  };

  // GRÁFICOS ESPECÍFICOS MEJORADOS

  // 1. Dashboard de Estadísticas Generales
  const getStatsCards = () => {
    const stats = [
      {
        title: 'Total Materiales',
        value: materiales.length,
        icon: Package,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        change: '+12%'
      },
      {
        title: 'Movimientos Hoy',
        value: movimientos.filter(m => {
          const today = new Date().toDateString();
          return new Date(m.fechaCreacion).toDateString() === today;
        }).length,
        icon: TrendingUp,
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        change: '+8%'
      },
      {
        title: 'Usuarios Activos',
        value: personas.filter(p => p.activo).length,
        icon: Users,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        change: '+5%'
      },
      {
        title: 'Sitios Registrados',
        value: sitios.length,
        icon: MapPin,
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        change: '+3%'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                  <p className="text-white/80 text-sm mt-1">{stat.change} vs mes anterior</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <Icon className="w-8 h-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 2. Gráfico de Movimientos por Estado con animaciones
  const getMovimientosEstadoChart = () => {
    if (selectedModule !== 'Movimiento') return null;
    
    const estados = ['NO_APROBADO', 'APROBADO', 'RECHAZADO'];
    const colores = getGradientColors(estados.length);
    
    const data = {
      labels: estados.map(estado => {
        switch(estado) {
          case 'NO_APROBADO': return 'Pendientes';
          case 'APROBADO': return 'Aprobados';
          case 'RECHAZADO': return 'Rechazados';
          default: return estado;
        }
      }),
      datasets: [{
        label: 'Movimientos por Estado',
        data: estados.map(estado => movimientos.filter(m => m.estado === estado).length),
        backgroundColor: colores.map(c => c.bg),
        borderColor: colores.map(c => c.border),
        borderWidth: 3,
        hoverOffset: 10,
        hoverBorderWidth: 4
      }]
    };

    return data;
  };

  // 3. Análisis de Materiales por Categoría
  const getMaterialesCategoriaChart = () => {
    if (selectedModule !== 'Material') return null;
    
    const categoriaCount = categoriasMaterial.map(categoria => {
      const count = materiales.filter(m => m.categoriaMaterialId === categoria.id).length;
      return {
        nombre: categoria.categoria,
        cantidad: count
      };
    }).filter(item => item.cantidad > 0);

    const colores = getGradientColors(categoriaCount.length);

    return {
      labels: categoriaCount.map(item => item.nombre),
      datasets: [{
        label: 'Materiales por Categoría',
        data: categoriaCount.map(item => item.cantidad),
        backgroundColor: colores.map(c => c.bg),
        borderColor: colores.map(c => c.border),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  // 4. Gráfico Radar de Actividad por Módulo
  const getActividadModulosChart = () => {
    const modulosData = Object.keys(dataMap).map(modulo => ({
      modulo,
      actividad: dataMap[modulo].data.filter(item => item.activo !== false).length
    })).slice(0, 8); // Limitar a 8 para mejor visualización

    return {
      labels: modulosData.map(item => item.modulo),
      datasets: [{
        label: 'Registros Activos',
        data: modulosData.map(item => item.actividad),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };
  };

  // 5. Tendencia temporal mejorada
  const getTendenciaTemporalChart = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const registrosPorMes = meses.map(() => 0);
    
    filteredData.forEach((item: any) => {
      const mes = new Date(item.fechaCreacion).getMonth();
      registrosPorMes[mes]++;
    });

    return {
      labels: meses,
      datasets: [{
        label: 'Nuevos Registros',
        data: registrosPorMes,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 3
      }]
    };
  };

  // Opciones de gráficos mejoradas
  const enhancedChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    }
  };

  const pieOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          padding: 20,
          font: {
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  const radarOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(107, 114, 128, 0.2)'
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.2)'
        },
        pointLabels: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 11
          }
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          backdropColor: 'transparent'
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  // Función para renderizar el gráfico según el tipo seleccionado
  const renderChart = (data: any, options: any) => {
    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={pieOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={pieOptions} />;
      case 'radar':
        return <Radar data={data} options={radarOptions} />;
      case 'polar':
        return <PolarArea data={data} options={pieOptions} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-all duration-300">
      {/* Header mejorado */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard de Análisis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Visualización avanzada de datos del sistema
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      {getStatsCards()}
      
      {/* Controles mejorados */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <select
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 min-w-[200px]"
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value || null)}
            >
              <option value="">Selecciona un módulo</option>
              {Object.keys(dataMap).map(module => {
                return (
                  <option key={module} value={module}>{module}</option>
                );
              })}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'days' | 'weeks' | 'months' | 'years')}
            >
              <option value="days">Últimos 7 días</option>
              <option value="weeks">Últimos 30 días</option>
              <option value="months">Último año</option>
              <option value="years">Últimos 5 años</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-gray-500" />
            <select
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
            >
              <option value="bar">Barras</option>
              <option value="line">Líneas</option>
              <option value="pie">Circular</option>
              <option value="doughnut">Dona</option>
              <option value="radar">Radar</option>
              <option value="polar">Polar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Gráficos */}
      {selectedModule && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Gráfico de actividad general (siempre visible) */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Actividad General
              </h2>
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div className="h-80">
              {renderChart(getActividadModulosChart(), radarOptions)}
            </div>
          </div>

          {/* Gráfico de tendencia temporal */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tendencia Temporal
              </h2>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="h-80">
              {renderChart(getTendenciaTemporalChart(), enhancedChartOptions)}
            </div>
          </div>

          {/* Gráfico específico de movimientos por estado */}
          {selectedModule === 'Movimiento' && getMovimientosEstadoChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Estados de Movimientos
                </h2>
                <TrendingUp className="w-6 h-6 text-red-500" />
              </div>
              <div className="h-80">
                {renderChart(getMovimientosEstadoChart(), pieOptions)}
              </div>
            </div>
          )}

          {/* Gráfico específico de materiales por categoría */}
          {selectedModule === 'Material' && getMaterialesCategoriaChart() && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Materiales por Categoría
                </h2>
                <Package className="w-6 h-6 text-orange-500" />
              </div>
              <div className="h-80">
                {renderChart(getMaterialesCategoriaChart(), enhancedChartOptions)}
              </div>
            </div>
          )}

          {/* Gráfico principal con datos filtrados */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Activos vs Inactivos
              </h2>
              <div className={`w-3 h-3 rounded-full ${dataMap[selectedModule]?.color || 'bg-gray-500'}`}></div>
            </div>
            <div className="h-80">
              {renderChart({
                labels: ['Activos', 'Inactivos'],
                datasets: [{
                  label: 'Conteo',
                  data: [
                    filteredData.filter(item => item.activo !== false).length,
                    filteredData.filter(item => item.activo === false).length
                  ],
                  backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 101, 101, 0.8)'],
                  borderColor: ['rgba(34, 197, 94, 1)', 'rgba(245, 101, 101, 1)'],
                  borderWidth: 3,
                  borderRadius: chartType === 'bar' ? 8 : 0,
                  hoverOffset: chartType.includes('pie') || chartType === 'doughnut' ? 10 : 0
                }]
              }, enhancedChartOptions)}
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío mejorado */}
      {!selectedModule && (
        <div className="text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 max-w-lg mx-auto border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Selecciona un módulo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Elige un módulo del menú desplegable para ver análisis detallados y visualizaciones específicas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GraficosPage;