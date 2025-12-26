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
  Car,
  Users,
  Home,
  Building2,
  Phone,
  Mail,
  Share2,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Award,
  Wifi,
  ParkingCircle,
  TreePine,
  UtensilsCrossed,
  School,
  Hospital,
  ShoppingBag,
  Bus,
  Train,
  Plane,
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
    price: string;
    priceType: "sale" | "rent";
    image: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    rating: number;
    isLuxury?: boolean;
    isFeatured?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

const PropertyModal = ({ property, isOpen, onClose }: PropertyModalProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { showSuccess } = useToast();

  // Don't render if no property data or modal is closed
  if (!isOpen || !property) return null;

  // Mock additional property images
  const propertyImages = [
    property.image,
    property.image, // In a real app, these would be different images
    property.image,
    property.image,
  ];

  // Enhanced property details with more specific information
  const propertyDetails = {
    description:
      "This stunning property offers the perfect blend of luxury and comfort. Located in one of the most sought-after neighborhoods, it features modern amenities, spacious rooms, and beautiful finishes throughout. The open-concept design creates an ideal space for both entertaining and daily living.",
    features: [
      "Modern kitchen with granite countertops",
      "Hardwood floors throughout",
      "Central air conditioning",
      "Security system",
      "Garden/balcony",
      "Parking space",
      "Storage room",
      "Built-in wardrobes",
    ],
    amenities: [
      "Swimming pool",
      "Gym",
      "24/7 security",
      "Children's playground",
      "BBQ area",
      "Visitor parking",
      "Garden maintenance",
      "Cleaning services",
    ],
    specifications: {
      yearBuilt: "2020",
      parking: "2 spaces",
      propertyType: property.isLuxury ? "Luxury Villa" : "Modern Apartment",
      condition: "Excellent",
      furnishing: "Semi-furnished",
      petPolicy: "Allowed",
      smoking: "Not allowed",
      maintenanceFee: property.priceType === "rent" ? "15,000" : "25,000",
      propertyTax: "18,000",
      insurance: "12,000",
      utilities: "8,000",
      internet: "3,500",
      water: "2,500",
      electricity: "4,500",
    },
    // Additional property details
    financials: {
      downPayment: property.priceType === "sale" ? "2,500,000" : "180,000",
      monthlyPayment: property.priceType === "sale" ? "125,000" : "180,000",
      interestRate: "12.5%",
      loanTerm: "25 years",
      closingCosts: "450,000",
      appraisalFee: "25,000",
      inspectionFee: "15,000",
    },
    neighborhood: {
      crimeRate: "Low",
      walkScore: "85",
      transitScore: "78",
      schoolRating: "9.2",
      averageAge: "32",
      familyFriendly: "Yes",
      nightlife: "Moderate",
      shopping: "Excellent",
    },
    nearbyPlaces: [
      {
        name: "Westlands Mall",
        distance: "0.5 km",
        icon: ShoppingBag,
        rating: 4.5,
      },
      {
        name: "Aga Khan Hospital",
        distance: "1.2 km",
        icon: Hospital,
        rating: 4.8,
      },
      {
        name: "Braeburn School",
        distance: "0.8 km",
        icon: School,
        rating: 4.7,
      },
      { name: "Central Park", distance: "0.3 km", icon: TreePine, rating: 4.6 },
      {
        name: "Westlands Station",
        distance: "1.5 km",
        icon: Train,
        rating: 4.4,
      },
      {
        name: "Jomo Kenyatta Airport",
        distance: "25 km",
        icon: Plane,
        rating: 4.3,
      },
    ],
    // Map coordinates (mock data)
    coordinates: {
      lat: -1.2921,
      lng: 36.8219,
      address: "Westlands, Nairobi, Kenya",
    },
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      showSuccess("Added to favorites", "Property saved to your wishlist");
    }
  };

  const handleImageClick = (index: number) => {
    setActiveImageIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-6 rounded-t-2xl">
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
                <Badge className="luxury-gradient text-luxury-foreground">
                  Luxury
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLikeClick}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
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

        {/* Content */}
        <div className="p-6">
          {/* Main Content - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Images and Basic Info */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden">
                <img
                  src={propertyImages[activeImageIndex]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {propertyImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
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
              {/* Title and Price */}
              <div>
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  KSh {property.price}
                  {property.priceType === "rent" && (
                    <span className="text-lg text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-4">
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
                  <div className="text-lg font-semibold">{property.area}</div>
                  <div className="text-sm text-muted-foreground">m²</div>
                </div>
              </div>

              {/* Rating and Neighborhood Scores */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{property.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    • Excellent rating
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-lg font-bold text-success">
                      {propertyDetails.neighborhood.walkScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Walk Score
                    </div>
                  </div>
                  <div className="text-center p-3 bg-secondary/10 rounded-lg">
                    <div className="text-lg font-bold text-secondary">
                      {propertyDetails.neighborhood.transitScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Transit Score
                    </div>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <div className="text-lg font-bold text-warning">
                      {propertyDetails.neighborhood.schoolRating}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      School Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Tab */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {propertyDetails.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Year Built:
                        </span>
                        <span className="font-medium">
                          {propertyDetails.specifications.yearBuilt}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Property Type:
                        </span>
                        <span className="font-medium">
                          {propertyDetails.specifications.propertyType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Condition:
                        </span>
                        <span className="font-medium">
                          {propertyDetails.specifications.condition}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Furnishing:
                        </span>
                        <span className="font-medium">
                          {propertyDetails.specifications.furnishing}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parking:</span>
                        <span className="font-medium">
                          {propertyDetails.specifications.parking}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pet Policy:
                        </span>
                        <span className="font-medium">
                          {propertyDetails.specifications.petPolicy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Smoking:</span>
                        <span className="font-medium">
                          {propertyDetails.specifications.smoking}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Maintenance Fee:
                        </span>
                        <span className="font-medium">
                          KSh {propertyDetails.specifications.maintenanceFee}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Additional Sections - Rows */}
          <div className="space-y-8">
            {/* Financial Summary Row */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Financial Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      KSh {propertyDetails.financials.downPayment}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Down Payment
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      KSh {propertyDetails.financials.monthlyPayment}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monthly Payment
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {propertyDetails.financials.interestRate}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Interest Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {propertyDetails.financials.loanTerm}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Loan Term
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map and Location Row */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Property Location & Map
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Map Container */}
                  <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative">
                    {/* Map placeholder - in a real app, this would be an actual map component */}
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm">Map Component</p>
                      <p className="text-xs">
                        Lat: {propertyDetails.coordinates.lat}
                      </p>
                      <p className="text-xs">
                        Lng: {propertyDetails.coordinates.lng}
                      </p>
                    </div>
                    {/* Location Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <p className="text-muted-foreground">
                        {propertyDetails.coordinates.address}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Coordinates</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Latitude: {propertyDetails.coordinates.lat}</div>
                        <div>Longitude: {propertyDetails.coordinates.lng}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Neighborhood Scores</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <div className="text-lg font-bold text-success">
                            {propertyDetails.neighborhood.walkScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Walk Score
                          </div>
                        </div>
                        <div className="text-center p-3 bg-secondary/10 rounded-lg">
                          <div className="text-lg font-bold text-secondary">
                            {propertyDetails.neighborhood.transitScore}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Transit Score
                          </div>
                        </div>
                        <div className="text-center p-3 bg-warning/10 rounded-lg">
                          <div className="text-lg font-bold text-warning">
                            {propertyDetails.neighborhood.schoolRating}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            School Rating
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Places Row */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Nearby Places & Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyDetails.nearbyPlaces.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <place.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{place.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {place.distance}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {place.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Neighborhood Insights Row */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Neighborhood Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">Crime Rate</div>
                    <Badge variant="outline" className="text-sm">
                      {propertyDetails.neighborhood.crimeRate}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">
                      Family Friendly
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {propertyDetails.neighborhood.familyFriendly}
                    </Badge>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">
                      Average Age
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {propertyDetails.neighborhood.averageAge}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">Shopping</div>
                    <Badge variant="outline" className="text-sm">
                      {propertyDetails.neighborhood.shopping}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Costs Row */}
            <Card className="border-0 bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Additional Costs & Utilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">
                      Property Tax
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      KSh {propertyDetails.specifications.propertyTax}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">Insurance</div>
                    <div className="text-2xl font-bold text-primary">
                      KSh {propertyDetails.specifications.insurance}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">Utilities</div>
                    <div className="text-2xl font-bold text-primary">
                      KSh {propertyDetails.specifications.utilities}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-lg font-semibold mb-1">Internet</div>
                    <div className="text-2xl font-bold text-primary">
                      KSh {propertyDetails.specifications.internet}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
