import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Image as ImageIcon,
  X,
  Upload,
  Star,
  Home,
  MapPin,
  Layers,
  Ruler,
  Car,
  Plus,
} from "lucide-react";

// Constants
const PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "COMMERCIAL",
  "LAND",
  "INDUSTRIAL",
  "FARM",
  "HOTEL",
  "OFFICE",
  "WAREHOUSE",
  "OTHER",
];

const LISTING_TYPES = ["RENT", "SALE", "SHORT_TERM_RENT"];
const PRICE_TYPES = ["FIXED", "NEGOTIABLE", "PER_MONTH", "PER_YEAR"];
const AREA_UNITS = ["SQM", "SQFT", "ACRES", "HECTARES"];
const CURRENCIES = ["KES", "USD", "EUR", "GBP"];

// Types
interface PropertyImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  order: number;
}

interface PropertyFormData {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  status: string;
  address: string;
  city: string;
  county: string;
  neighborhood: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  price: number;
  currency: string;
  priceType: string;
  rentPeriod: string | null;
  deposit: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSize: number;
  areaUnit: string;
  yearBuilt: number | null;
  floors: number | null;
  parkingSpaces: number | null;
  features: string[];
  amenities: string[];
  nearbyAmenities: string[];
  isFeatured: boolean;
  isPremium: boolean;
}

