import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import config from "@/config";
import {
  ChevronLeft,
  Search,
  Settings,
  AlertTriangle,
  Info,
  Box,
  RefreshCw,
  PlusCircle,
  Loader2,
  Check
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";

interface DeviceConfig {
  [key: string]: string;
}

interface Device {
  name: string;
  deviceID: string;
  recent_config: DeviceConfig;
}

interface ProfileDetails {
  id: number;
  name: string;
  description: string;
  created_at: string;
  fields: Record<string, string>;
  configs: Record<string, string>;
  metadata: Record<string, string>; // Added metadata field
  devices: Device[];
}

interface ConfigFormValues {
  [key: string]: string;
}

const ProfileDevicesPage = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Setup form for config modal
  const form = useForm<ConfigFormValues>({
    defaultValues: {},
  });

  const {
    data: profileData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/profiles/${profileId}`);
      return response.data as ProfileDetails;
    },
    enabled: !!profileId,
  });

  // Mutation for updating configs
  const updateConfigsMutation = useMutation({
    mutationFn: async (formData: ConfigFormValues) => {
      const configValues: Record<string, string> = {};
      
      // Extract config values from form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key.startsWith('config')) {
          configValues[key] = value;
        }
      });

      const payload = {
        device_ids: selectedDevices,
        config_values: configValues
      };

      const response = await axios.post(
        `${config.API_BASE_URL}/config/mass_edit`, 
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Configurations updated",
        description: `Updated ${data.results.success.length} devices successfully.`,
      });
      setConfigModalOpen(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error updating configurations",
        description: "Failed to update configurations. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Open config modal and set form defaults
  const handleOpenConfigModal = () => {
    if (selectedDevices.length === 0) {
      // toast({
      //   title: "Reclick to configure",
      //   description: "Reclick to configure device the selected device or select more devices.",
      //   variant: "default",
      // });
      return;
    }

    // Reset form with empty values for all config fields
    const defaultValues: ConfigFormValues = {};
    if (profileData) {
      Object.entries(profileData.configs).forEach(([key, _]) => {
        defaultValues[key] = "";
      });
    }
    
    form.reset(defaultValues);
    setConfigModalOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: ConfigFormValues) => {
    updateConfigsMutation.mutate(data);
  };

  // Toggle device selection
  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  // Select all devices
  const selectAllDevices = () => {
    if (filteredDevices.length > 0) {
      if (selectedDevices.length === filteredDevices.length) {
        // If all are selected, deselect all
        setSelectedDevices([]);
      } else {
        // Otherwise select all
        setSelectedDevices(filteredDevices.map(device => device.deviceID));
      }
    }
  };

  // Filter devices based on search term
  const filteredDevices = profileData?.devices?.filter((device) => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceID.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0 -ml-3" 
            onClick={() => navigate('/profiles')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to profiles
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{profileData?.name || 'Profile'} Devices</h1>
          <p className="text-gray-600 mt-1">
            {profileData?.description || 'Manage devices associated with this profile'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          {/* <Button className="bg-iot-blue hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Device
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profileData?.devices?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Data Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profileData ? Object.values(profileData.fields).length : 0}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {profileData && Object.values(profileData.fields).slice(0, 3).map((field, i) => (
                <Badge key={i} variant="outline">{field}</Badge>
              ))}
              {profileData && Object.values(profileData.fields).length > 3 && (
                <Badge variant="outline">+{Object.values(profileData.fields).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profileData ? Object.values(profileData.configs).length : 0}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {profileData && Object.values(profileData.configs).slice(0, 3).map((config, i) => (
                <Badge key={i} variant="outline">{config}</Badge>
              ))}
              {profileData && Object.values(profileData.configs).length > 3 && (
                <Badge variant="outline">+{Object.values(profileData.configs).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* New card for metadata */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profileData ? Object.values(profileData.metadata).length : 0}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {profileData && Object.values(profileData.metadata).slice(0, 3).map((meta, i) => (
                <Badge key={i} variant="outline">{meta}</Badge>
              ))}
              {profileData && Object.values(profileData.metadata).length > 3 && (
                <Badge variant="outline">+{Object.values(profileData.metadata).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="mb-4 sm:mb-0 w-full sm:w-auto max-w-md">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search devices by name or ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> */}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {selectedDevices.length} {selectedDevices.length === 1 ? 'device' : 'devices'} selected
          </span>
          <Button 
            onClick={handleOpenConfigModal}
            disabled={selectedDevices.length === 0}
            className="bg-iot-blue hover:bg-blue-700"
          >
            <Settings className="h-4 w-4 mr-2" /> Configure Selected
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Device List</CardTitle>
          <CardDescription>
            All devices configured with this profile
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-500">Loading devices...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
            <p>Failed to load device data. Please try again later.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        ) : !profileData?.devices?.length ? (
          <div className="text-center py-10 text-gray-500">
            <Box className="h-10 w-10 mx-auto mb-2" />
            <p>No devices found for this profile.</p>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Search className="h-10 w-10 mx-auto mb-2" />
            <p>No devices found. Try a different search term or add a new device.</p>
            <div className="flex justify-center space-x-2 mt-4">
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
              <Button className="bg-iot-blue hover:bg-blue-700">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Device
              </Button>
            </div>
          </div>
        ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredDevices.length > 0 &&
                        selectedDevices.length === filteredDevices.length
                      }
                      onCheckedChange={selectAllDevices}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Device ID</TableHead>
                  {profileData && Object.values(profileData.configs).map((configName, index) => (
                    <TableHead key={index}>{configName}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.deviceID}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDevices.includes(device.deviceID)}
                        onCheckedChange={() => toggleDeviceSelection(device.deviceID)}
                        aria-label={`Select ${device.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-gray-800 text-xs">
                        {device.deviceID}
                      </code>
                    </TableCell>
                    
                    {/* Display each configuration value in its own cell */}
                    {profileData && Object.entries(profileData.configs).map(([configKey, configName], index) => {
                      // Extract config number from key (e.g., 'config1' -> '1')
                      const configNum = configKey.replace('config', '');
                      // Find the corresponding value in device's recent_config
                      const configValue = device.recent_config ? device.recent_config[`config${configNum}`] : null;
                      
                      return (
                        <TableCell key={index}>
                          {configValue ? (
                            <span className="text-sm">{configValue}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not set</span>
                          )}
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setSelectedDevices([device.deviceID]);
                            handleOpenConfigModal();
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" /> Configure
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Configure Devices</DialogTitle>
            <DialogDescription>
              Update configuration for {selectedDevices.length} selected {selectedDevices.length === 1 ? 'device' : 'devices'}.
              Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                {profileData && Object.entries(profileData.configs).map(([configKey, configLabel]) => (
                  <FormField
                    key={configKey}
                    control={form.control}
                    name={configKey}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <FormLabel className="text-sm font-medium">{configLabel}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={`Enter value for ${configLabel}...`}
                                className="mt-1"
                                {...field}
                              />
                            </FormControl>
                          </div>
                          <div className="flex-shrink-0 w-24 text-right">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {configKey}
                            </span>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              
              <DialogFooter className="pt-4 border-t bg-white">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setConfigModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateConfigsMutation.isPending}
                  className="bg-iot-blue hover:bg-blue-700"
                >
                  {updateConfigsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Apply Configuration
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProfileDevicesPage;