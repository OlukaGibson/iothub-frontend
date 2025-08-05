import { Link, NavLink, useLocation } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { isAdmin } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Devices", href: "/devices", icon: <Box className="w-5 h-5" /> },
    { name: "Profiles", href: "/profiles", icon: <Users className="w-5 h-5" /> },
    { name: "Firmware", href: "/firmware", icon: <HardDrive className="w-5 h-5" /> },
    // { name: "Data Visualization", path: "/visualization", icon: <BarChart2 className="w-5 h-5" /> },
    // { name: "Upload", path: "/upload", icon: <Upload className="w-5 h-5" /> },
    // { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const adminNavigation = [
    { name: "Users", href: "/users", icon: <UserCheck className="w-5 h-5" /> },
    { name: "Organisations", href: "/organisations", icon: <Building2 className="w-5 h-5" /> },
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
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )
                    }
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                ))}
              </>
            )}
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
