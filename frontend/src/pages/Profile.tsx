import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, isLoading } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    bio: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        bio: user.bio || "",
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast({
          title: "Profile updated successfully",
          description: "Your profile has been updated.",
          variant: "default",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update failed",
          description:
            result.error || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: user?.gender || "",
      nationality: user?.nationality || "",
      bio: user?.bio || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      disabled={!isEditing}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardTitle className="text-xl">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>

                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone || "No phone number"}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {user.dateOfBirth
                          ? new Date(user.dateOfBirth).toLocaleDateString()
                          : "No date of birth"}
                      </span>
                    </div>
                    {user.gender && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{user.gender}</span>
                      </div>
                    )}
                    {user.nationality && (
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{user.nationality}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and preferences
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+254 700 123 456"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleSelectChange("gender", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your nationality"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
