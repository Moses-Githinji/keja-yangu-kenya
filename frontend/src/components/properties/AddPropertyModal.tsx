import React, { useState } from "react";
import { X, Upload, MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: string;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [videos, setVideos] = useState<{ file: File; preview: string }[]>([]);

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
    features: [] as string[],
    amenities: [] as string[],
    // Infrastructure & Utilities
    waterSource: "City Council",
    backupPower: "None",
    fiberProviders: "",
    hasSolarWaterHeating: false,
    // Security
    securityFeatures: "",
    // Financial & Legal
    serviceCharge: "",
    depositMonths: "2",
    legalStatus: "Title Deed Ready",
    // Investment Info
    projectedYield: "",
    annualAppreciation: "",
    // Media
    floorPlanUrl: "",
    // Brief Stay Specifics
    checkInTime: "14:00",
    checkOutTime: "11:00",
    maxGuests: "",
    bedCount: "",
    wifiSpeed: "",
    cleaningFee: "",
    serviceFee: "",
    houseRules: "",
    selfCheckInMethod: "Lockbox",
    weekendRate: "",
    weeklyDiscount: "",
    hasWifi: true,
    hasDedicatedWorkspace: false,
    hasCoffeeMaker: false,
    isQuietArea: false,
    toiletriesProvided: true,
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

  const listingTypes = ["SALE", "RENT", "SHORT_TERM_RENT"];

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
    "Dedicated Workspace",
    "Coffee Maker",
    "Toiletries",
    "Smart TV",
    "Kitchenware",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file), // This will work for video previews too in most browsers
    }));
    setVideos((prev) => [...prev, ...newVideos]);
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchCoordinates = async () => {
    if (!formData.address && !formData.city) {
      toast({
        title: "Address required",
        description: "Please enter an address or city to fetch coordinates.",
        variant: "destructive",
      });
      return;
    }

    setGeocoding(true);
    try {
      const query = encodeURIComponent(`${formData.address} ${formData.city} ${formData.county} Kenya`);
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
        toast({
          title: "Coordinates found",
          description: `Located at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      } else {
        throw new Error("Could not find coordinates for this address.");
      }
    } catch (err: any) {
      toast({
        title: "Geocoding failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setGeocoding(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        setGettingLocation(false);
        toast({
          title: "Location detected",
          description: "Coordinates updated to your current position.",
        });
      },
      (err) => {
        setGettingLocation(false);
        toast({
          title: "Location failed",
          description: "Could not get your current location. Please check permissions.",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Media validation
    if (images.length < 15 || images.length > 25) {
      toast({
        title: "Image count error",
        description: `Please provide between 15 and 25 images. Current: ${images.length}`,
        variant: "destructive",
      });
      return;
    }

    if (videos.length === 0) {
      toast({
        title: "Video required",
        description: "Please upload at least one property video.",
        variant: "destructive",
      });
      return;
    }

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
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
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
        longitude: parseFloat(formData.longitude),
        features: formData.features,
        amenities: formData.amenities,
        // Infrastructure & Utilities
        waterSource: formData.waterSource,
        backupPower: formData.backupPower,
        fiberProviders: formData.fiberProviders.split(",").map(p => p.trim()).filter(Boolean),
        hasSolarWaterHeating: formData.hasSolarWaterHeating,
        // Security
        securityFeatures: formData.securityFeatures.split(",").map(s => s.trim()).filter(Boolean),
        // Financial & Legal
        serviceCharge: formData.serviceCharge ? parseFloat(formData.serviceCharge) : null,
        depositMonths: formData.depositMonths ? parseInt(formData.depositMonths) : null,
        legalStatus: formData.legalStatus,
        // Investment Info
        projectedYield: formData.projectedYield ? parseFloat(formData.projectedYield) : null,
        annualAppreciation: formData.annualAppreciation ? parseFloat(formData.annualAppreciation) : null,
        // Media
        floorPlanUrl: formData.floorPlanUrl,
        // Brief Stay Specifics
        ...(formData.listingType === "SHORT_TERM_RENT" && {
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          maxGuests: formData.maxGuests ? parseInt(formData.maxGuests) : null,
          bedCount: formData.bedCount ? parseInt(formData.bedCount) : null,
          wifiSpeed: formData.wifiSpeed ? parseInt(formData.wifiSpeed) : null,
          cleaningFee: formData.cleaningFee ? parseFloat(formData.cleaningFee) : null,
          serviceFee: formData.serviceFee ? parseFloat(formData.serviceFee) : null,
          houseRules: formData.houseRules.split(",").map(r => r.trim()).filter(Boolean),
          selfCheckInMethod: formData.selfCheckInMethod,
          weekendRate: formData.weekendRate ? parseFloat(formData.weekendRate) : null,
          weeklyDiscount: formData.weeklyDiscount ? parseFloat(formData.weeklyDiscount) : null,
          hasWifi: formData.hasWifi,
          hasDedicatedWorkspace: formData.hasDedicatedWorkspace,
          hasCoffeeMaker: formData.hasCoffeeMaker,
          isQuietArea: formData.isQuietArea,
          toiletriesProvided: formData.toiletriesProvided,
        }),
        slug: formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        status: "ACTIVE",
      };

      const createRes = await apiService.properties.create(propertyData);

      const propertyId =
        createRes.data?.data?.id ||
        createRes.data?.id ||
        createRes.data?.property?.id ||
        createRes.data?.propertyId;

      if (!propertyId) {
        throw new Error("Could not retrieve property ID from response");
      }

      // Upload images if any (non-blocking failure)
      if (images.length > 0) {
        try {
          setLoading(true);
          await apiService.properties.uploadImages(propertyId, images);
          toast({
            title: "Success",
            description: "Property and images added successfully!",
            variant: "default",
          });
        } catch (uploadErr: any) {
          console.error("Image upload failed:", uploadErr);
          toast({
            title: "Partial Success",
            description: `Property added, but there was an issue with image uploads: ${uploadErr.message}`,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }

      // Upload videos if any
      if (videos.length > 0) {
        try {
          setLoading(true);
          // For now, we only support one video upload as per the backend route .single("video")
          await apiService.upload.uploadVideo(videos[0].file, propertyId);
          toast({
            title: "Success",
            description: "Property, images, and video added successfully!",
          });
        } catch (videoErr: any) {
          console.error("Video upload failed:", videoErr);
          toast({
            title: "Video Upload Issue",
            description: `Property and images added, but video failed: ${videoErr.message}`,
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (images.length === 0) {
        toast({
          title: "Success",
          description: "Property added successfully!",
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error creating property:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
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
      waterSource: "City Council",
      backupPower: "None",
      fiberProviders: "",
      hasSolarWaterHeating: false,
      securityFeatures: "",
      serviceCharge: "",
      depositMonths: "2",
      legalStatus: "Title Deed Ready",
      projectedYield: "",
      annualAppreciation: "",
      floorPlanUrl: "",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      maxGuests: "",
      bedCount: "",
      wifiSpeed: "",
      cleaningFee: "",
      serviceFee: "",
      houseRules: "",
      selfCheckInMethod: "Lockbox",
      weekendRate: "",
      weeklyDiscount: "",
      hasWifi: true,
      hasDedicatedWorkspace: false,
      hasCoffeeMaker: false,
      isQuietArea: false,
      toiletriesProvided: true,
    });
    setImages([]);
    setVideos([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Fill in the details below to list your property on the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="e.g. Modern 3BR Apartment in Westlands"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) =>
                        handleInputChange("propertyType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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
                    placeholder="Describe your property in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="listingType">Listing Type *</Label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(v) => handleInputChange("listingType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sale or Rent" />
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
                      placeholder="e.g. 12500000"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        handleInputChange("bedrooms", e.target.value)
                      }
                      placeholder="e.g. 3"
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
                      placeholder="e.g. 2"
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
                      placeholder="e.g. 1450"
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
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="e.g. Nairobi"
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
                      placeholder="e.g. Nairobi"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address">Full Address</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary gap-1"
                      onClick={fetchCoordinates}
                      disabled={geocoding}
                    >
                      {geocoding ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Search className="h-3 w-3" />
                      )}
                      Fetch Coordinates
                    </Button>
                  </div>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Street name, building, estate..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      placeholder="e.g. -1.2921"
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
                      placeholder="e.g. 36.8219"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={useCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" />
                    )}
                    Use My Current Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure & Security */}
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="waterSource">Water Source</Label>
                    <Select
                      value={formData.waterSource}
                      onValueChange={(v) => handleInputChange("waterSource", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select water source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="City Council">City Council</SelectItem>
                        <SelectItem value="Borehole">Borehole</SelectItem>
                        <SelectItem value="Borehole & City Council">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupPower">Backup Power</Label>
                    <Select
                      value={formData.backupPower}
                      onValueChange={(v) => handleInputChange("backupPower", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select backup power" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Inverter">Inverter</SelectItem>
                        <SelectItem value="Solar">Solar</SelectItem>
                        <SelectItem value="Full Backup Generator">Full Generator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSolarWaterHeating"
                    checked={formData.hasSolarWaterHeating}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, hasSolarWaterHeating: !!checked }))
                    }
                  />
                  <Label htmlFor="hasSolarWaterHeating" className="cursor-pointer">
                    Has Solar Water Heating
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiberProviders">Fiber Internet Providers</Label>
                  <Input
                    id="fiberProviders"
                    value={formData.fiberProviders}
                    onChange={(e) => handleInputChange("fiberProviders", e.target.value)}
                    placeholder="e.g. Safaricom, Zuku, Liquid (comma separated)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityFeatures">Security Features</Label>
                  <Input
                    id="securityFeatures"
                    value={formData.securityFeatures}
                    onChange={(e) => handleInputChange("securityFeatures", e.target.value)}
                    placeholder="e.g. CCTV, 24/7 Guarded, Electric Fence (comma separated)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial & Legal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Financial & Legal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="serviceCharge">Monthly Service Charge (KES)</Label>
                    <Input
                      id="serviceCharge"
                      type="number"
                      value={formData.serviceCharge}
                      onChange={(e) => handleInputChange("serviceCharge", e.target.value)}
                      placeholder="e.g. 15000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositMonths">Deposit (Months)</Label>
                    <Input
                      id="depositMonths"
                      type="number"
                      value={formData.depositMonths}
                      onChange={(e) => handleInputChange("depositMonths", e.target.value)}
                      placeholder="e.g. 2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legalStatus">Legal Status</Label>
                  <Select
                    value={formData.legalStatus}
                    onValueChange={(v) => handleInputChange("legalStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Title Deed Ready">Title Deed Ready</SelectItem>
                      <SelectItem value="Leasehold">Leasehold (99 years)</SelectItem>
                      <SelectItem value="Sectional Title">Sectional Title</SelectItem>
                      <SelectItem value="Under Mutation">Under Mutation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Investment Insights (Conditional) */}
                {(formData.listingType === "SALE" || formData.listingType === "RENT") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="projectedYield">Projected Rental Yield (%)</Label>
                      <Input
                        id="projectedYield"
                        type="number"
                        step="0.1"
                        value={formData.projectedYield}
                        onChange={(e) => handleInputChange("projectedYield", e.target.value)}
                        placeholder="e.g. 8.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annualAppreciation">Annual Appreciation (%)</Label>
                      <Input
                        id="annualAppreciation"
                        type="number"
                        step="0.1"
                        value={formData.annualAppreciation}
                        onChange={(e) => handleInputChange("annualAppreciation", e.target.value)}
                        placeholder="e.g. 12.0"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stay Guidelines (Brief Stay Only) */}
            {formData.listingType === "SHORT_TERM_RENT" && (
              <Card>
                <CardHeader>
                  <CardTitle>Stay Guidelines & Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">Check-in Time</Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        value={formData.checkInTime}
                        onChange={(e) => handleInputChange("checkInTime", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">Check-out Time</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={formData.checkOutTime}
                        onChange={(e) => handleInputChange("checkOutTime", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Input
                        id="maxGuests"
                        type="number"
                        value={formData.maxGuests}
                        onChange={(e) => handleInputChange("maxGuests", e.target.value)}
                        placeholder="e.g. 6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bedCount">Number of Beds</Label>
                      <Input
                        id="bedCount"
                        type="number"
                        value={formData.bedCount}
                        onChange={(e) => handleInputChange("bedCount", e.target.value)}
                        placeholder="e.g. 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wifiSpeed">WiFi Speed (Mbps)</Label>
                      <Input
                        id="wifiSpeed"
                        type="number"
                        value={formData.wifiSpeed}
                        onChange={(e) => handleInputChange("wifiSpeed", e.target.value)}
                        placeholder="e.g. 50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                       <Label htmlFor="cleaningFee">Cleaning Fee (KES)</Label>
                       <Input
                         id="cleaningFee"
                         type="number"
                         value={formData.cleaningFee}
                         onChange={(e) => handleInputChange("cleaningFee", e.target.value)}
                         placeholder="e.g. 1500"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="serviceFee">Service/Admin Fee (KES)</Label>
                       <Input
                         id="serviceFee"
                         type="number"
                         value={formData.serviceFee}
                         onChange={(e) => handleInputChange("serviceFee", e.target.value)}
                         placeholder="e.g. 500"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="weekendRate">Weekend Night Rate (KES)</Label>
                      <Input
                        id="weekendRate"
                        type="number"
                        value={formData.weekendRate}
                        onChange={(e) => handleInputChange("weekendRate", e.target.value)}
                        placeholder="e.g. 8500 (Optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weeklyDiscount">Weekly Stay Discount (%)</Label>
                      <Input
                        id="weeklyDiscount"
                        type="number"
                        value={formData.weeklyDiscount}
                        onChange={(e) => handleInputChange("weeklyDiscount", e.target.value)}
                        placeholder="e.g. 10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selfCheckInMethod">Self Check-in Method</Label>
                    <Select
                      value={formData.selfCheckInMethod}
                      onValueChange={(v) => handleInputChange("selfCheckInMethod", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lockbox">Lockbox</SelectItem>
                        <SelectItem value="Smart Lock">Smart Lock</SelectItem>
                        <SelectItem value="Keypad">Keypad</SelectItem>
                        <SelectItem value="Reception/Staff">Reception/Staff</SelectItem>
                        <SelectItem value="Meet & Greet">Meet & Greet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label>Hospitality Specifics</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasWifi"
                          checked={formData.hasWifi}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasWifi: !!checked }))}
                        />
                        <Label htmlFor="hasWifi" className="text-sm cursor-pointer">High speed WiFi</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasDedicatedWorkspace"
                          checked={formData.hasDedicatedWorkspace}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasDedicatedWorkspace: !!checked }))}
                        />
                        <Label htmlFor="hasDedicatedWorkspace" className="text-sm cursor-pointer">Dedicated Workspace</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasCoffeeMaker"
                          checked={formData.hasCoffeeMaker}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasCoffeeMaker: !!checked }))}
                        />
                        <Label htmlFor="hasCoffeeMaker" className="text-sm cursor-pointer">Coffee Maker</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isQuietArea"
                          checked={formData.isQuietArea}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isQuietArea: !!checked }))}
                        />
                        <Label htmlFor="isQuietArea" className="text-sm cursor-pointer">Quiet Environment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="toiletriesProvided"
                          checked={formData.toiletriesProvided}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, toiletriesProvided: !!checked }))}
                        />
                        <Label htmlFor="toiletriesProvided" className="text-sm cursor-pointer">Toiletries Provided</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="houseRules">House Rules</Label>
                    <Textarea
                      id="houseRules"
                      value={formData.houseRules}
                      onChange={(e) => handleInputChange("houseRules", e.target.value)}
                      placeholder="Enter house rules (comma separated, e.g. No smoking, No parties, No pets)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Media Links */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Property Video Tour *</Label>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      videos.length > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {videos.length > 0 ? "UPLOADED" : "REQUIRED"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="sr-only"
                    />
                    <Label
                      htmlFor="video-upload"
                      className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3 bg-muted/5 group"
                    >
                      {videos.length === 0 ? (
                        <>
                          <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                            <Upload className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-primary">Click to upload property video</p>
                            <p className="text-xs text-muted-foreground">MP4, MOV, WEBM • Max 100MB</p>
                          </div>
                        </>
                      ) : (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black group-hover:ring-2 ring-primary/50 transition-all">
                          <video
                            src={videos[0].preview}
                            className="w-full h-full"
                            controls
                            onClick={(e) => e.stopPropagation()} // Prevent Label click when interacting with video controls
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeVideo(0);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floorPlanUrl">Floor Plan Image/PDF URL</Label>
                  <Input
                    id="floorPlanUrl"
                    value={formData.floorPlanUrl}
                    onChange={(e) => handleInputChange("floorPlanUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label className="text-base">Features</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
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
                          className="text-sm cursor-pointer"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base">Amenities</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
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
                          className="text-sm cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/50 rounded-xl p-8 text-center">
                      {images.length === 0 ? (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <Label htmlFor="image-upload" className="cursor-pointer">
                              <span className="text-sm font-medium text-primary hover:underline">
                                Click to upload images (15-25 required)
                              </span>
                            </Label>
                            <input
                              id="image-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                              PNG, JPG, WEBP • Max 10MB per image
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="mt-4">
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" size="sm" className="gap-2 pointer-events-none">
                              <Upload className="h-4 w-4" />
                              Add More Images
                            </Button>
                          </Label>
                          <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Image Count:</span>
                        <span className={cn(
                          "font-bold px-2 py-0.5 rounded",
                          images.length >= 15 && images.length <= 25 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        )}>
                          {images.length} / 25
                        </span>
                      </div>
                      <p className="text-muted-foreground italic">
                        {images.length < 15 ? `Add ${15 - images.length} more` : 
                         images.length > 25 ? `Remove ${images.length - 25} images` : 
                         "Count is valid"}
                      </p>
                    </div>

                {images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Add Property"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal;
