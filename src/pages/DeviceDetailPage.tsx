import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, Download, RefreshCw, ExternalLink, Box, Activity, Settings, AlertTriangle } from "lucide-react";
import axios from "axios";
import config from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { DeviceDataGraphs } from "@/components/DeviceDataGraphs";
import { DeviceDataTable } from "@/components/DeviceDataTable";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define interfaces for the device data
interface DeviceMetadataEntry {
  entryID: number;
  created_at: string;
  [key: string]: any; // For field1, field2, etc.
}

interface DeviceConfigEntry {
  entryID: number;
  created_at: string;
  [key: string]: any; // For config1, config2, etc.
}

interface DeviceProfile {
  id: number;
  name: string;
  description: string;
  created_at: string;
  fields: Record<string, string>;
  configs: Record<string, string>;
  metadata?: Record<string, string>;
}

interface DeviceDetail {
  id: number;
  created_at: string;
  name: string;
  readkey: string;
  writekey: string;
  deviceID: string;
  profileID: number;
  currentFirmwareVersion: string | null;
  targetFirmwareVersion: string | null;
  previousFirmwareVersion: string | null;
  networkID: string;
  fileDownloadState: string | null;
  device_data: DeviceMetadataEntry[];
  config_data: DeviceConfigEntry[];
  meta_data: DeviceMetadataEntry[]; // Add the new meta_data field
  profile: DeviceProfile;
}

const DeviceDetailPage = () => {
  const { deviceID } = useParams<{ deviceID: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add state for config form
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [isSubmittingConfig, setIsSubmittingConfig] = useState(false);
  
  // Fetch device data
  const { 
    data: deviceData,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['device', deviceID],
    queryFn: async () => {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/device/${deviceID}`);
        return response.data as DeviceDetail;
      } catch (error) {
        throw new Error("Failed to fetch device data");
      }
    },
    enabled: !!deviceID,
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing device data",
      description: "Getting the latest information for this device.",
    });
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceID) return;
    
    setIsSubmittingConfig(true);
    
    try {
      const configData = {
        deviceID: parseInt(deviceID),
        configs: configValues
      };
      
      await axios.post(`${config.API_BASE_URL}/config/update`, configData);
      
      toast({
        title: "Configuration Updated",
        description: "Device configuration has been updated successfully.",
      });
      
      // Refresh data to show the new config
      refetch();
      
      // Reset form
      setConfigValues({});
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update device configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingConfig(false);
    }
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2 pl-0 -ml-3" 
          onClick={() => navigate('/devices')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to devices
        </Button>

        {/* Device Header with basic info */}
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-10 text-red-500">
            <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
            <p className="text-lg font-medium">Failed to load device details</p>
            <p className="mt-2">Please try refreshing or check if the device exists.</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        ) : deviceData ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{deviceData.name}</h1>
                <p className="text-gray-600 mt-1">Device ID: {deviceData.deviceID}</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                {/* <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button> */}
              </div>
            </div>

            {/* Device Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Network ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium">{deviceData.networkID}</div>
                </CardContent>
              </Card>
                    
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-lg font-medium">{deviceData.profile.name || "Not set"}</div>
                    {/* {deviceData.profile && (
                      <Button variant="ghost" size="sm" className="ml-2 h-8" 
                        onClick={() => navigate(`/profiles/${deviceData.profileID}/devices`)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )} */}
                  </div>
                </CardContent>
              </Card>
                  
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Firmware</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium">
                    {deviceData.currentFirmwareVersion || "Not set"}
                  </div>
                  {deviceData.targetFirmwareVersion && deviceData.targetFirmwareVersion !== deviceData.currentFirmwareVersion && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800">
                      Update pending to {deviceData.targetFirmwareVersion}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* API Keys Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Read Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-lg font-medium font-mono bg-gray-50 p-2 rounded w-full overflow-x-auto">
                      {deviceData.readkey}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2" 
                      onClick={() => {
                        navigator.clipboard.writeText(deviceData.readkey);
                        toast({
                          title: "Copied!",
                          description: "Read key copied to clipboard",
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
                    
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Write Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-lg font-medium font-mono bg-gray-50 p-2 rounded w-full overflow-x-auto">
                      {deviceData.writekey}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2" 
                      onClick={() => {
                        navigator.clipboard.writeText(deviceData.writekey);
                        toast({
                          title: "Copied!",
                          description: "Write key copied to clipboard",
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Tabs for Data and Configuration */}
            <Tabs defaultValue="fields" className="mt-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="fields" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" /> 
                  Sensor Data
                </TabsTrigger>
                <TabsTrigger value="metadata" className="flex items-center">
                  <Box className="mr-2 h-4 w-4" /> 
                  Metadata
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuration
                </TabsTrigger>
              </TabsList>
  
              <TabsContent value="fields" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Sensor Data</CardTitle>
                    <CardDescription>
                      Visualize sensor readings from the device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {deviceData.device_data.length > 0 ? (
                      <DeviceDataGraphs 
                        dataEntries={deviceData.device_data} 
                        fieldDefinitions={deviceData.profile?.fields || {}}
                      />
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <Activity className="h-10 w-10 mx-auto mb-2" />
                        <p>No sensor data available for this device.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
  
              <TabsContent value="metadata" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Device Metadata</CardTitle>
                    <CardDescription>
                      View device metadata like battery level, signal strength, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {deviceData.meta_data && deviceData.meta_data.length > 0 ? (
                      <DeviceDataTable 
                        dataEntries={deviceData.meta_data} 
                        fieldDefinitions={deviceData.profile?.metadata || {}}
                      />
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <Box className="h-10 w-10 mx-auto mb-2" />
                        <p>No metadata available for this device.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
  
              <TabsContent value="config" className="mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Device Configuration</CardTitle>
                        <CardDescription>
                          View configuration values for this device
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Update Config
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <form onSubmit={handleConfigSubmit}>
                            <DialogHeader>
                              <DialogTitle>Update Device Configuration</DialogTitle>
                              <DialogDescription>
                                Make changes to your device configuration here. Click save when you're done.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {deviceData.profile && deviceData.profile.configs && 
                                Object.entries(deviceData.profile.configs).map(([key, label]) => (
                                  <div key={key} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={key} className="text-right">
                                      {label}
                                    </Label>
                                    <Input
                                      id={key}
                                      className="col-span-3"
                                      value={configValues[key] || ''}
                                      onChange={(e) => setConfigValues({
                                        ...configValues,
                                        [key]: e.target.value
                                      })}
                                    />
                                  </div>
                                ))
                              }
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isSubmittingConfig}>
                                {isSubmittingConfig ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : "Save changes"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {deviceData.config_data.length > 0 ? (
                      <DeviceDataTable 
                        dataEntries={deviceData.config_data} 
                        fieldDefinitions={deviceData.profile?.configs || {}}
                      />
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <Settings className="h-10 w-10 mx-auto mb-2" />
                        <p>No configuration data available for this device.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </Layout>
  );
};

export default DeviceDetailPage;