
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import PeriodsPage from "./pages/PeriodsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";

// QueryClient configuration with optimized settings for real-time updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Make data stale immediately to ensure fresh data on refetch
      staleTime: 0,
      // Allow one retry on failure
      retry: 1,
      // Enable automatic refetching when window gets focus
      refetchOnWindowFocus: true,
      // Enable automatic refetching when network reconnects
      refetchOnReconnect: true,
      // Always refetch on mount to ensure latest data
      refetchOnMount: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/settings" element={
              <RequireAuth>
                <Layout>
                  <SettingsPage />
                </Layout>
              </RequireAuth>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
