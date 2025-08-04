import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/organisations" element={<OrganisationsPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/device/:deviceID" element={<DeviceDetailPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/profiles/:profileId/devices" element={<ProfileDevicesPage />} />
          <Route path="/firmware" element={<FirmwarePage />} />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;