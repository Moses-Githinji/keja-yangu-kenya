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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AddProperty: React.FC = () => {
  return (
    <AdminLayout>
      <AddPropertyContent />
    </AdminLayout>
  );
};

const AddPropertyContent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    listingType: "",
    price: "",
    address: "",
    city: "",
    county: "",
    bedrooms: "",
    bathrooms: "",
    areaSize: "",
    features: [] as string[],
    amenities: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter((f) => f !== feature),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form data:", formData);
  };

  const propertyTypes = ["HOUSE", "APARTMENT", "VILLA", "TOWNHOUSE", "LAND"];
  const listingTypes = ["SALE", "RENT", "BOTH"];
  const features = [
    "Swimming Pool",
    "Garden",
    "Parking",
    "Security",
    "Gym",
    "Balcony",
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-2">Create a new property listing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Fill in the property information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter property title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("propertyType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="listingType">Listing Type</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("listingType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (KES)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    handleInputChange("bedrooms", e.target.value)
                  }
                  placeholder="Number of bedrooms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    handleInputChange("bathrooms", e.target.value)
                  }
                  placeholder="Number of bathrooms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaSize">Area Size (SQM)</Label>
                <Input
                  id="areaSize"
                  type="number"
                  value={formData.areaSize}
                  onChange={(e) =>
                    handleInputChange("areaSize", e.target.value)
                  }
                  placeholder="Area in square meters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => handleInputChange("county", e.target.value)}
                  placeholder="Enter county"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter full address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter property description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={(checked) =>
                        handleFeatureChange(feature, checked as boolean)
                      }
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link to="/admin">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Add Property</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProperty;
