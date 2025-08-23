
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useArea } from '../hooks/useArea';
import { useAreaCentro } from '../hooks/useAreaCentro';
import { useCategoriaMaterial } from '../hooks/useCategoriaMaterial';
import { useCentro } from '../hooks/useCentro';
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

const ReportesPage = () => {
  const { areas } = useArea();
  const { areasCentro } = useAreaCentro();
  const { categoriasMaterial } = useCategoriaMaterial();
  const { centros } = useCentro();
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

  const dataMap = {
    Area: areas,
    AreaCentro: areasCentro,
    CategoriaMaterial: categoriasMaterial,
    Centro: centros,
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

  const modules = Object.keys(dataMap);

  const [creationFrom, setCreationFrom] = useState('');
  const [creationTo, setCreationTo] = useState('');
  const [expirationFrom, setExpirationFrom] = useState('');
  const [expirationTo, setExpirationTo] = useState('');

  const generatePDF = (moduleName: string) => {
    const doc = new jsPDF();
    let filteredData = dataMap[moduleName as keyof typeof dataMap] || [];
  
    // Aplicar filtro por fecha de creación
    if (creationFrom || creationTo) {
        filteredData = filteredData.filter((item: { fechaCreacion: Date }) => {
            const creationDate = new Date(item.fechaCreacion);
            const from = creationFrom ? new Date(creationFrom) : new Date(0);
            const to = creationTo ? new Date(creationTo) : new Date();
            return creationDate >= from && creationDate <= to;
        });
    }
  
    // Filtro por fecha de vencimiento solo para Material
    if (moduleName === 'Material' && (expirationFrom || expirationTo)) {
        filteredData = filteredData.filter((item: { fechaVencimiento: Date }) => {
            if (!item.fechaVencimiento) return false;
            const expDate = new Date(item.fechaVencimiento);
            const from = expirationFrom ? new Date(expirationFrom) : new Date(0);
            const to = expirationTo ? new Date(expirationTo) : new Date();
            return expDate >= from && expDate <= to;
        });
    }

    filteredData.forEach((item: Record<string, any>, index: number) => {

      doc.text(JSON.stringify(item), 10, 20 + (index * 10));
    });
    doc.save(`${moduleName}_report.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Reportes</h1>
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Filtros</h2>
            <div className="flex flex-wrap gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha Creación Desde: </label>
                    <input type="date" value={creationFrom} onChange={e => setCreationFrom(e.target.value)} className="mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hasta: </label>
                    <input type="date" value={creationTo} onChange={e => setCreationTo(e.target.value)} className="mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha Vencimiento Desde (solo Material): </label>
                    <input type="date" value={expirationFrom} onChange={e => setExpirationFrom(e.target.value)} className="mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Hasta: </label>
                    <input type="date" value={expirationTo} onChange={e => setExpirationTo(e.target.value)} className="mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
                <div
                    key={module}
                    className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-blue-500"
                    onClick={() => generatePDF(module)}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800">{module}</h3>
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <p className="text-gray-600 mt-2">Haz clic para descargar el reporte en PDF</p>
                </div>
            ))}
        </div>
    </div>
);
};

export default ReportesPage;