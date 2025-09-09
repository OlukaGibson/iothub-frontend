
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, RefreshCw, Download, WifiOff, Wifi } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import config from "@/config";
import { useToast } from "@/components/ui/use-toast";

// Define the device interface based on the API response
interface Device {
  id: string; // UUID in FastAPI
  name: string;
  deviceID: number; // Integer in FastAPI
  networkID: string | null;
  profile: string; // UUID in FastAPI
  profile_name: string | null;
  currentFirmwareVersion: string | null; // UUID in FastAPI
  previousFirmwareVersion: string | null; // UUID in FastAPI  
  targetFirmwareVersion: string | null; // UUID in FastAPI
  firmwareDownloadState: string | null;
  fileDownloadState: boolean | null;
  readkey: string;
  writekey: string;
  created_at: string | null;
  last_posted_time: string | null;
}

interface Profile {
  id: string; // UUID in FastAPI
  name: string;
  description?: string | null;
  fields?: { [key: string]: string | null } | null;
  configs?: { [key: string]: string | null } | null;
  metadata?: { [key: string]: string | null } | null;
  organisation_id: string; // UUID
  created_at: string | null;
  device_count?: number;
}

interface FirmwareVersion {
  id: string; // UUID in FastAPI
  organisation_id: string; // UUID
  firmware_version: string;
  firmware_type?: "stable" | "beta" | "deprecated" | "legacy" | null;
  description?: string | null;
  change1?: string | null;
  change2?: string | null;
  change3?: string | null;
  change4?: string | null;
  change5?: string | null;
  change6?: string | null;
  change7?: string | null;
  change8?: string | null;
  change9?: string | null;
  change10?: string | null;
  firmware_string: string;
  firmware_string_hex?: string | null;
  firmware_string_bootloader?: string | null;
  created_at: string;
  updated_at: string;
}

// Define the form state interface
interface DeviceForm {
  name: string;
  networkID: string;
  profile: string;
  currentFirmwareVersion: string;
}

