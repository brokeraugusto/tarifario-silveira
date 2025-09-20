
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import PeriodsPage from "./pages/PeriodsPage";
import MaintenancePage from "./pages/MaintenancePage";
import ReservationsPage from "./pages/ReservationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import RequireAuth from "./components/RequireAuth";
import { CopyConfigProvider } from "./contexts/CopyConfigContext";

const App = () => (
  <CopyConfigProvider>
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/" element={
        <RequireAuth>
          <Layout>
            <HomePage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/search" element={
        <RequireAuth>
          <Layout>
            <SearchPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/accommodations" element={
        <RequireAuth>
          <Layout>
            <AccommodationsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/periods" element={
        <RequireAuth>
          <Layout>
            <PeriodsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/reservations" element={
        <RequireAuth>
          <Layout>
            <ReservationsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/maintenance" element={
        <RequireAuth>
          <Layout>
            <MaintenancePage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="/settings" element={
        <RequireAuth>
          <Layout>
            <SettingsPage />
          </Layout>
        </RequireAuth>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </CopyConfigProvider>
);

export default App;
