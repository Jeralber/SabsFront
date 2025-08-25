import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { FileText, TrendingUp, List } from "lucide-react";
import SolicitudPage from "./SolicitudPage";
import MovimientoPage from "./MovimientoPage";
import HistorialDetallesPage from "./HistorialDetallesPage";

type InventorySection =
  | "solicitud"
  | "movimiento"
  | "detalles"
  | null;

const GestionInventarioPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<InventorySection>(null);

  const inventoryCards = [
    {
      id: "solicitud" as InventorySection,
      title: "Solicitudes",
      description: "Consulta las solicitudes de materiales (Solo lectura)",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-blue-500",
    },
    {
      id: "movimiento" as InventorySection,
      title: "Movimientos",
      description: "Registra movimientos de inventario (No editable después de creación)",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "bg-green-500",
    },
    {
      id: "detalles" as InventorySection,
      title: "Detalles",
      description: "Administra los detalles de las solicitudes",
      icon: <List className="h-8 w-8" />,
      color: "bg-orange-500",
    },
  ];

  const handleCardClick = (sectionId: InventorySection) => {
    console.log("Card clicked:", sectionId); 
    setActiveSection(sectionId);
  };

  const handleBackToCards = () => {
    console.log("Back to cards clicked"); 
    setActiveSection(null);
  };

  const renderActiveSection = () => {
    console.log("Rendering active section:", activeSection); 

    try {
      switch (activeSection) {
        case "solicitud":
          return <SolicitudPage />;
        case "movimiento":
          return <MovimientoPage />;
        case "detalles":
          return <HistorialDetallesPage />;
        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering section:", error);
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error al cargar la página</h3>
          <p>
            Ha ocurrido un error al cargar esta sección. Por favor, revisa la
            consola para más detalles.
          </p>
          <button
            onClick={handleBackToCards}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Volver al menú principal
          </button>
        </div>
      );
    }
  };

  console.log("Current active section:", activeSection);

  if (activeSection) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Panel de Gestión de Inventario
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona los componentes principales del sistema de inventario
              </p>
            </div>
            <button
              onClick={() => setActiveSection(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Volver
            </button>
          </div>
          {renderActiveSection()}
        </div>
      </div>
    );
  }

  const isSectionActive = !!activeSection;

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Panel de Gestión de Inventario
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona los componentes principales del sistema de inventario
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventoryCards.map((card) => (
            <Card
              key={card.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-200"
              onClick={() => {
                console.log("Card onClick triggered for:", card.id); 
                handleCardClick(card.id);
              }}
              isPressable
            >
              <CardHeader className="pb-2">
                <div className={`${card.color} text-white p-3 rounded-lg w-fit`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {card.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Sistema de Notificaciones
          </h2>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Las solicitudes incluyen un sistema de notificaciones automático.
            Cuando se realiza una solicitud, se notifica al aprobador
            correspondiente. Las notificaciones se actualizan según el estado:
            Pendiente, Aprobada, Rechazada, Entregada o Devuelta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GestionInventarioPage;