// Helper function to get firmware type badge styles
const getFirmwareTypeBadge = (type: string | null | undefined) => {
  if (!type) return null;
  
  switch (type.toLowerCase()) {
    case "stable":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stable</Badge>;
    case "beta":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Beta</Badge>;
    case "deprecated":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Deprecated</Badge>;
    case "legacy":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Legacy</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

// Helper function to get firmware type priority for sorting
const getFirmwareTypePriority = (type: string | null | undefined) => {
  switch (type?.toLowerCase()) {
    case "stable":
      return 1;
    case "beta":
      return 2;
    case "legacy":
      return 3;
    case "deprecated":
      return 4;
    default:
      return 5; // Unknown types go last
  }
};

const DevicesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [newDeviceDialog, setNewDeviceDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const [firmwareFilter, setFirmwareFilter] = useState("all");
  
  // Form state
  const [formData, setFormData] = useState<DeviceForm>({
    name: "",
    networkID: "",
    profile: "",
    currentFirmwareVersion: ""
  });
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch devices using React Query
  const { data: devicesData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/device`);
      return response.data || [];
    }
  });

  // Ensure devices is always an array
  const devices = Array.isArray(devicesData) ? devicesData : [];
  const [updateFirmwareDialog, setUpdateFirmwareDialog] = useState(false);
  // Fetch firmware versions for the dropdown ONLY when dialog is open
  const { data: firmwareVersionsData = [] } = useQuery<FirmwareVersion[]>({
    queryKey: ['firmwares'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/firmware`);
      return response.data || [];
    },
    enabled: newDeviceDialog || updateFirmwareDialog // Enable when either dialog is open
  });

  // Ensure firmwareVersions is always an array
  const firmwareVersions: FirmwareVersion[] = Array.isArray(firmwareVersionsData) ? firmwareVersionsData : [];

  // Sort firmware versions by type priority, then by creation date (newest first)
  const sortedFirmwareVersions = [...firmwareVersions].sort((a, b) => {
    const priorityA = getFirmwareTypePriority(a.firmware_type);
    const priorityB = getFirmwareTypePriority(b.firmware_type);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by created_at (newest first)
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  });

  // Fetch profiles using React Query ONLY when dialog is open
  const { data: profilesData = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/profiles`);
      return response.data || [];
    },
    enabled: newDeviceDialog // Only fetch when dialog is open
  });

  // Ensure profiles is always an array
  const profiles = Array.isArray(profilesData) ? profilesData : [];

  // Function to determine if a device is online based on last_posted_time
  const isDeviceOnline = (lastPostedTime: string | null): boolean => {
    if (!lastPostedTime) return false;
    
    const lastPosted = new Date(lastPostedTime);
    const now = new Date();
    
    // Check if last_posted_time is more than 3 hours ago
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    return (now.getTime() - lastPosted.getTime()) < threeHoursInMs;
  };

  // Format the time since last active
  const formatLastActive = (lastPostedTime: string | null): string => {
    if (!lastPostedTime) return "Never";
    
    const lastPosted = new Date(lastPostedTime);
    const now = new Date();
    const diffMs = now.getTime() - lastPosted.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Handle form input changes
  const handleFormChange = (field: keyof DeviceForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleAddDevice = async () => {
    // Validate form data
    if (!formData.name || !formData.profile) {
      toast({
        title: "Missing Fields",
        description: "Please fill in name and profile",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Create JSON data object for submission (not FormData for FastAPI)
    const submitData = {
      name: formData.name,
      networkID: formData.networkID || null,
      profile: formData.profile,
      currentFirmwareVersion: formData.currentFirmwareVersion || null,
      previousFirmwareVersion: null,
      targetFirmwareVersion: null,
      fileDownloadState: false,
      firmwareDownloadState: "updated"
    };
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/device`, submitData);
      
      toast({
        title: "Success",
        description: "Device added successfully",
        variant: "default"
      });
      
      // Close dialog and reset form
      setNewDeviceDialog(false);
      setFormData({
        name: "",
        networkID: "",
        profile: "",
        currentFirmwareVersion: ""
      });
      
      // Refetch the devices list
      refetch();
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add device",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: "",
        networkID: "",
        profile: "",
        currentFirmwareVersion: ""
      });
    } else {
      // Prefetch the data when dialog opens
      queryClient.prefetchQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
          const response = await axios.get(`${config.API_BASE_URL}/profiles`);
          return response.data || [];
        }
      });
      
      queryClient.prefetchQuery({
        queryKey: ['firmwares'],
        queryFn: async () => {
          const response = await axios.get(`${config.API_BASE_URL}/firmware`);
          return response.data || [];
        }
      });
    }
    setNewDeviceDialog(open);
  };

  // Filter devices based on search term, status filter, and profile filter
  const filteredDevices = devices.filter(
    (device) => {
      // Text search filter
      const matchesSearch = 
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.deviceID.toString().includes(searchTerm.toLowerCase()) ||
        (device.profile_name && device.profile_name.toLowerCase().includes(searchTerm.toLowerCase()));
  
      // Status filter
      const status = isDeviceOnline(device.last_posted_time) ? "online" : "offline";
      const matchesStatus = statusFilter === "all" || status === statusFilter;
  
      // Profile filter
      const matchesProfile = profileFilter === "all" || device.profile_name === profileFilter;
      
      // Firmware status filter
      const matchesFirmware = firmwareFilter === "all" || 
        (device.firmwareDownloadState && device.firmwareDownloadState.toLowerCase() === firmwareFilter);
  
      return matchesSearch && matchesStatus && matchesProfile && matchesFirmware;
    }
  );

  // Extract unique profiles for the filter dropdown
  const uniqueProfiles = Array.from(new Set(devices
    .map(device => device.profile_name)
    .filter(Boolean)));
  
  // Extract profile data from devices if profile API isn't available
  const profilesFromDevices = React.useMemo(() => {
    const profileMap = new Map<string, string>();
    devices.forEach(device => {
      if (device.profile && device.profile_name) {
        profileMap.set(device.profile, device.profile_name);
      }
    });
    
    return Array.from(profileMap.entries()).map(([id, name]) => ({
      id,
      name
    }));
  }, [devices]);
  
  // Use dedicated profiles endpoint data if available, otherwise use extracted profiles
  const availableProfiles = profiles.length > 0 ? profiles : profilesFromDevices;

  const getFirmwareStatusStyle = (status: string | null) => {
    if (!status) return { color: "bg-gray-100", text: "Unknown" };
    
    switch (status.toLowerCase()) {
      case "updated":
        return { color: "bg-green-100 text-green-800 border-green-200", text: "Updated" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "Pending" };
      case "failed":
        return { color: "bg-red-100 text-red-800 border-red-200", text: "Failed" };
      default:
        return { color: "bg-gray-100", text: status };
    }
  };

  // Add these state variables at the beginning of the component

