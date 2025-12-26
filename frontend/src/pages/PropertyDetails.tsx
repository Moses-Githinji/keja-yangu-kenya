import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyMap from "@/components/map/PropertyMap";
import ChatInterface from "@/components/chat/ChatInterface";
import property1 from "@/assets/property-1.jpg";

const PropertyDetails = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const property = {
    id: "1",
    title: "Luxury Villa with Ocean Views",
    location: "Nyali, Mombasa",
    price: "25,000,000",
    priceType: "sale" as const,
    propertyType: "villa",
    images: [property1, property1, property1],
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    yearBuilt: 2022,
    longitude: 39.6682,
    latitude: -4.0435,
    description:
      "This stunning luxury villa offers breathtaking ocean views and modern amenities. Located in the prestigious Nyali area, this property features spacious rooms, a private pool, and beautifully landscaped gardens.",
    features: [
      "Private swimming pool",
      "Ocean view from all bedrooms",
      "Modern kitchen with granite countertops",
      "Master suite with walk-in closet",
      "Three-car garage",
      "Security system",
      "Landscaped gardens",
      "Backup generator",
    ],
    agent: {
      name: "Sarah Wanjiku",
      phone: "+254 700 123 456",
      email: "sarah@kejayangu.com",
      image: property1,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-secondary text-secondary-foreground">
                  Featured
                </Badge>
                <Badge className="luxury-gradient text-luxury-foreground">
                  Luxury
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`bg-white/80 backdrop-blur-sm hover:bg-white ${
                    isLiked ? "text-red-500" : "text-gray-600"
                  }`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-600"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Property Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    KSh {property.price}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Bed className="h-4 w-4" />
                    <span className="font-semibold">{property.bedrooms}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Bath className="h-4 w-4" />
                    <span className="font-semibold">{property.bathrooms}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Square className="h-4 w-4" />
                    <span className="font-semibold">{property.area}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">m²</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-semibold">{property.yearBuilt}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Built</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {property.description}
                </p>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="h-64">
                  <PropertyMap
                    className="rounded-lg"
                    center={[property.longitude, property.latitude]}
                    zoom={15}
                    properties={[
                      {
                        id: property.id,
                        longitude: property.longitude,
                        latitude: property.latitude,
                        title: property.title,
                        price: `KSh ${property.price}`,
                        propertyType: property.propertyType,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        area: property.area,
                        images: property.images,
                        amenities: property.features,
                        rating: 4.8, // Sample rating
                      },
                    ]}
                    selectedPropertyId={property.id}
                    onQuickView={(propertyId) => {
                      // For PropertyDetails page, we can navigate to the property or show additional info
                      console.log("Quick view for property:", propertyId);
                    }}
                    showMapToggle={true}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">SW</span>
                  </div>
                  <div>
                    <div className="font-medium">{property.agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Licensed Agent
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mortgage Calculator */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Mortgage Calculator
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Monthly Payment
                    </label>
                    <div className="text-2xl font-bold text-primary">
                      KSh 150,000
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Calculate Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyTitle={property.title}
        agentName={property.agent.name}
      />
    </div>
  );
};

export default PropertyDetails;