const EditProperty: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    propertyType: "APARTMENT",
    listingType: "RENT",
    status: "ACTIVE",
    address: "",
    city: "",
    county: "",
    neighborhood: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
    price: 0,
    currency: "KES",
    priceType: "FIXED",
    rentPeriod: null,
    deposit: null,
    bedrooms: null,
    bathrooms: null,
    areaSize: 0,
    areaUnit: "SQM",
    yearBuilt: null,
    floors: null,
    parkingSpaces: null,
    features: [],
    amenities: [],
    nearbyAmenities: [],
    isFeatured: false,
    isPremium: false,
  });

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);

  const [featureInput, setFeatureInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");
  const [nearbyInput, setNearbyInput] = useState("");

  // Fetch property
  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const { data } = await apiService.properties.getById(propertyId);

      const primaryImg = data.images?.find(
        (img: PropertyImage) => img.isPrimary
      );

      setFormData({
        title: data.title || "",
        description: data.description || "",
        propertyType: data.propertyType || "APARTMENT",
        listingType: data.listingType || "RENT",
        status: data.status || "ACTIVE",
        address: data.address || "",
        city: data.city || "",
        county: data.county || "",
        neighborhood: data.neighborhood || "",
        postalCode: data.postalCode || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        price: data.price || 0,
        currency: data.currency || "KES",
        priceType: data.priceType || "FIXED",
        rentPeriod: data.rentPeriod || null,
        deposit: data.deposit || null,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        areaSize: data.areaSize || 0,
        areaUnit: data.areaUnit || "SQM",
        yearBuilt: data.yearBuilt ?? null,
        floors: data.floors ?? null,
        parkingSpaces: data.parkingSpaces ?? null,
        features: Array.isArray(data.features) ? data.features : [],
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        nearbyAmenities: Array.isArray(data.nearbyAmenities)
          ? data.nearbyAmenities
          : [],
        isFeatured: !!data.isFeatured,
        isPremium: !!data.isPremium,
      });

      setImages(data.images || []);
      setPrimaryImageId(primaryImg?.id ?? null);
    } catch (error) {
      console.error("Failed to load property:", error);
      toast({
        title: "Error",
        description: "Could not load property details",
        variant: "destructive",
      });
      navigate("/agent/properties");
    } finally {
      setLoading(false);
    }
  }, [propertyId, navigate, toast]);

  useEffect(() => {
    if (propertyId) fetchProperty();
  }, [propertyId, fetchProperty]);

  // Generic change handlers
  const updateField = <K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateField(name as keyof PropertyFormData, value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateField(
      name as keyof PropertyFormData,
      value === "" ? null : Number(value)
    );
  };

  const handleSelectChange = (field: keyof PropertyFormData, value: string) => {
    updateField(field, value);
  };

  const addToArray = (
    field: "features" | "amenities" | "nearbyAmenities",
    value: string,
    clearInput: () => void
  ) => {
    if (!value.trim()) return;
    updateField(field, [...formData[field], value.trim()]);
    clearInput();
  };

  const removeFromArray = (
    field: "features" | "amenities" | "nearbyAmenities",
    index: number
  ) => {
    updateField(
      field,
      formData[field].filter((_, i) => i !== index)
    );
  };

  // Image handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !propertyId) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach((file) =>
      formData.append("images", file)
    );

    try {
      const { data: uploadedImages } = await apiService.properties.uploadImages(
        propertyId,
        formData
      );
      setImages((prev) => [...prev, ...uploadedImages]);

      if (!primaryImageId && uploadedImages.length > 0) {
        setPrimaryImageId(uploadedImages[0].id);
      }

      toast({
        title: "Success",
        description: `${e.target.files.length} image(s) uploaded`,
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: "Could not upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!propertyId || !confirm("Delete this image?")) return;

    try {
      await apiService.deleteImage(propertyId, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      if (primaryImageId === imageId) {
        const remaining = images.filter((img) => img.id !== imageId);
        setPrimaryImageId(remaining[0]?.id ?? null);
      }

      toast({ title: "Success", description: "Image removed" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!propertyId || primaryImageId === imageId) return;

    try {
      await apiService.setPrimaryImage(propertyId, imageId);
      setPrimaryImageId(imageId);
      toast({ title: "Success", description: "Primary image updated" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to set primary image",
        variant: "destructive",
      });
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        areaSize: Number(formData.areaSize) || 0,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        deposit: formData.deposit ? Number(formData.deposit) : null,
        bedrooms: formData.bedrooms ?? null,
        bathrooms: formData.bathrooms ?? null,
        yearBuilt: formData.yearBuilt ?? null,
        floors: formData.floors ?? null,
        parkingSpaces: formData.parkingSpaces ?? null,
      };

      await apiService.properties.update(propertyId, payload);

      if (primaryImageId) {
        await apiService.setPrimaryImage(propertyId, primaryImageId);
      }

      toast({ title: "Success", description: "Property updated successfully" });
      navigate("/agent/properties");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Home className="h-7 w-7" />
          Edit Property
        </h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/agent/properties")}
            disabled={saving || uploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-property-form"
            disabled={saving || uploading}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <form id="edit-property-form" onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted p-1">
            {["basic", "location", "details", "images"].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="py-3">
                <div className="flex flex-col items-center gap-1">
                  {tab === "basic" && <Home className="h-4 w-4" />}
                  {tab === "location" && <MapPin className="h-4 w-4" />}
                  {tab === "details" && <Layers className="h-4 w-4" />}
                  {tab === "images" && <ImageIcon className="h-4 w-4" />}
                  <span className="text-xs font-medium capitalize">{tab}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleTextChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) =>
                        handleSelectChange("propertyType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="listingType">Listing Type *</Label>
                    <Select
                      value={formData.listingType}
                      onValueChange={(v) => handleSelectChange("listingType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LISTING_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleTextChange}
                    rows={5}
                    required
                  />
                </div>

                {/* Price section */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Currency & Price *</Label>
                    <div className="flex">
                      <Select
                        value={formData.currency}
                        onValueChange={(v) => handleSelectChange("currency", v)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        name="price"
                        type="number"
                        value={formData.price || ""}
                        onChange={handleNumberChange}
                        className="ml-2"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price Type</Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(v) => handleSelectChange("priceType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace("_", " ").toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.listingType === "RENT" ||
                    formData.listingType === "SHORT_TERM_RENT") && (
                    <div className="space-y-2">
                      <Label>Rent Period</Label>
                      <Input
                        name="rentPeriod"
                        value={formData.rentPeriod || ""}
                        onChange={handleTextChange}
                        placeholder="e.g. monthly"
                      />
                    </div>
                  )}
                </div>
                {/* ... rest of basic info fields (bedrooms, bathrooms, etc.) */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location, Details, Images tabs follow similar clean pattern */}
        </Tabs>
      </form>
    </div>
  );
};

export default EditProperty;
