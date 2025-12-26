import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Key,
  Trash2,
  User,
  Lock,
  Mail,
  Smartphone,
  Globe,
  Palette,
  Save,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    propertyAlerts: true,
    messageNotifications: true,
  });

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }
  }, [isAuthenticated, navigate]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement password change API call
      toast({
        title: "Password updated successfully",
        description: "Your password has been changed.",
        variant: "default",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Password update failed",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesChange = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement preferences update API call
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement account deletion API call
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        variant: "default",
      });
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Account & Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings, security, and preferences
            </p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="account"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center space-x-2 text-red-600"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Account Information</span>
                  </CardTitle>
                  <CardDescription>
                    Your basic account details and verification status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={user.email} disabled />
                        <Badge
                          variant={user.isVerified ? "default" : "secondary"}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="flex items-center space-x-2">
                        <Input value={user.phone || "Not provided"} disabled />
                        <Badge variant="outline">Primary</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Input value={user.role} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <Input
                        value={
                          user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"
                        }
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>Change Password</span>
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      isLoading ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            emailNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={preferences.smsNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            smsNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            pushNotifications: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Property Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new properties matching your
                          criteria
                        </p>
                      </div>
                      <Switch
                        checked={preferences.propertyAlerts}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            propertyAlerts: checked,
                          }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Message Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new messages from agents
                        </p>
                      </div>
                      <Switch
                        checked={preferences.messageNotifications}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            messageNotifications: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handlePreferencesChange}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" className="space-y-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Danger Zone</span>
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all your data from
                            our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              "Yes, delete my account"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
