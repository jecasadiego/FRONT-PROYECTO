import { Navigate, Route, Routes } from "react-router-dom";
import { ShellLayout } from "./components/ShellLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { DirectorsPage } from "./pages/DirectorsPage";
import { GenresPage } from "./pages/GenresPage";
import { MediaPage } from "./pages/MediaPage";
import { ProducersPage } from "./pages/ProducersPage";
import { PublicCatalogPage } from "./pages/PublicCatalogPage";
import { TypesPage } from "./pages/TypesPage";

export function App() {
  return (
    <Routes>
      <Route path="/catalogo" element={<PublicCatalogPage />} />
      <Route element={<ShellLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/directors" element={<DirectorsPage />} />
        <Route path="/producers" element={<ProducersPage />} />
        <Route path="/types" element={<TypesPage />} />
        <Route path="/media" element={<MediaPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