const [selectedDeviceForUpdate, setSelectedDeviceForUpdate] = useState<Device | null>(null);
const [selectedFirmwareId, setSelectedFirmwareId] = useState<string>("");
const [isUpdatingFirmware, setIsUpdatingFirmware] = useState(false);

// Add this handler function for initiating the firmware update
const handleFirmwareUpdate = async () => {
  if (!selectedDeviceForUpdate || !selectedFirmwareId) {
    toast({
      title: "Error",
      description: "Please select a firmware version",
      variant: "destructive"
    });
    return;
  }

  setIsUpdatingFirmware(true);
  
  try {
    // Find the selected firmware to get its version
    const selectedFirmware = firmwareVersions.find(fw => fw.id.toString() === selectedFirmwareId);
    
    if (!selectedFirmware) {
      throw new Error("Selected firmware not found");
    }
    
    const response = await axios.post(
      `${config.API_BASE_URL}/device/${selectedDeviceForUpdate.deviceID}/update_firmware`,
      {
        firmwareID: selectedFirmwareId,
        firmwareVersion: selectedFirmware.firmware_version
      }
    );
    
    toast({
      title: "Success",
      description: response.data.message || "Firmware update initiated",
      variant: "default"
    });
    
    // Close the dialog and reset selected values
    setUpdateFirmwareDialog(false);
    setSelectedDeviceForUpdate(null);
    setSelectedFirmwareId("");
    
    // Refresh the device list to show updated status
    refetch();
    
  } catch (err: any) {
    console.error("Error updating firmware:", err);
    toast({
      title: "Update Failed",
      description: err.response?.data?.message || "Failed to update firmware",
      variant: "destructive"
    });
  } finally {
    setIsUpdatingFirmware(false);
  }
};

