import { useState } from "react";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api, { getUserProfile } from "@/lib/api";
import config from "@/config";
import ProfileDialog from "@/components/ProfileDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state and redirect
      logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        variant: "default"
      });
      navigate('/login');
    }
  };

  const handleProfileClick = async () => {
    if (!user?.user_id) {
      toast({
        title: "Error",
        description: "User ID not available",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingProfile(true);
    setIsProfileDialogOpen(true);
    
    try {
      const profileData = await getUserProfile(user.user_id);
      setUserProfile(profileData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to load profile",
        variant: "destructive"
      });
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">IoT Hub</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-iot-red"></span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                {user?.is_admin && (
                  <p className="text-xs leading-none text-muted-foreground">Administrator</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog
        isOpen={isProfileDialogOpen}
        onClose={() => {
          setIsProfileDialogOpen(false);
          setUserProfile(null);
        }}
        userProfile={userProfile}
        isLoading={isLoadingProfile}
      />
    </header>
  );
};

export default Header;
