import React, { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

const Settings: React.FC = () => {
  return (
    <AdminLayout>
      <SettingsContent />
    </AdminLayout>
  );
};

const SettingsContent: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: "Keja Yangu Kenya",
    siteDescription: "Find your dream home in Kenya",
    contactEmail: "admin@kejayangu.co.ke",
    contactPhone: "+254 700 000 000",
    currency: "KES",
    defaultLanguage: "en",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: "10",
    allowedFileTypes: "jpg,jpeg,png,pdf",
    commissionRate: "5",
    featuredListingPrice: "1000",
    premiumListingPrice: "2500",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle saving settings
    console.log("Saving settings:", settings);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure system settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) =>
                    handleInputChange("siteName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  handleInputChange("siteDescription", e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-600">
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleInputChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-gray-600">
                  Send SMS notifications for urgent matters
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  handleInputChange("smsNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-gray-600">
                  Put the site in maintenance mode
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  handleInputChange("maintenanceMode", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload Settings</CardTitle>
            <CardDescription>
              Configure file upload restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    handleInputChange("maxFileSize", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) =>
                    handleInputChange("allowedFileTypes", e.target.value)
                  }
                  placeholder="jpg,jpeg,png,pdf"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Settings</CardTitle>
            <CardDescription>
              Configure pricing and commission rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) =>
                    handleInputChange("commissionRate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredListingPrice">
                  Featured Listing (KES)
                </Label>
                <Input
                  id="featuredListingPrice"
                  type="number"
                  value={settings.featuredListingPrice}
                  onChange={(e) =>
                    handleInputChange("featuredListingPrice", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="premiumListingPrice">
                  Premium Listing (KES)
                </Label>
                <Input
                  id="premiumListingPrice"
                  type="number"
                  value={settings.premiumListingPrice}
                  onChange={(e) =>
                    handleInputChange("premiumListingPrice", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
