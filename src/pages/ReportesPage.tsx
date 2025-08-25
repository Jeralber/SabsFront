
import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Download, FileText, Users, MapPin, Package, Building, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import {useArea} from "../hooks/useArea";
import {useCentro} from "../hooks/useCentro";
import {useFicha} from "../hooks/useFicha";
import {useMaterial} from "../hooks/useMaterial";
import {useMovimiento} from "../hooks/useMovimiento";
import {useMunicipio} from "../hooks/useMunicipio";
import {usePersona} from "../hooks/usePersona";
import {useSitio} from "../hooks/useSitio";
import {useSolicitud} from "../hooks/useSolicitud";
import {useDetalles} from "../hooks/useDetalles";

const ReportesPage: React.FC = () => {
  const [creationFrom, setCreationFrom] = useState<string>("");
  const [creationTo, setCreationTo] = useState<string>("");
  const [expirationFrom, setExpirationFrom] = useState<string>("");
  const [expirationTo, setExpirationTo] = useState<string>("");

  // Hooks para obtener datos
  const { areas } = useArea();
  const { centros } = useCentro();
  const { fichas } = useFicha();
  const { materiales } = useMaterial();
  const { movimientos } = useMovimiento();
  const { municipios } = useMunicipio();
  const { personas } = usePersona();
  const { sitios } = useSitio();
  const { solicitudes } = useSolicitud();
  const { detalles } = useDetalles();

  const dataMap: Record<string, any[]> = {
    areas,
    centros,
    fichas,
    materiales,
    movimientos,
    municipios,
    personas,
    sitios,
    solicitudes,
    detalles,
  };

  const reportCards = [
    {
      id: "areas",
      title: "Reporte de Áreas",
      description: "Genera un reporte completo de todas las áreas registradas en el sistema",
      icon: <MapPin className="h-8 w-8" />,
      color: "bg-blue-500",
    },
    {
      id: "centros",
      title: "Reporte de Centros",
      description: "Listado detallado de todos los centros y su información",
      icon: <Building className="h-8 w-8" />,
      color: "bg-green-500",
    },
    {
      id: "fichas",
      title: "Reporte de Fichas",
      description: "Información completa de todas las fichas del sistema",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-purple-500",
    },
    {
      id: "materiales",
      title: "Reporte de Materiales",
      description: "Inventario completo de materiales con stock y detalles",
      icon: <Package className="h-8 w-8" />,
      color: "bg-orange-500",
    },
    {
      id: "movimientos",
      title: "Reporte de Movimientos",
      description: "Historial de todos los movimientos de inventario",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "bg-red-500",
    },
    {
      id: "municipios",
      title: "Reporte de Municipios",
      description: "Listado de municipios y su información geográfica",
      icon: <MapPin className="h-8 w-8" />,
      color: "bg-teal-500",
    },
    {
      id: "personas",
      title: "Reporte de Personas",
      description: "Directorio completo de personas registradas",
      icon: <Users className="h-8 w-8" />,
      color: "bg-indigo-500",
    },
    {
      id: "sitios",
      title: "Reporte de Sitios",
      description: "Información de todos los sitios y ubicaciones",
      icon: <Building className="h-8 w-8" />,
      color: "bg-pink-500",
    },
    {
      id: "solicitudes",
      title: "Reporte de Solicitudes",
      description: "Historial completo de solicitudes y su estado",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-yellow-500",
    },
    {
      id: "historialDetalles",
      title: "Reporte de Detalles",
      description: "Detalles históricos de todas las transacciones",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-gray-500",
    },
  ];

  const generatePDF = (module: string) => {
    const data = dataMap[module] || [];
    
    // Filtrar por fechas si están definidas
    let filteredData = data;
    if (creationFrom || creationTo || expirationFrom || expirationTo) {
      filteredData = data.filter((item: any) => {
        const createdAt = item.createdAt ? new Date(item.createdAt) : null;
        const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
        
        let passesCreationFilter = true;
        let passesExpirationFilter = true;
        
        if (creationFrom && createdAt) {
          passesCreationFilter = createdAt >= new Date(creationFrom);
        }
        if (creationTo && createdAt) {
          passesCreationFilter = passesCreationFilter && createdAt <= new Date(creationTo);
        }
        if (expirationFrom && expiresAt) {
          passesExpirationFilter = expiresAt >= new Date(expirationFrom);
        }
        if (expirationTo && expiresAt) {
          passesExpirationFilter = passesExpirationFilter && expiresAt <= new Date(expirationTo);
        }
        
        return passesCreationFilter && passesExpirationFilter;
      });
    }

    const doc = new jsPDF();
    
    // Configuración del documento
    doc.setFontSize(18);
    doc.text(`Reporte de ${module.charAt(0).toUpperCase() + module.slice(1)}`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
    doc.text(`Total de registros: ${filteredData.length}`, 20, 45);
    
    if (filteredData.length === 0) {
      doc.text('No se encontraron registros con los filtros aplicados.', 20, 65);
      doc.save(`reporte_${module}_${new Date().toISOString().split('T')[0]}.pdf`);
      return;
    }

    // Función para obtener las columnas relevantes según el módulo
    const getRelevantColumns = (module: string, data: any[]) => {
      if (data.length === 0) return [];
      
      const sampleItem = data[0];
      const allKeys = Object.keys(sampleItem);
      
      // Definir columnas importantes para cada módulo
      const moduleColumns: Record<string, string[]> = {
        areas: ['id', 'nombre', 'descripcion', 'estado'],
        centros: ['id', 'nombre', 'direccion', 'telefono', 'municipio'],
        fichas: ['id', 'numero', 'nombre', 'estado', 'fechaInicio', 'fechaFin'],
        materiales: ['id', 'nombre', 'descripcion', 'stock', 'stockMinimo', 'precio'],
        movimientos: ['id', 'tipo', 'cantidad', 'fecha', 'material', 'sitio'],
        municipios: ['id', 'nombre', 'departamento', 'codigo'],
        personas: ['id', 'nombre', 'apellido', 'documento', 'email', 'telefono'],
        sitios: ['id', 'nombre', 'descripcion', 'ubicacion', 'tipo'],
        solicitudes: ['id', 'fecha', 'estado', 'solicitante', 'aprobador'],
        historialDetalles: ['id', 'fecha', 'accion', 'usuario', 'descripcion']
      };
      
      const preferredColumns = moduleColumns[module] || [];
      
      // Filtrar solo las columnas que existen en los datos
      const availableColumns = preferredColumns.filter(col => allKeys.includes(col));
      
      // Si no hay columnas preferidas disponibles, usar las primeras 6 columnas
      if (availableColumns.length === 0) {
        return allKeys.slice(0, 6);
      }
      
      return availableColumns;
    };

    // Función para formatear valores
    const formatValue = (value: any): string => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (typeof value === 'object') {
        if (value.nombre) return value.nombre;
        if (value.name) return value.name;
        return JSON.stringify(value).substring(0, 30) + '...';
      }
      if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        // Formatear fechas
        try {
          return new Date(value).toLocaleDateString('es-ES');
        } catch {
          return value;
        }
      }
      return String(value).substring(0, 30);
    };

    const columns = getRelevantColumns(module, filteredData);
    const columnWidth = 180 / columns.length; // Distribuir el ancho disponible
    
    let yPosition = 65;
    const pageHeight = 280;
    const rowHeight = 8;
    const headerHeight = 12;
    
    // Función para agregar encabezados de tabla
    const addTableHeaders = (y: number) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold'); // Cambiar de undefined a 'helvetica'
      
      columns.forEach((column, index) => {
        const x = 20 + (index * columnWidth);
        doc.text(column.charAt(0).toUpperCase() + column.slice(1), x, y);
      });
      
      // Línea debajo del encabezado
      doc.line(20, y + 2, 200, y + 2);
      doc.setFont('helvetica', 'normal'); // Cambiar de undefined a 'helvetica'
      
      return y + headerHeight;
    };
    
    // Agregar encabezados iniciales
    yPosition = addTableHeaders(yPosition);
    
    // Agregar datos
    filteredData.forEach((item: any, index: number) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight) {
        doc.addPage();
        yPosition = 20;
        yPosition = addTableHeaders(yPosition);
      }
      
      doc.setFontSize(9);
      
      columns.forEach((column, colIndex) => {
        const x = 20 + (colIndex * columnWidth);
        const value = formatValue(item[column]);
        doc.text(value, x, yPosition);
      });
      
      yPosition += rowHeight;
      
      // Agregar línea separadora cada 5 filas
      if ((index + 1) % 5 === 0) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 200, yPosition);
        yPosition += 2;
      }
    });
    
    // Agregar resumen al final
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold'); // Cambiar de undefined a 'helvetica'
    doc.text('Resumen del Reporte:', 20, yPosition);
    
    doc.setFont('helvetica', 'normal'); // Cambiar de undefined a 'helvetica'
    doc.setFontSize(9);
    yPosition += 8;
    doc.text(`• Total de registros: ${filteredData.length}`, 25, yPosition);
    yPosition += 6;
    doc.text(`• Módulo: ${module.charAt(0).toUpperCase() + module.slice(1)}`, 25, yPosition);
    yPosition += 6;
    doc.text(`• Generado el: ${new Date().toLocaleString('es-ES')}`, 25, yPosition);
    
    if (creationFrom || creationTo || expirationFrom || expirationTo) {
      yPosition += 6;
      doc.text('• Filtros aplicados:', 25, yPosition);
      if (creationFrom) {
        yPosition += 5;
        doc.text(`  - Creación desde: ${new Date(creationFrom).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (creationTo) {
        yPosition += 5;
        doc.text(`  - Creación hasta: ${new Date(creationTo).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (expirationFrom) {
        yPosition += 5;
        doc.text(`  - Expiración desde: ${new Date(expirationFrom).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (expirationTo) {
        yPosition += 5;
        doc.text(`  - Expiración hasta: ${new Date(expirationTo).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
    }
    
    doc.save(`reporte_${module}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Panel de Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Genera y descarga reportes detallados del sistema
          </p>
        </div>

        {/* Filtros de fecha */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filtros de Fecha
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creación desde:
              </label>
              <input
                type="date"
                value={creationFrom}
                onChange={(e) => setCreationFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creación hasta:
              </label>
              <input
                type="date"
                value={creationTo}
                onChange={(e) => setCreationTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiración desde:
              </label>
              <input
                type="date"
                value={expirationFrom}
                onChange={(e) => setExpirationFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiración hasta:
              </label>
              <input
                type="date"
                value={expirationTo}
                onChange={(e) => setExpirationTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Cards de reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reportCards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-600"
              onClick={() => generatePDF(card.id)}
              isPressable
            >
              <CardHeader className="pb-2">
                <div className={`${card.color} text-white p-3 rounded-lg w-fit`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {card.description}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                  <Download className="h-4 w-4 mr-1" />
                  Haz clic para descargar
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Información sobre los Reportes
          </h2>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Los reportes se generan en formato PDF y incluyen todos los datos disponibles del módulo seleccionado. 
            Puedes usar los filtros de fecha para limitar los resultados según las fechas de creación o expiración de los registros.
            Los reportes se descargan automáticamente al hacer clic en cada card.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;