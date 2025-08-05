import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import OrganisationsPage from "./pages/OrganisationsPage";
import DevicesPage from "./pages/DevicesPage";
import ProfilesPage from "./pages/ProfilesPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import ProfileDevicesPage from "./pages/ProfileDevicesPage";
import FirmwarePage from "./pages/FirmwarePage";
import VisualizationPage from "./pages/VisualizationPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
            <Route path="/organisations" element={<AdminRoute><OrganisationsPage /></AdminRoute>} />
            <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
            <Route path="/device/:deviceID" element={<ProtectedRoute><DeviceDetailPage /></ProtectedRoute>} />
            <Route path="/profiles" element={<ProtectedRoute><ProfilesPage /></ProtectedRoute>} />
            <Route path="/profiles/:profileId/devices" element={<ProtectedRoute><ProfileDevicesPage /></ProtectedRoute>} />
            <Route path="/firmware" element={<ProtectedRoute><FirmwarePage /></ProtectedRoute>} />
            <Route path="/visualization" element={<ProtectedRoute><VisualizationPage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;