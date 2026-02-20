import { useState } from "react";
import {
  X,
  Heart,
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  Calendar,
  Phone,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-container";

interface PropertyModalProps {
  property: {
    id: string;
    title: string;
    location: string;
    address?: string;
    city?: string;
    county?: string;
    price: string;
    priceType: "sale" | "rent";
    images: string[];
    primaryImage?: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    areaUnit?: string;
    rating: number;
    isLuxury?: boolean;
    isFeatured?: boolean;
    isVerified?: boolean;
    isPaid?: boolean;
    description?: string;
    propertyType?: string;
    yearBuilt?: number;
    floorPlan?: {
      bedrooms: number;
      bathrooms: number;
      area: number;
      areaUnit: string;
    };
    features?: string[];
    amenities?: string[];
    agent?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      avatar?: string;
      company?: string;
    };
    listedDate?: string;
    updatedAt?: string;
    status?: string;
    videoTour?: string;
    virtualTour?: string;
    floorPlanImage?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const PropertyModal = ({ property, isOpen, onClose }: PropertyModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { showSuccess } = useToast();

  if (!isOpen || !property) return null;

  const images =
    property.images.length > 0
      ? property.images
      : [property.primaryImage || "/placeholder.jpg"];

  const mainImage = images[0];
  const gridImages = images.slice(1, 10); // 9 images for grid
  const remainingCount = Math.max(0, images.length - 10);

  const openCarousel = (index: number) => {
    setCurrentIndex(index);
    setShowCarousel(true);
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      showSuccess("Added to favorites", "Property saved to your wishlist");
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  property.priceType === "rent" ? "secondary" : "default"
                }
              >
                {property.priceType === "rent" ? "For Rent" : "For Sale"}
              </Badge>
              {property.isFeatured && (
                <Badge className="bg-secondary text-secondary-foreground">
                  Featured
                </Badge>
              )}
              {property.isLuxury && (
                <Badge className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
                  Luxury
                </Badge>
              )}
              {property.isVerified && (
                <Badge className="bg-green-600 text-white">Verified</Badge>
              )}
              {property.isPaid && (
                <Badge className="bg-blue-600 text-white">Premium</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLikeClick}>
                <Heart
                  className={`h-5 w-5 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Image Gallery */}
            <div className="space-y-6">
              <div className="flex h-[500px] gap-4">
                {/* Main Image */}
                <div
                  className="w-full rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => openCarousel(0)}
                >
                  <img
                    src={mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-4 gap-3">
                {gridImages.map((img, idx) => {
                  const actualIndex = idx + 1;
                  const isLast =
                    idx === 8 ||
                    (idx === gridImages.length - 1 && remainingCount > 0);

                  return (
                    <div
                      key={actualIndex}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => openCarousel(actualIndex)}
                    >
                      <img
                        src={img}
                        alt={`${property.title} - ${actualIndex + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isLast && remainingCount > 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            +{remainingCount}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Agent
                </Button>
                <Button variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <div className="flex flex-col gap-1 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{property.location}</span>
                  </div>
                  {property.address && (
                    <div className="text-sm text-muted-foreground pl-6">
                      {property.address}
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-primary mb-4">
                  KSh {property.price}
                  {property.priceType === "rent" && (
                    <span className="text-lg text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Bedrooms
                    </div>
                    <div className="text-lg font-semibold">
                      {property.bedrooms}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      Bathrooms
                    </div>
                    <div className="text-lg font-semibold">
                      {property.bathrooms}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Area</div>
                    <div className="text-lg font-semibold">
                      {property.area} {property.areaUnit || "m²"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Type and Status */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.propertyType && (
                  <div>
                    <div className="text-muted-foreground">Property Type</div>
                    <div className="font-medium">{property.propertyType}</div>
                  </div>
                )}
                {property.status && (
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-medium">{property.status}</div>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <div className="text-muted-foreground">Year Built</div>
                    <div className="font-medium">{property.yearBuilt}</div>
                  </div>
                )}
                {property.listedDate && (
                  <div>
                    <div className="text-muted-foreground">Listed</div>
                    <div className="font-medium">
                      {formatDate(property.listedDate)}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs for additional details */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="pt-4">
                  {property.description ? (
                    <p className="text-muted-foreground">
                      {property.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No description available
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    {property.features && property.features.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-sm"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {property.amenities && property.amenities.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amenities</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {property.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="pt-4">
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg">
                      {/* Map placeholder */}
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Map View
                      </div>
                    </div>
                    <div className="text-sm space-y-2">
                      {property.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{property.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>•</span>
                        <span>
                          {[property.city, property.county]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Key Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-semibold">
                    {property.bedrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-semibold">
                    {property.bathrooms}
                  </div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Square className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-semibold">
                    {property.area} {property.areaUnit || "m²"}
                  </div>
                  <div className="text-sm text-muted-foreground">Area</div>
                </div>
              </div>

              {/* Agent Section */}
              {property.agent && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-xl font-semibold mb-4">Listed by</h3>
                  <div className="flex items-center gap-4">
                    {property.agent.avatar ? (
                      <img
                        src={property.agent.avatar}
                        alt={property.agent.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                        {property.agent.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{property.agent.name}</h4>
                      {property.agent.company && (
                        <p className="text-sm text-muted-foreground">
                          {property.agent.company}
                        </p>
                      )}
                      {property.agent.phone && (
                        <a
                          href={`tel:${property.agent.phone}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          <Phone className="h-3 w-3" /> {property.agent.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Virtual Tour */}
              {property.virtualTour && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Virtual Tour</h3>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src={property.virtualTour}
                      className="w-full h-full"
                      allowFullScreen
                      title={`${property.title} - Virtual Tour`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Carousel */}
      {showCarousel && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header with counter */}
          <div className="flex items-center justify-between p-6 text-white">
            <div className="text-lg font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            <button
              type="button"
              onClick={() => setShowCarousel(false)}
              className="bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
              aria-label="Close carousel"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center relative p-4">
            <div className="relative w-full h-full max-w-4xl">
              <img
                src={images[currentIndex]}
                alt={`${property.title} - Image ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + images.length) % images.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % images.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Thumbnail Strip */}
          <div className="p-6 bg-black/80">
            <div className="flex gap-4 justify-center overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    index === currentIndex
                      ? "ring-4 ring-white"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyModal;
