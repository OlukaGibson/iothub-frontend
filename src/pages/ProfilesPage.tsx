import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
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
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  Settings, 
  Trash2, 
  Edit,
  Box,
  Minus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import api from "@/lib/api";
import config from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

// Define the profile interface based on the API response
interface Profile {
  id: string; // UUID in FastAPI
  name: string;
  description?: string | null;
  created_at: string | null;
  fields?: { [key: string]: string | null } | null;
  configs?: { [key: string]: string | null } | null;
  metadata?: { [key: string]: string | null } | null;
  organisation_id: string; // UUID
  device_count?: number;
  devices?: any[]; // For ProfileWithDevices
}

interface FieldEntry {
  value: string;
  type: 'string' | 'int' | 'float';
}

const ProfilesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newProfileDialog, setNewProfileDialog] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [profileName, setProfileName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [fields, setFields] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);
  const [configs, setConfigs] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);
  const [metadata, setMetadata] = useState<FieldEntry[]>([
    { value: "", type: 'string' },
    { value: "", type: 'string' }
  ]);
  
  const { toast } = useToast();
  
  const { data: profiles = [], isLoading: isLoadingProfiles, error: profilesError, refetch } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      // Use the correct endpoint from your API
      const response = await api.get('/profiles');
      return response.data as Profile[];
    },
    // Enable the query to fetch data
    enabled: true,
  });

  const addField = () => {
    if (fields.length < 15) {
      setFields([...fields, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum fields reached",
        description: "You can only add up to 15 data fields.",
        variant: "destructive",
      });
    }
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      const newFields = [...fields];
      newFields.splice(index, 1);
      setFields(newFields);
    }
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], value };
    setFields(newFields);
  };

  const updateFieldType = (index: number, type: 'string' | 'int' | 'float') => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], type };
    setFields(newFields);
  };

  // Similar updates for configs
  const addConfig = () => {
    if (configs.length < 10) {
      setConfigs([...configs, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum configurations reached",
        description: "You can only add up to 10 configuration parameters.",
        variant: "destructive",
      });
    }
  };

  const removeConfig = (index: number) => {
    if (configs.length > 1) {
      const newConfigs = [...configs];
      newConfigs.splice(index, 1);
      setConfigs(newConfigs);
    }
  };

  const updateConfig = (index: number, value: string) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], value };
    setConfigs(newConfigs);
  };

  const updateConfigType = (index: number, type: 'string' | 'int' | 'float') => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], type };
    setConfigs(newConfigs);
  };

  // Similar updates for metadata
  const addMetadata = () => {
    if (metadata.length < 15) {
      setMetadata([...metadata, { value: "", type: 'string' }]);
    } else {
      toast({
        title: "Maximum metadata fields reached",
        description: "You can only add up to 15 metadata fields.",
        variant: "destructive",
      });
    }
  };

  const removeMetadata = (index: number) => {
    if (metadata.length > 1) {
      const newMetadata = [...metadata];
      newMetadata.splice(index, 1);
      setMetadata(newMetadata);
    }
  };

  const updateMetadata = (index: number, value: string) => {
    const newMetadata = [...metadata];
    newMetadata[index] = { ...newMetadata[index], value };
    setMetadata(newMetadata);
  };

  const updateMetadataType = (index: number, type: 'string' | 'int' | 'float') => {
    const newMetadata = [...metadata];
    newMetadata[index] = { ...newMetadata[index], type };
    setMetadata(newMetadata);
  };

  const resetForm = () => {
    setProfileName("");
    setProfileDescription("");
    setFields([
      { value: "", type: 'string' },
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
    setConfigs([
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
    setMetadata([
      { value: "", type: 'string' },
      { value: "", type: 'string' }
    ]);
  };

  const handleCreateProfile = async () => {
    // Validate required fields
    if (!profileName.trim()) {
      toast({
        title: "Missing required field",
        description: "Profile name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProfile(true);
    
    try {
      // Build fields object
      const fieldsObj: { [key: string]: string | null } = {};
      fields.forEach((field, index) => {
        if (field.value.trim()) {
          fieldsObj[`field${index + 1}`] = field.value;
        }
      });
      
      // Build configs object
      const configsObj: { [key: string]: string | null } = {};
      configs.forEach((config, index) => {
        if (config.value.trim()) {
          configsObj[`config${index + 1}`] = config.value;
        }
      });
      
      // Build metadata object
      const metadataObj: { [key: string]: string | null } = {};
      metadata.forEach((meta, index) => {
        if (meta.value.trim()) {
          metadataObj[`metadata${index + 1}`] = meta.value;
        }
      });
      
      // Create JSON payload for FastAPI
      const profileData = {
        name: profileName,
        description: profileDescription || null,
        fields: Object.keys(fieldsObj).length > 0 ? fieldsObj : null,
        configs: Object.keys(configsObj).length > 0 ? configsObj : null,
        metadata: Object.keys(metadataObj).length > 0 ? metadataObj : null,
        organisation_id: "00000000-0000-0000-0000-000000000000" // TODO: Get from auth context
      };
      
      const response = await api.post('/profiles', profileData);
      
      toast({
        title: "Success",
        description: "Profile created successfully!",
        variant: "default",
      });
      setNewProfileDialog(false);
      resetForm();
      refetch(); // Refresh the profiles list
      
    } catch (err: any) {
      console.error("Profile creation error:", err);
      toast({
        title: "Creation failed",
        description: err.response?.data?.detail || "An error occurred while creating the profile",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.description && profile.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Profiles</h1>
          <p className="text-gray-600 mt-1">Create and manage profiles for your IoT devices</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={newProfileDialog} onOpenChange={setNewProfileDialog}>
            <DialogTrigger asChild>
              <Button className="bg-iot-blue hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Create Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Profile</DialogTitle>
                <DialogDescription>
                  Define a new profile template for your IoT devices
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profileName" className="text-right">
                    Name
                  </Label>
                  <Input 
                    id="profileName" 
                    placeholder="Profile name" 
                    className="col-span-3"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profileDescription" className="text-right">
                    Description
                  </Label>
                  <Input 
                    id="profileDescription" 
                    placeholder="Profile description" 
                    className="col-span-3"
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                  />
                </div>
                
                <div className="border-t my-3 pt-3">
                  <h3 className="font-medium mb-2">Data Fields</h3>
                  <p className="text-sm text-gray-500 mb-4">Define the data fields this profile will use (1-15 fields allowed)</p>
                  
                  {fields.map((field, index) => (
                    <div key={`field${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                      <Label htmlFor={`field${index}`} className="text-right">
                        Field {index + 1}
                      </Label>
                      <div className="col-span-3 flex gap-2">
                        <div className="flex-1 flex gap-2">
                          <Input 
                            id={`field${index}`} 
                            placeholder={`e.g. "Temperature"`} 
                            className="flex-1"
                            value={field.value}
                            onChange={(e) => updateField(index, e.target.value)}
                          />
                          <select 
                            className="border rounded px-3 py-2 text-sm"
                            value={field.type}
                            onChange={(e) => updateFieldType(index, e.target.value as 'string' | 'int' | 'float')}
                          >
                            <option value="string">Int</option>
                            <option value="int">String</option>
                            <option value="float">Float</option>
                          </select>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeField(index)}
                          disabled={fields.length <= 1}
                          className="h-10 w-10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addField}
                    disabled={fields.length >= 15}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Field
                  </Button>
                </div>
                
                <div className="border-t my-3 pt-3">
                  <h3 className="font-medium mb-2">Configuration Values</h3>
                  <p className="text-sm text-gray-500 mb-4">Define device configuration parameters (1-10 configs allowed)</p>
                  
                  {configs.map((config, index) => (
                    <div key={`config${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                      <Label htmlFor={`config${index}`} className="text-right">
                        Config {index + 1}
                      </Label>
                      <div className="col-span-3 flex gap-2">
                        <div className="flex-1 flex gap-2">
                          <Input 
                            id={`config${index}`} 
                            placeholder={`e.g. "Sample Rate"`} 
                            className="flex-1"
                            value={config.value}
                            onChange={(e) => updateConfig(index, e.target.value)}
                          />
                          <select 
                            className="border rounded px-3 py-2 text-sm"
                            value={config.type}
                            onChange={(e) => updateConfigType(index, e.target.value as 'string' | 'int' | 'float')}
                          >
                            <option value="string">Int</option>
                            <option value="int">String</option>
                            <option value="float">Float</option>
                          </select>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeConfig(index)}
                          disabled={configs.length <= 1}
                          className="h-10 w-10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addConfig}
                    disabled={configs.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Config
                  </Button>
                </div>

                <div className="border-t my-3 pt-3">
                  <h3 className="font-medium mb-2">Metadata Fields</h3>
                  <p className="text-sm text-gray-500 mb-4">Define additional metadata fields (1-15 fields allowed)</p>

                  {metadata.map((meta, index) => (
                    <div key={`metadata${index}`} className="grid grid-cols-4 items-center gap-4 mb-3">
                      <Label htmlFor={`metadata${index}`} className="text-right">
                        Metadata {index + 1}
                      </Label>
                      <div className="col-span-3 flex gap-2">
                        <div className="flex-1 flex gap-2">
                          <Input 
                            id={`metadata${index}`} 
                            placeholder={`e.g. "Location Type"`} 
                            className="flex-1"
                            value={meta.value}
                            onChange={(e) => updateMetadata(index, e.target.value)}
                          />
                          <select 
                            className="border rounded px-3 py-2 text-sm"
                            value={meta.type}
                            onChange={(e) => updateMetadataType(index, e.target.value as 'string' | 'int' | 'float')}
                          >
                            <option value="string">Int</option>
                            <option value="int">String</option>
                            <option value="float">Float</option>
                          </select>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeMetadata(index)}
                          disabled={metadata.length <= 1}
                          className="h-10 w-10"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={addMetadata}
                    disabled={metadata.length >= 15}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Metadata Field
                  </Button>
                </div>

              </div>
              <DialogFooter>
              <Button variant="outline" onClick={() => setNewProfileDialog(false)} disabled={isCreatingProfile}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile} disabled={isCreatingProfile}>
                  {isCreatingProfile ? (
                    <>
                      <span className="mr-2">Creating...</span>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </>
                  ) : (
                    'Create Profile'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search profiles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingProfiles ? (
          // Loading state
          <div className="col-span-full text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading profiles...</p>
          </div>
        ) : profilesError ? (
          // Error state
          <div className="col-span-full text-center py-10 text-red-500">
            <p>Error loading profiles. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No profiles found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or create a new profile.</p>
            <Button className="mt-6 bg-iot-blue hover:bg-blue-700" onClick={() => setNewProfileDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Profile
            </Button>
          </div>
        ) : (
          // Display profiles
          filteredProfiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{profile.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/profiles/${profile.id}/devices`)}>
                        <Box className="mr-2 h-4 w-4" /> View Devices
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" /> Configure
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{profile.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mt-2 mb-4">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {profile.device_count} {profile.device_count === 1 ? "Device" : "Devices"}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Data Fields</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(profile.fields).map((field, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Configurations</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(profile.configs).map((config, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {config}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Metadata</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(profile.metadata).map((meta, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {meta}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => navigate(`/profiles/${profile.id}/devices`)}
                >
                  View Details
                </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ProfilesPage;