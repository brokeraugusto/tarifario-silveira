
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import SearchPage from "./pages/SearchPage";
import NewSearchPage from "./pages/NewSearchPage";
import PeriodsPage from "./pages/PeriodsPage";
import HomePage from "./pages/HomePage";
import MaintenancePage from "./pages/MaintenancePage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }>
                <Route index element={<Index />} />
                <Route path="home" element={<HomePage />} />
                <Route path="accommodations" element={<AccommodationsPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="new-search" element={<NewSearchPage />} />
                <Route path="periods" element={<PeriodsPage />} />
                <Route path="maintenance" element={<MaintenancePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
