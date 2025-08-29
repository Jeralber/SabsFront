import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@heroui/toast";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import MunicipioPage from "./pages/MunicipioPage";
import SitioPage from "./pages/SitioPage";
import SedePage from "./pages/SedePage";
import TituladoPage from "./pages/TituladoPage";
import PersonaPage from "@/pages/PersonaPage";
import FichaPage from "./pages/FichaPage";
import AreaPage from "./pages/AreaPage";
import AdministradorPage from "./pages/AdministradorPage";
import MaterialPage from "./pages/MaterialPage";
import CentroPage from "./pages/CentroPage";
import { Layout } from "@/layout/layout";
import "@/styles/globals.css";
import TipoSitioPage from "./pages/TipoSitioPage";
import MovimientoPage from "./pages/MovimientoPage"; // Ahora será la página principal de inventario
import TipoMaterialPage from "./pages/TipoMaterialPage";
import CategoriaMaterialPage from "./pages/CategoriaMaterialPage";
import UnidadMedidaPage from "./pages/UnidadMedidaPage";
import AreaCentroPage from "./pages/AreaCentroPage";
import AcercaDePage from "./pages/AcercaDePage";
import BodegaPage from "./pages/BodegaPage";
import SitiosPorTipoPage from "./pages/SitiosPorTipoPage";
import MaterialesPorSitioPage from "./pages/MaterialesPorSitioPage";
// Eliminada: import HistorialDetallesPage from "./pages/HistorialDetallesPage";
import ReportesPage from "./pages/ReportesPage";
import GraficosPage from "./pages/GraficosPage";
import ModulosPage from "./pages/ModulosPage";
import NotificacionesPage from "./pages/NotificacionesPage";
import { PasswordRecoveryPage } from "@/pages/PasswordRecoveryPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/reset-password/:token"
            element={<PasswordRecoveryPage />}
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/acerca-de" element={<AcercaDePage />} />
            <Route
              index
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/modulos"
              element={
                <ProtectedRoute module="modulos">
                  <ModulosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notificaciones"
              element={
                <ProtectedRoute module="notificaciones">
                  <NotificacionesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/gestion-inventario"
              element={
                <ProtectedRoute module="inventario">
                  <MovimientoPage />{" "}
                  {/* Ahora MovimientoPage es la página principal de inventario */}
                </ProtectedRoute>
              }
            />
            <Route
              path="personas"
              element={
                <ProtectedRoute module="personas">
                  <PersonaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="fichas"
              element={
                <ProtectedRoute module="fichas">
                  <FichaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="reportes"
              element={
                <ProtectedRoute module="reportes">
                  <ReportesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/areas"
              element={
                <ProtectedRoute module="areas">
                  <AreaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/centros"
              element={
                <ProtectedRoute module="centros">
                  <CentroPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/materiales"
              element={
                <ProtectedRoute module="materiales">
                  <MaterialPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/municipios"
              element={
                <ProtectedRoute module="municipios">
                  <MunicipioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sedes"
              element={
                <ProtectedRoute module="sedes">
                  <SedePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/titulados"
              element={
                <ProtectedRoute module="titulados">
                  <TituladoPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sitios"
              element={
                <ProtectedRoute module="sitios">
                  <SitioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/administracion"
              element={
                <ProtectedRoute requiredPermission="admin.access">
                  <AdministradorPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/areacentros"
              element={
                <ProtectedRoute module="areacentros">
                  <AreaCentroPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tipositios"
              element={
                <ProtectedRoute module="tipositios">
                  <TipoSitioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tipos-material"
              element={
                <ProtectedRoute module="tiposmaterial">
                  <TipoMaterialPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/categorias-material"
              element={
                <ProtectedRoute module="categoriasmaterial">
                  <CategoriaMaterialPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/unidades-medida"
              element={
                <ProtectedRoute module="unidadesmedida">
                  <UnidadMedidaPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bodega"
              element={
                <ProtectedRoute module="bodega">
                  <BodegaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bodega/tipo/:tipoId/sitios"
              element={
                <ProtectedRoute module="bodega">
                  <SitiosPorTipoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bodega/sitio/:sitioId/materiales"
              element={
                <ProtectedRoute module="bodega">
                  <MaterialesPorSitioPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/graficos"
              element={
                <ProtectedRoute module="graficos">
                  <GraficosPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
