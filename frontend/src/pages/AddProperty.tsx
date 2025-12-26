import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  X,
  MapPin,
  DollarSign,
  Home,
  Car,
  Wifi,
  Shield,
  Zap,
} from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const AddProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "",
    listingType: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    city: "",
    county: "",
    address: "",
    latitude: "",
    longitude: "",
    features: [],
    amenities: [],
  });

  const propertyTypes = [
    "APARTMENT",
    "HOUSE",
    "CONDO",
    "TOWNHOUSE",
    "VILLA",
    "LAND",
    "COMMERCIAL",
  ];

  const listingTypes = ["SALE", "RENT"];

  const availableFeatures = [
    "Parking",
    "Garden",
    "Balcony",
    "Terrace",
    "Swimming Pool",
    "Gym",
    "Security",
    "Elevator",
  ];

  const availableAmenities = [
    "WiFi",
    "Air Conditioning",
    "Heating",
    "Dishwasher",
    "Washing Machine",
    "Dryer",
    "Microwave",
    "Oven",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files) as File[];
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.propertyType ||
      !formData.listingType ||
      !formData.city ||
      !formData.county ||
      !formData.latitude ||
      !formData.longitude
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for submission
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        areaSize: formData.area ? parseFloat(formData.area) : null,
        city: formData.city,
        county: formData.county,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        features: formData.features,
        amenities: formData.amenities,
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        status: "ACTIVE",
      };

      // Upload images first if any
      let uploadedImages = [];
      console.log(`Starting upload of ${images.length} images`);
      if (images.length > 0) {
        try {
          // Extract files from images array
          const files = images.map((image) => image.file);
          console.log(
            `Uploading ${files.length} images:`,
            files.map((file, index) => ({
              index: index + 1,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            }))
          );

          console.log("Sending files to /images endpoint");
          const uploadResponse = await apiService.upload.uploadImages(files);
          console.log("Multiple upload response:", uploadResponse);

          // Process the array of uploaded images
          if (uploadResponse.data && Array.isArray(uploadResponse.data.data)) {
            uploadedImages = uploadResponse.data.data.map(
              (uploadedFile, index) => ({
                url: uploadedFile.url,
                caption: "",
                isPrimary: index === 0,
                order: index,
              })
            );
            console.log("Processed uploadedImages array:", uploadedImages);
          } else {
            console.error("Unexpected response format:", uploadResponse.data);
          }
        } catch (error) {
          console.error("Error uploading images:", error);
          console.error("Error response:", error.response?.data);
          // If multiple upload fails, don't proceed
          return;
        }
      }
      console.log(
        `Upload complete. Successfully uploaded ${uploadedImages.length}/${images.length} images`
      );

      // Only create property if we have at least one successfully uploaded image
      if (uploadedImages.length === 0 && images.length > 0) {
        toast({
          title: "Upload Error",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Create property with image objects (only if we have images)
      const finalPropertyData = {
        ...propertyData,
        ...(uploadedImages.length > 0 && {
          images: { create: uploadedImages },
        }),
      };

      console.log("Property data being sent:", finalPropertyData);
      const response = await apiService.properties.create(finalPropertyData);

      toast({
        title: "Success",
        description: "Property added successfully!",
      });

      // Navigate to agent dashboard
      navigate("/agent/dashboard");
    } catch (error) {
      console.error("Error creating property:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Add New Property</h1>
            <p className="text-muted-foreground">
              Fill in the details below to list your property
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g., Modern 3BR Apartment in Westlands"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
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
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your property..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="listingType">Listing Type *</Label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(value) =>
                        handleInputChange("listingType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="For sale or rent" />
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
                  <div>
                    <Label htmlFor="price">Price (KES) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="e.g., 5000000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        handleInputChange("bedrooms", e.target.value)
                      }
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        handleInputChange("bathrooms", e.target.value)
                      }
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      id="area"
                      type="number"
                      value={formData.area}
                      onChange={(e) =>
                        handleInputChange("area", e.target.value)
                      }
                      placeholder="e.g., 1200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="e.g., Nairobi"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      value={formData.county}
                      onChange={(e) =>
                        handleInputChange("county", e.target.value)
                      }
                      placeholder="e.g., Nairobi"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Street address, building, etc."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      placeholder="e.g., -1.2864"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) =>
                        handleInputChange("longitude", e.target.value)
                      }
                      placeholder="e.g., 36.8172"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {availableFeatures.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={() => handleFeatureToggle(feature)}
                        />
                        <Label
                          htmlFor={`feature-${feature}`}
                          className="text-sm"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {availableAmenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={formData.amenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                        />
                        <Label
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary hover:text-primary/80">
                          Upload images
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.preview}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/agent/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding Property..." : "Add Property"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProperty;
