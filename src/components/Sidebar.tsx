
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Box, 
  HardDrive, 
  Upload, 
  Settings, 
  BarChart2, 
  Users, 
  Server,
  Menu,
  X,
  Building2,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Users", path: "/users", icon: <UserCheck className="w-5 h-5" /> },
    { name: "Organisations", path: "/organisations", icon: <Building2 className="w-5 h-5" /> },
    { name: "Devices", path: "/devices", icon: <Box className="w-5 h-5" /> },
    { name: "Profiles", path: "/profiles", icon: <Users className="w-5 h-5" /> },
    { name: "Firmware", path: "/firmware", icon: <HardDrive className="w-5 h-5" /> },
    // { name: "Data Visualization", path: "/visualization", icon: <BarChart2 className="w-5 h-5" /> },
    // { name: "Upload", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    // { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      )}

      <aside
        className={cn(
          "bg-white border-r border-gray-200 w-64 flex-shrink-0 flex flex-col transition-all duration-300",
          isMobile ? "fixed inset-y-0 left-0 z-40" : "",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Server className="h-6 w-6 text-iot-blue" />
            <span className="text-xl font-bold text-gray-800">IoT Hub</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-iot-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => isMobile && setIsOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-iot-blue text-white flex items-center justify-center font-semibold">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">User</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        </div> */}
      </aside>
    </>
  );
};

export default Sidebar;
