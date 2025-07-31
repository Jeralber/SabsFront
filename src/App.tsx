import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@heroui/toast";
import { PrivateRoute } from "@/routes/PrivateRoute";
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
import GestionInventarioPage from "./pages/GestionInventarioPage";
import TipoMaterialPage from "./pages/TipoMaterialPage";
import CategoriaMaterialPage from "./pages/CategoriaMaterialPage";
import UnidadMedidaPage from "./pages/UnidadMedidaPage";
import AreaCentroPage from "./pages/AreaCentroPage";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route path="personas" element={<PersonaPage />} />
            <Route path="fichas" element={<FichaPage />} />
            <Route path="/areas" element={<AreaPage />} />
            <Route path="/centros" element={<CentroPage />} />
            <Route path="/materiales" element={<MaterialPage />} />
            <Route path="/municipios" element={<MunicipioPage />} />
            <Route path="/sedes" element={<SedePage />} />
            <Route path="/titulados" element={<TituladoPage />} />
            <Route path="/sitios" element={<SitioPage />} />
            <Route path="/administracion" element={<AdministradorPage />} />
            <Route path="/areacentros" element={<AreaCentroPage />} />
            <Route
              path="/gestion-inventario"
              element={<GestionInventarioPage />}
            />
            <Route path="/tipositios" element={<TipoSitioPage />} />
            <Route path="/tipos-material" element={<TipoMaterialPage />} />
            <Route
              path="/categorias-material"
              element={<CategoriaMaterialPage />}
            />
            <Route path="/unidades-medida" element={<UnidadMedidaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
