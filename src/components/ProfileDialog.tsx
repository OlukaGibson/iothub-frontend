import { useState } from "react";
import { Copy, Check, User, Building2, Calendar, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface Organisation {
  name: string;
  description: string;
  is_active: boolean;
  id: string;
  token: string;
  created_at: string;
  updated_at: string | null;
}

interface UserProfile {
  username: string;
  email: string;
  is_active: boolean;
  id: string;
  token: string;
  created_at: string;
  updated_at: string | null;
  organisations: Organisation[];
}

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  isLoading?: boolean;
}

const ProfileDialog = ({ isOpen, onClose, userProfile, isLoading }: ProfileDialogProps) => {
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const copyToClipboard = async (text: string, tokenId: string, tokenType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTokens(prev => new Set(prev).add(tokenId));
      
      toast({
        title: "Copied!",
        description: `${tokenType} token copied to clipboard`,
        variant: "default",
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedTokens(prev => {
          const newSet = new Set(prev);
          newSet.delete(tokenId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy token to clipboard",
        variant: "destructive",
      });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View your profile information and copy your tokens
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">Loading profile...</div>
          </div>
        ) : userProfile ? (
          <div className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="font-medium">{userProfile.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{userProfile.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>
                      <Badge variant={userProfile.is_active ? "default" : "secondary"}>
                        {userProfile.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="font-mono text-xs">{userProfile.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(userProfile.created_at)}
                    </div>
                  </div>
                  {userProfile.updated_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(userProfile.updated_at)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Token */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  User Token
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <code className="font-mono text-sm flex-1 mr-2">{userProfile.token}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(userProfile.token, `user-${userProfile.id}`, "User")}
                    className="flex items-center"
                  >
                    {copiedTokens.has(`user-${userProfile.id}`) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Organisations */}
            {userProfile.organisations && userProfile.organisations.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Organisations ({userProfile.organisations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.organisations.map((org, index) => (
                    <div key={org.id}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{org.name}</h4>
                              <Badge variant={org.is_active ? "default" : "secondary"} className="text-xs">
                                {org.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {org.description && (
                              <p className="text-sm text-muted-foreground mt-1">{org.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Created: {formatDate(org.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Organisation Token</label>
                          <div className="flex items-center justify-between bg-muted p-3 rounded-lg mt-1">
                            <code className="font-mono text-sm flex-1 mr-2">{org.token}</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(org.token, `org-${org.id}`, "Organisation")}
                              className="flex items-center"
                            >
                              {copiedTokens.has(`org-${org.id}`) ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < userProfile.organisations.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load profile information
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;