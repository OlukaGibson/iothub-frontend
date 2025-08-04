import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRef, useState, useEffect } from "react";
import config from "@/config";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  HardDrive, 
  Upload, 
  Download, 
  Clock, 
  Tag, 
  FileText, 
  AlertTriangle,
  Check,
  X,
  Search,
  ChevronDown,
  Plus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  // Computed/additional fields
  devices_count?: number;
  file_sizes?: {
    bin?: number;
    bootloader?: number;
    hex?: number;
  };
}

const FirmwarePage = () => {
  const [uploadFirmwareDialog, setUploadFirmwareDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const [description, setDescription] = useState("");
  const [firmware, setFirmware] = useState<File | null>(null);
  const [firmware_bootloader, setFirmwareBootloader] = useState<File | null>(null);
  const [changelog, setChangelog] = useState<string[]>([""]);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFirmware, setSelectedFirmware] = useState<FirmwareVersion | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: firmwareVersions = [], isLoading: isLoadingFirmware, error: firmwareError, refetch } = useQuery({
    queryKey: ['firmwares'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/firmware`);
      return response.data as FirmwareVersion[];
    }
  });

  const addChange = () => {
    setChangelog([...changelog, ""]);
  };

  const updateChange = (index: number, value: string) => {
    const newChanges = [...changelog];
    newChanges[index] = value;
    setChangelog(newChanges);
  };

  const handleFirmwareUpload = async () => {
    if (!firmwareVersion || !description || !firmware) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
  
    setIsUploading(true);
    const formData = new FormData();
    formData.append("firmware_version", firmwareVersion);
    formData.append("firmware_type", "beta"); // Default type
    formData.append("description", description);
    formData.append("firmware_file", firmware);
    
    if (firmware_bootloader) {
      formData.append("firmware_bootloader", firmware_bootloader);
    }
    
    changelog.forEach((change, index) => {
      if (change.trim()) {
        formData.append(`change${index + 1}`, change);
      }
    });
  
    try {
      const response = await axios.post(`${config.API_BASE_URL}/firmware/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast({
        title: "Success",
        description: "Firmware uploaded successfully!",
        variant: "default",
      });
      setUploadFirmwareDialog(false);
      setFirmwareVersion("");
      setDescription("");
      setFirmware(null);
      setFirmwareBootloader(null);
      setChangelog([""]);
      
      refetch();
    } catch (err: any) {
      console.error("Firmware upload error:", err);
      toast({
        title: "Upload failed",
        description: err.response?.data?.detail || "An error occurred while uploading",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (firmware: FirmwareVersion, fileType) => {
    try {
      if (fileType === "bootloader" && firmware.firmware_string_bootloader) {
        window.open(`${config.API_BASE_URL}/firmware/${firmware.id}/download/firmware_bootloader`, '_blank');
      } else if ((fileType === "firmware" && firmware.firmware_string)  || (fileType === "firmware_hex" && !firmware.firmware_string_hex)) {
        window.open(`${config.API_BASE_URL}/firmware/${firmware.id}/download/firmware_file`, '_blank');
      }
      else if (fileType === "firmware_hex" && firmware.firmware_string_hex) {
        window.open(`${config.API_BASE_URL}/firmware/${firmware.id}/download/firmware_hex`, '_blank');
      }else {
        toast({
          title: "Download failed",
          description: "No firmware file available to download",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Firmware download error:", err);
      toast({
        title: "Download failed",
        description: err.response?.data?.detail || "An error occurred while downloading",
        variant: "destructive",
      });
    }
  };

  const filteredFirmwareVersions = firmwareVersions.filter(
    (firmware) =>
      firmware.firmware_version.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (firmware.description && firmware.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const extractChanges = (changesObj: Record<string, string>) => {
    return Object.values(changesObj);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case "stable":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stable</Badge>;
      case "beta":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Beta</Badge>;
      case "deprecated":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Deprecated</Badge>;
      case "legacy":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Legacy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const showFirmwareDetails = async (firmwareVersion: string) => {
    setIsLoadingDetails(true);
    setDetailsDialog(true);
    
    try {
      const response = await axios.get(`${config.API_BASE_URL}/firmware/${firmwareVersion}`);
      setSelectedFirmware(response.data);
    } catch (err: any) {
      console.error("Error fetching firmware details:", err);
      toast({
        title: "Error",
        description: "Failed to load firmware details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };
  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "N/A";
    
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    else return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const [isEditingType, setIsEditingType] = useState(false);
  const [editedFirmwareType, setEditedFirmwareType] = useState("");
  const [isUpdatingType, setIsUpdatingType] = useState(false);
  
  // Add this at the beginning of the component to ensure we initialize the state when a firmware is selected
  useEffect(() => {
    if (selectedFirmware) {
      setEditedFirmwareType(selectedFirmware.firmware_type || "");
    }
  }, [selectedFirmware]);
  
  // Add this function to handle the firmware type update
  const handleUpdateFirmwareType = async () => {
    if (!selectedFirmware) return;
    
    setIsUpdatingType(true);
    
    try {
      const formData = new FormData();
      formData.append("firmwareVersion", selectedFirmware.firmware_version);
      formData.append("firmware_type", editedFirmwareType);
      
      const response = await axios.post(
        `${config.API_BASE_URL}/firmware/updatefirmware_type`,
        formData
      );
      
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Firmware type updated successfully",
          variant: "default",
        });
        
        // Update local state
        setSelectedFirmware({
          ...selectedFirmware,
          firmware_type: editedFirmwareType as "stable" | "beta" | "deprecated" | "legacy"
        });
        
        // Refresh the firmware list
        refetch();
      }
    } catch (err) {
      console.error("Error updating firmware type:", err);
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Failed to update firmware type",
        variant: "destructive",
      });
    } finally {
      setIsEditingType(false);
      setIsUpdatingType(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Firmware Management</h1>
          <p className="text-gray-600 mt-1">Upload, manage, and deploy firmware to your IoT devices</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={uploadFirmwareDialog} onOpenChange={setUploadFirmwareDialog}>
            <DialogTrigger asChild>
              <Button className="bg-iot-blue hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" /> Upload Firmware
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload New Firmware</DialogTitle>
                <DialogDescription>
                  Upload a new firmware version for your IoT devices.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="hex" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hex">HEX File Upload</TabsTrigger>
                  <TabsTrigger value="bin">Binary File Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="hex" className="p-1 mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="firmwareVersion" className="text-right">
                        Version
                      </Label>
                      <Input
                        id="firmwareVersion"
                        placeholder="e.g. v2.1.5"
                        className="col-span-3"
                        value={firmwareVersion}
                        onChange={(e) => setFirmwareVersion(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the changes in this version"
                        className="col-span-3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Firmware HEX</Label>
                      <div className="col-span-3">
                        <Input
                          id="firmwareHex"
                          type="file"
                          accept=".hex"
                          onChange={(e) => setFirmware(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload the HEX file for the main firmware</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Bootloader (Optional)</Label>
                      <div className="col-span-3">
                        <Input
                          id="firmware_bootloader"
                          type="file"
                          accept=".hex"
                          onChange={(e) => setFirmwareBootloader(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload bootloader HEX file if required</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Changelog</h3>
                      {changelog.map((item, index) => (
                        <div key={`change${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                          <Label htmlFor={`change${index}`} className="text-right">
                            Change {index + 1}
                          </Label>
                          <Input
                            id={`change${index}`}
                            value={item}
                            onChange={(e) => updateChange(index, e.target.value)}
                            placeholder="e.g. Fixed WiFi connectivity issue"
                            className="col-span-3"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addChange}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Change
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="bin" className="p-1 mt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="firmwareVersionBin" className="text-right">
                        Version
                      </Label>
                      <Input 
                        id="firmwareVersionBin" 
                        placeholder="e.g. v2.1.5" 
                        className="col-span-3"
                        value={firmwareVersion}
                        onChange={(e) => setFirmwareVersion(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="descriptionBin" className="text-right">
                        Description
                      </Label>
                      <Textarea 
                        id="descriptionBin" 
                        placeholder="Describe the changes in this version" 
                        className="col-span-3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Firmware Binary</Label>
                      <div className="col-span-3">
                        <Input 
                          id="firmwareBin" 
                          type="file" 
                          accept=".bin"
                          onChange={(e) => setFirmware(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload the binary firmware file</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-medium mb-3">Changelog</h3>
                      {changelog.map((item, index) => (
                        <div key={`changeBin${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                          <Label htmlFor={`changeBin${index}`} className="text-right">
                            Change {index + 1}
                          </Label>
                          <Input
                            id={`changeBin${index}`}
                            value={item}
                            onChange={(e) => updateChange(index, e.target.value)}
                            placeholder="e.g. Fixed WiFi connectivity issue"
                            className="col-span-3"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={addChange}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Change
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setUploadFirmwareDialog(false)} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleFirmwareUpload} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <span className="mr-2">Uploading...</span>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload Firmware
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search firmware versions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <div className="flex space-x-2">
              <Button variant="outline" className="whitespace-nowrap">
                Latest Only
              </Button>
              <Button variant="outline" className="whitespace-nowrap">
                <ChevronDown className="h-4 w-4 mr-1" />
                Sort by Date
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Firmware Versions</CardTitle>
          <CardDescription>
            Manage firmware versions and deploy to devices
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingFirmware ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : firmwareError ? (
            <div className="text-center py-10 text-red-500">
              <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
              <p>Failed to load firmware data. Please try again later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Deployed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFirmwareVersions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96"> {/* Use colSpan equal to number of columns */}
                        <div className="flex flex-col items-center justify-center h-full">
                          <HardDrive className="h-12 w-12 text-gray-400" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900"> No Firmware</h3>
                          <p className="mt-1 text-gray-500">Try adjusting your search or create a new Firmware.</p>
                          <Button className="mt-6 bg-iot-blue hover:bg-blue-700" onClick={() => setUploadFirmwareDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Upload Firmware
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFirmwareVersions.map((firmware) => (
                      <TableRow key={firmware.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <HardDrive className="h-4 w-4 mr-2 text-gray-500" />
                            {firmware.firmware_version}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(firmware.firmware_type)}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={firmware.description}>
                          {firmware.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            N/A
                          </div>
                        </TableCell>
                        <TableCell>
                          {firmware.file_sizes ? 
                            formatFileSize(firmware.file_sizes.hex || firmware.file_sizes.bin) : 
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {firmware.devices_count !== undefined ? 
                              `${firmware.devices_count} device${firmware.devices_count !== 1 ? 's' : ''}` : 
                              '0 devices'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleDownload(firmware, firmware.firmware_string_hex ? "firmware_hex" : "firmware")}
                            title={firmware.firmware_string_hex ? "Download HEX file" : "Download BIN file"}
                          >
                            <Download className="h-4 w-4 mr-1" /> 
                            Download {firmware.firmware_string_hex ? "HEX" : "BIN"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => showFirmwareDetails(firmware.firmware_version)}
                          >
                            <FileText className="h-4 w-4 mr-1" /> Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-iot-blue" />
              Deployment Status
            </CardTitle>
            <CardDescription>Current firmware deployment across devices</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFirmware ? (
              <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : firmwareError ? (
              <div className="text-center py-4 text-red-500">
                <p>Failed to load deployment data</p>
              </div>
            ) : filteredFirmwareVersions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No firmware versions available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  // Calculate total device count
                  const totalDevices = filteredFirmwareVersions.reduce(
                    (sum, fw) => sum + (fw.devices_count || 0), 
                    0
                  );

                  // Only show versions that have devices using them
                  return filteredFirmwareVersions
                    .filter(fw => fw.devices_count && fw.devices_count > 0)
                    .sort((a, b) => (b.devices_count || 0) - (a.devices_count || 0))
                    .map(fw => {
                      const percentage = totalDevices > 0 
                        ? Math.round((fw.devices_count || 0) * 100 / totalDevices) 
                        : 0;

                      return (
                        <div key={fw.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{fw.firmware_version}</div>
                            <div className="text-sm text-gray-500">{percentage}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-iot-blue rounded-full h-2"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {fw.devices_count} {fw.devices_count === 1 ? "device" : "devices"}
                            {fw.description && (
                              <span className="ml-2 text-gray-400 truncate block">
                                {fw.description.length > 50 ? 
                                  `${fw.description.substring(0, 50)}...` : 
                                  fw.description}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    });
                })()}

                {filteredFirmwareVersions.filter(fw => fw.devices_count && fw.devices_count > 0).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No devices currently have firmware deployed</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-iot-orange" />
              Firmware Updates
            </CardTitle>
            <CardDescription>Devices that need firmware updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Temperature Sensor 3", currentVersion: "v1.5.2", targetVersion: "v2.1.4", status: "pending" },
                { name: "Humidity Sensor 2", currentVersion: "v2.0.1", targetVersion: "v2.1.4", status: "pending" },
                { name: "Motion Detector 1", currentVersion: "v2.0.1", targetVersion: "v2.1.4", status: "in_progress" },
                { name: "Pressure Sensor 1", currentVersion: "v1.5.2", targetVersion: "v2.1.4", status: "failed" },
              ].map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>{device.currentVersion}</span>
                      <span className="mx-2">→</span>
                      <span>{device.targetVersion}</span>
                    </div>
                  </div>
                  <div>
                    {device.status === "pending" && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Pending
                      </Badge>
                    )}
                    {device.status === "in_progress" && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        In Progress
                      </Badge>
                    )}
                    {device.status === "failed" && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2">
                View All Updates
              </Button>
            </div>
          </CardContent>
        </Card> */}
      </div>
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Firmware Details</DialogTitle>
            <DialogDescription>
              Detailed information about the firmware version
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : selectedFirmware ? (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 font-medium text-gray-500">Version</div>
                <div className="col-span-3 font-medium">
                  {selectedFirmware.firmware_version}
                </div>
                
                <div className="col-span-1 font-medium text-gray-500">Status</div>
                <div className="col-span-3">
                  {isEditingType ? (
                    <div className="flex items-center space-x-2">
                      <select 
                        className="border rounded-md px-2 py-1 text-sm"
                        value={editedFirmwareType}
                        onChange={(e) => setEditedFirmwareType(e.target.value)}
                        disabled={isUpdatingType}
                      >
                        <option value="">Select Status</option>
                        <option value="stable">Stable</option>
                        <option value="beta">Beta</option>
                        <option value="deprecated">Deprecated</option>
                        <option value="legacy">Legacy</option>
                      </select>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleUpdateFirmwareType}
                        disabled={isUpdatingType}
                      >
                        {isUpdatingType ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsEditingType(false);
                          setEditedFirmwareType(selectedFirmware?.firmware_type || "");
                        }}
                        disabled={isUpdatingType}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedFirmware.firmware_type)}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditingType(true)}
                        className="px-2 h-7"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="col-span-1 font-medium text-gray-500">Created</div>
                <div className="col-span-3">
                  N/A
                </div>
                
                <div className="col-span-1 font-medium text-gray-500">Updated</div>
                <div className="col-span-3">
                  N/A
                </div>
                
                <div className="col-span-1 font-medium text-gray-500">Description</div>
                <div className="col-span-3">
                  {selectedFirmware.description}
                </div>
                
                <div className="col-span-1 font-medium text-gray-500">File Type</div>
                <div className="col-span-3">
                  {selectedFirmware.firmware_string_hex ? 'HEX' : 'Binary'}
                  {selectedFirmware.firmware_string_bootloader && ' (with bootloader)'}
                </div>

                
              </div>
              
              {/* Get all changes from change1 to change10 */}
              {(() => {
                const changes = [
                  selectedFirmware.change1,
                  selectedFirmware.change2,
                  selectedFirmware.change3,
                  selectedFirmware.change4,
                  selectedFirmware.change5,
                  selectedFirmware.change6,
                  selectedFirmware.change7,
                  selectedFirmware.change8,
                  selectedFirmware.change9,
                  selectedFirmware.change10,
                ].filter(change => change && change.trim() !== "");
                
                return changes.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-2">Changelog</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <ul className="list-disc list-inside space-y-1">
                        {changes.map((change, i) => (
                          <li key={i} className="text-sm">{change}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
              
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedFirmware, "firmware_hex")}
                  className="px-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Hex File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedFirmware, "firmware")}
                  className="px-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Bin File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedFirmware, "bootloader")}
                  className="px-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Bootloader File
                </Button>
                <Button
                  variant="default"
                  onClick={() => setDetailsDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p>Failed to load firmware details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FirmwarePage;