// Add this function to open the firmware update dialog
const openFirmwareUpdateDialog = (device: Device) => {
  setSelectedDeviceForUpdate(device);
  setSelectedFirmwareId(device.currentFirmwareVersion || "");
  
  // Prefetch firmware data before opening the dialog
  queryClient.prefetchQuery({
    queryKey: ['firmwares'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/firmware`);
      return response.data || [];
    }
  });
  
  setUpdateFirmwareDialog(true);
};

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Devices</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your IoT devices</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={newDeviceDialog} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="bg-iot-blue hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Device
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Enter the details for the new device you want to add to your network.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Device name" 
                    className="col-span-3" 
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="networkID" className="text-right">
                    Network ID
                  </Label>
                  <Input 
                    id="networkID" 
                    placeholder="Network ID" 
                    className="col-span-3" 
                    value={formData.networkID}
                    onChange={(e) => handleFormChange('networkID', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profile" className="text-right">
                    Profile
                  </Label>
                  <Select 
                    value={formData.profile}
                    onValueChange={(value) => handleFormChange('profile', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProfiles.map((profile) => (
                        <SelectItem 
                          key={profile.id} 
                          value={profile.id.toString()}
                        >
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firmware" className="text-right">
                    Firmware
                  </Label>
                  <Select
                    value={formData.currentFirmwareVersion}
                    onValueChange={(value) => handleFormChange('currentFirmwareVersion', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select firmware version" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedFirmwareVersions.map((firmware) => (
                        <SelectItem 
                          key={firmware.id} 
                          value={firmware.id.toString()}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{firmware.firmware_version}</span>
                            {getFirmwareTypeBadge(firmware.firmware_type)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewDeviceDialog(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </>
                  ) : "Add Device"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search devices..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
            <div className="flex space-x-2">
              {/* <Button 
                variant="outline" 
                className="shrink-0" 
                title="Refresh device list"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button> */}
              {/* <Button variant="outline" className="shrink-0" title="Download device data">
                <Download className="h-4 w-4" />
              </Button> */}
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {uniqueProfiles.map((profile) => (
                    <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={firmwareFilter} onValueChange={setFirmwareFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by firmware" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All F.O.T.A. States</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="pending">Pending Updates</SelectItem>
                  <SelectItem value="failed">Failed Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Device List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Network ID</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Firmware</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="ml-2">Loading devices...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-500">
                      Failed to load devices. Please try refreshing.
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="h-96"> {/* Use colSpan equal to number of columns */}
                        <div className="flex flex-col items-center justify-center h-full">
                          <Box className="h-12 w-12 text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900"> No Device </h3>
                          <p className="mt-1 text-gray-500">Try adjusting your search or create a new Firmware.</p>
                          <Button className="mt-6 bg-iot-blue hover:bg-blue-700" onClick={() => setNewDeviceDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Device
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ) : (
                  filteredDevices.map((device) => {
                    const deviceStatus = isDeviceOnline(device.last_posted_time) ? "online" : "offline";
                    return (
                    <TableRow key={device.id}>
                      <TableCell>
                        {deviceStatus === "online" ? (
                          <Wifi className="h-5 w-5 text-green-500" />
                        ) : (
                          <WifiOff className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.deviceID}</TableCell>
                      <TableCell>{device.networkID}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100">
                          {device.profile_name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.currentFirmwareVersion ? (
                          <div className="relative group">
                            <Badge 
                              variant="outline" 
                              className={`${getFirmwareStatusStyle(device.firmwareDownloadState).color} transition-all`}
                            >
                              {device.currentFirmwareVersion}
                              {/* <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-8 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {getFirmwareStatusStyle(device.firmwareDownloadState).text}
                              </span> */}
                            </Badge>
                          </div>
                        ) : (
                          "None"
                        )}
                      </TableCell>
                      <TableCell>{formatLastActive(device.last_posted_time)}</TableCell>
                      <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8"
                        onClick={() => navigate(`/device/${device.deviceID}`)} // Use deviceID for the route
                      >
                        <div className="relative group">
                          <Badge 
                            variant="outline" 
                            className="bg-gray-100"
                          >
                            View
                          </Badge>
                        </div>
                      </Button>
                      
                      <Button 
  variant="ghost" 
  size="sm" 
  className="h-8"
  onClick={() => openFirmwareUpdateDialog(device)}
>
  <div className="relative group">
    <Badge 
      variant="outline" 
      className="bg-gray-100"
    >
      Firmware Update
    </Badge>
  </div>
</Button>
                    </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={updateFirmwareDialog} onOpenChange={setUpdateFirmwareDialog}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Update Device Firmware</DialogTitle>
      <DialogDescription>
        {selectedDeviceForUpdate && (
          <>Update firmware for device <span className="font-semibold">{selectedDeviceForUpdate.name}</span> ({selectedDeviceForUpdate.deviceID})</>
        )}
      </DialogDescription>
    </DialogHeader>

    <div className="py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Current Firmware</p>
            <p className="text-sm text-gray-500">
              {selectedDeviceForUpdate?.currentFirmwareVersion || "Not set"}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className={
              selectedDeviceForUpdate?.firmwareDownloadState ? 
              getFirmwareStatusStyle(selectedDeviceForUpdate.firmwareDownloadState).color : 
              "bg-gray-100"
            }
          >
            {selectedDeviceForUpdate?.firmwareDownloadState ? 
              getFirmwareStatusStyle(selectedDeviceForUpdate.firmwareDownloadState).text : 
              "Unknown"}
          </Badge>
        </div>

        <div className="space-y-2">
  <Label htmlFor="firmwareVersion">Select Target Firmware Version</Label>
  {sortedFirmwareVersions.length === 0 ? (
    <div className="flex items-center space-x-2 py-2">
      <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-sm text-gray-500">Loading firmware versions...</span>
    </div>
  ) : (
    <Select
      value={selectedFirmwareId}
      onValueChange={setSelectedFirmwareId}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a firmware version" />
      </SelectTrigger>
      <SelectContent>
        {sortedFirmwareVersions.map((firmware) => (
          <SelectItem 
            key={firmware.id} 
            value={firmware.id.toString()}
          >
            <div className="flex items-center space-x-2">
              <span>{firmware.firmware_version}</span>
              {getFirmwareTypeBadge(firmware.firmware_type)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
</div>
        
        <div className="bg-amber-50 p-3 rounded border border-amber-200 mt-4">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> The firmware update will be queued and deployed the next time the device connects to the server.
          </p>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setUpdateFirmwareDialog(false)} disabled={isUpdatingFirmware}>
        Cancel
      </Button>
      <Button onClick={handleFirmwareUpdate} disabled={isUpdatingFirmware}>
        {isUpdatingFirmware ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Updating...
          </>
        ) : "Update Firmware"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </Layout>
  );
};

export default DevicesPage;
