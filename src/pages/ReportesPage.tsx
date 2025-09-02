import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Download, FileText, Users, MapPin, Package, Building, TrendingUp, User } from "lucide-react";
import jsPDF from "jspdf";
import {useArea} from "../hooks/useArea";
import {useCentro} from "../hooks/useCentro";
import {useFicha} from "../hooks/useFicha";
import {useMaterial} from "../hooks/useMaterial";
import {useMovimiento} from "../hooks/useMovimiento";
import {useMunicipio} from "../hooks/useMunicipio";
import {usePersona} from "../hooks/usePersona";
import {useSitio} from "../hooks/useSitio";
import {useDetalles} from "../hooks/useDetalles";
import { useAuth } from "../hooks/useAuth"; // Para obtener el usuario actual

const ReportesPage: React.FC = () => {
  const [creationFrom, setCreationFrom] = useState<string>("");
  const [creationTo, setCreationTo] = useState<string>("");
  const [expirationFrom, setExpirationFrom] = useState<string>("");
  const [expirationTo, setExpirationTo] = useState<string>("");
  
  // Filtros
  const [searchText, setSearchText] = useState<string>("");
  const [showOnlyMyRecords, setShowOnlyMyRecords] = useState<boolean>(false);
  
  // Usuario actual
  const { user } = useAuth();
  
  // Hooks para obtener datos
  const { areas } = useArea();
  const { centros } = useCentro();
  const { fichas } = useFicha();
  const { materiales } = useMaterial();
  const { movimientos } = useMovimiento();
  const { municipios } = useMunicipio();
  const { personas } = usePersona();
  const { sitios } = useSitio();
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
      id: "detalles",
      title: "Reporte de Detalles de Movimientos",
      description: "Detalles históricos de todos los movimientos",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-gray-500",
    },
  ];

  const generatePDF = async (module: string) => {
    const data = dataMap[module] || [];
    
    // Filtrar por fechas y usuario (sin búsqueda de texto)
    let filteredData = data;
    
    // Aplicar filtro de "Solo mis registros"
    if (showOnlyMyRecords && user) {
      filteredData = filteredData.filter((item: any) => {
        return (
          item.creadoPor === user.usuario.id ||
          item.createdBy === user.usuario.id ||
          item.usuarioId === user.usuario.id ||
          item.userId === user.usuario.id ||
          item.autor === user.usuario.id ||
          item.responsable === user.usuario.id ||
          item.creadoPor === user.usuario.nombre ||
          item.createdBy === user.usuario.nombre ||
          item.autor === user.usuario.nombre ||
          item.responsable === user.usuario.nombre
        );
      });
    }
    
    // Aplicar filtros de fecha
    if (creationFrom || creationTo || expirationFrom || expirationTo) {
      filteredData = filteredData.filter((item: any) => {
        const createdAt = item.createdAt || item.fechaCreacion ? new Date(item.createdAt || item.fechaCreacion) : null;
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
    
    // Aplicar filtro de búsqueda por texto
    if (searchText.trim()) {
      filteredData = filteredData.filter((item: any) => {
        const searchLower = searchText.toLowerCase();
        const searchableFields = Object.values(item).join(' ').toLowerCase();
        return searchableFields.includes(searchLower);
      });
    }
  
    const doc = new jsPDF();
    
    // Función para agregar logos al encabezado
    const addLogosToHeader = async () => {
      try {
        // Logo SABS (superior izquierdo)
        const sabsLogoResponse = await fetch('/sabs.png');
        const sabsLogoBlob = await sabsLogoResponse.blob();
        const sabsLogoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(sabsLogoBlob);
        });
        
        // Logo SENA (superior derecho)
        const senaLogoResponse = await fetch('/sena.png');
        const senaLogoBlob = await senaLogoResponse.blob();
        const senaLogoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(senaLogoBlob);
        });
        
        // Agregar logo SABS en la esquina superior izquierda
        doc.addImage(sabsLogoDataUrl, 'PNG', 10, 5, 25, 25);
        
        // Agregar logo SENA en la esquina superior derecha
        doc.addImage(senaLogoDataUrl, 'PNG', 175, 5, 25, 25);
        
      } catch (error) {
        console.warn('No se pudieron cargar los logos:', error);
        // Continuar sin logos si hay error
      }
    };
    
    // Función para agregar encabezado con logos
    const addHeaderWithLogos = async (isFirstPage = true) => {
      if (isFirstPage) {
        await addLogosToHeader();
      }
      
      // Título centrado, dejando espacio para los logos
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const title = `Reporte de ${module.charAt(0).toUpperCase() + module.slice(1)}`;
      const titleWidth = doc.getTextWidth(title);
      const centerX = (doc.internal.pageSize.width - titleWidth) / 2;
      doc.text(title, centerX, 20);
      
      if (isFirstPage) {
        // Información adicional del reporte
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 40);
        doc.text(`Total de registros: ${filteredData.length}`, 20, 50);
        
        // Línea separadora
        doc.setDrawColor(0, 0, 0);
        doc.line(20, 55, 190, 55);
      }
    };
    
    // Agregar encabezado inicial con logos
    await addHeaderWithLogos(true);
    
    if (filteredData.length === 0) {
      doc.text('No se encontraron registros con los filtros aplicados.', 20, 70);
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
        movimientos: ['id', 'tipoMovimiento', 'cantidad', 'fechaCreacion', 'material', 'personaSolicitante', 'estado'],
        municipios: ['id', 'nombre', 'departamento', 'codigo'],
        personas: ['id', 'nombre', 'apellido', 'documento', 'email', 'telefono'],
        sitios: ['id', 'nombre', 'descripcion', 'ubicacion', 'tipo'],
        detalles: ['id', 'cantidad', 'material', 'movimiento', 'fechaCreacion']
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
    const tableStartX = 15;
    const tableWidth = 180;
    const columnWidth = tableWidth / columns.length;
    
    let yPosition = 70;
    const pageHeight = 270;
    const rowHeight = 10;
    const headerHeight = 12;
    
    // Función para dibujar tabla con bordes y formato profesional
    const drawTableRow = (y: number, isHeader = false, isAlternate = false) => {
      const rowY = y - 2;
      
      if (isHeader) {
        // Fondo verde elegante para encabezados (más bonito que el azul)
        doc.setFillColor(34, 139, 34); // Verde bosque elegante
        doc.rect(tableStartX, rowY, tableWidth, rowHeight, 'F');
      } else if (isAlternate) {
        // Fondo verde muy claro para filas alternas
        doc.setFillColor(240, 255, 240); // Verde muy suave
        doc.rect(tableStartX, rowY, tableWidth, rowHeight, 'F');
      }
      
      // Bordes de la fila con color más suave
      doc.setDrawColor(180, 180, 180); // Gris más suave
      doc.setLineWidth(0.2); // Líneas un poco más gruesas para mejor definición
      
      // Borde superior
      doc.line(tableStartX, rowY, tableStartX + tableWidth, rowY);
      // Borde inferior
      doc.line(tableStartX, rowY + rowHeight, tableStartX + tableWidth, rowY + rowHeight);
      // Borde izquierdo
      doc.line(tableStartX, rowY, tableStartX, rowY + rowHeight);
      // Borde derecho
      doc.line(tableStartX + tableWidth, rowY, tableStartX + tableWidth, rowY + rowHeight);
      
      // Bordes verticales entre columnas
      for (let i = 1; i < columns.length; i++) {
        const x = tableStartX + (i * columnWidth);
        doc.line(x, rowY, x, rowY + rowHeight);
      }
    };
    
    // Función para agregar encabezados de tabla
    const addTableHeaders = (y: number) => {
      drawTableRow(y, true);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Texto blanco para encabezados
      
      columns.forEach((column, index) => {
        const x = tableStartX + (index * columnWidth) + 2;
        const headerText = column.charAt(0).toUpperCase() + column.slice(1);
        doc.text(headerText, x, y + 6);
      });
      
      doc.setTextColor(0, 0, 0); // Restaurar color negro para el contenido
      doc.setFont('helvetica', 'normal');
      
      return y + headerHeight;
    };
    
    // Agregar encabezados iniciales
    yPosition = addTableHeaders(yPosition);
    
    // Agregar datos
    for (let index = 0; index < filteredData.length; index++) {
      const item = filteredData[index];
      
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight) {
        doc.addPage();
        // Agregar encabezado en nueva página (sin logos)
        await addHeaderWithLogos(false);
        yPosition = 35;
        yPosition = addTableHeaders(yPosition);
      }
      
      // Dibujar fila con color alternado
      const isAlternate = index % 2 === 1;
      drawTableRow(yPosition, false, isAlternate);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      columns.forEach((column, colIndex) => {
        const x = tableStartX + (colIndex * columnWidth) + 2;
        const value = formatValue(item[column]);
        
        // Truncar texto si es muy largo para la celda
        const maxWidth = columnWidth - 4;
        const textWidth = doc.getTextWidth(value);
        let displayText = value;
        
        if (textWidth > maxWidth) {
          // Truncar texto y agregar "..."
          let truncatedText = value;
          while (doc.getTextWidth(truncatedText + '...') > maxWidth && truncatedText.length > 0) {
            truncatedText = truncatedText.slice(0, -1);
          }
          displayText = truncatedText + '...';
        }
        
        doc.text(displayText, x, yPosition + 6);
      });
      
      yPosition += rowHeight;
    }
    
    // Cerrar la tabla con borde inferior
    if (filteredData.length > 0) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(tableStartX, yPosition, tableStartX + tableWidth, yPosition);
    }
    
    // Agregar resumen al final
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      await addHeaderWithLogos(false);
      yPosition = 35;
    }
    
    yPosition += 20;
    
    // Caja de resumen con colores más elegantes
    doc.setFillColor(245, 255, 245); // Verde muy claro y elegante
    doc.setDrawColor(34, 139, 34); // Verde bosque para el borde
    doc.setLineWidth(1);
    doc.rect(15, yPosition - 5, 180, 45, 'FD');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34); // Verde bosque para el título
    doc.text('RESUMEN DEL REPORTE', 20, yPosition + 5); // Sin emoji, texto más elegante
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    yPosition += 12;
    doc.text(`• Total de registros: ${filteredData.length}`, 25, yPosition);
    yPosition += 8;
    doc.text(`• Módulo: ${module.charAt(0).toUpperCase() + module.slice(1)}`, 25, yPosition);
    yPosition += 8;
    doc.text(`• Generado el: ${new Date().toLocaleString('es-ES')}`, 25, yPosition);
    
    if (creationFrom || creationTo || expirationFrom || expirationTo) {
      yPosition += 8;
      doc.text('• Filtros aplicados:', 25, yPosition);
      if (creationFrom) {
        yPosition += 6;
        doc.text(`  - Creación desde: ${new Date(creationFrom).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (creationTo) {
        yPosition += 6;
        doc.text(`  - Creación hasta: ${new Date(creationTo).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (expirationFrom) {
        yPosition += 6;
        doc.text(`  - Expiración desde: ${new Date(expirationFrom).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
      if (expirationTo) {
        yPosition += 6;
        doc.text(`  - Expiración hasta: ${new Date(expirationTo).toLocaleDateString('es-ES')}`, 30, yPosition);
      }
    }
    
    // Pie de página con información institucional
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Línea separadora en el pie con color verde suave
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(0.5);
      doc.line(15, 285, 195, 285);
      
      doc.text('Sistema de Administración de Bodega SENA (SABS)', 20, 290);
      doc.text(`Página ${i} de ${pageCount}`, 170, 290);
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

        {/* Filtro de usuario */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filtro de Usuario
          </h2>
          
          <div className="flex items-center justify-between">
            {/* Checkbox para filtrar por usuario */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyMyRecords}
                  onChange={(e) => setShowOnlyMyRecords(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Solo mostrar mis registros
                  </span>
                </div>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                Filtra para mostrar únicamente los registros que tú has creado o modificado
              </p>
            </div>
            
            {/* Botón limpiar filtros */}
            <button
              onClick={() => {
                setShowOnlyMyRecords(false);
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-sm whitespace-nowrap"
            >
              Limpiar Filtros
            </button>
          </div>
          
          {/* Indicador de filtros activos */}
          {showOnlyMyRecords && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Filtros activos:</strong>
                {showOnlyMyRecords && ` Solo mis registros`}
              </p>
            </div>
          )}
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