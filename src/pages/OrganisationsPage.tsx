import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
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
import { Plus, Building2, Mail, Calendar } from "lucide-react";
import axios from "axios";
import config from "@/config";

interface Organisation {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  token: string;
  created_at: string;
  updated_at: string;
}

interface OrganisationForm {
  name: string;
  description: string;
  email: string;
  password: string;
}

const OrganisationsPage = () => {
  const [newOrgDialog, setNewOrgDialog] = useState(false);
  const [formData, setFormData] = useState<OrganisationForm>({
    name: "",
    description: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch organisations
  const { data: organisations = [], isLoading, refetch } = useQuery({
    queryKey: ['organisations'],
    queryFn: async () => {
      const response = await axios.get(`${config.API_BASE_URL}/organisations`);
      return response.data || [];
    }
  });

  const handleFormChange = (field: keyof OrganisationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOrganisation = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in name, email, and password",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orgData = {
        name: formData.name,
        description: formData.description || null,
        email: formData.email,
        password: formData.password,
        is_active: true
      };

      const response = await axios.post(`${config.API_BASE_URL}/organisations`, orgData);

      toast({
        title: "Success",
        description: "Organisation created successfully",
        variant: "default"
      });

      setNewOrgDialog(false);
      setFormData({
        name: "",
        description: "",
        email: "",
        password: ""
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create organisation",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organisations</h1>
            <p className="text-muted-foreground">
              Manage organisations and their settings
            </p>
          </div>
          <Dialog open={newOrgDialog} onOpenChange={setNewOrgDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Organisation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Organisation</DialogTitle>
                <DialogDescription>
                  Create a new organisation. An admin account will be created for this organisation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organisation Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter organisation name"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter organisation description"
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter admin email address"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleFormChange("password", e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleAddOrganisation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Organisation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              Organisations ({organisations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading organisations...</div>
            ) : organisations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No organisations found. Create the first organisation to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Token</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organisations.map((org: Organisation) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          {org.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {org.description ? (
                          <span className="text-sm">{org.description}</span>
                        ) : (
                          <span className="text-muted-foreground italic">No description</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={org.is_active ? "default" : "secondary"}>
                          {org.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(org.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(org.updated_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {org.token.substring(0, 8)}...
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrganisationsPage;
