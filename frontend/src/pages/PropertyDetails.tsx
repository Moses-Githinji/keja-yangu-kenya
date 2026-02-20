import { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeft,
  X,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import { PropertyCard } from "@/components/PropertyCard";
import { apiService } from "@/services/api";
import Footer from "@/components/layout/Footer";
import PropertyMap from "@/components/map/PropertyMap";
import ChatInterface from "@/components/chat/ChatInterface";
import ImageCarousel from "@/components/ImageCarousel";
import property1 from "@/assets/property-1.jpg";

// Types
import type {
  Property,
  PropertyImage,
  PropertyAgent,
  PropertyFeature,
} from "@/types/property";

import { getDisplayListingType } from "@/utils/propertyUtils";

// Re-export types for backward compatibility
export type { Property, PropertyImage, PropertyAgent, PropertyFeature };

const PropertyDetails = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  // Carousel functions
  const openCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
    document.body.style.overflow = "auto";
  };

  const goToNext = () => {
    if (!property) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    if (!property) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  const fetchSimilarProperties = async (property: Property) => {
    if (!property) return;

    try {
      setIsLoadingSimilar(true);
      
      // Use apiService to fetch similar properties based on listing type only (as requested)
      const response = await apiService.properties.getAll({
        listingType: property.listingType?.toUpperCase(),
        limit: 4,
      });

      if (response && response.data && Array.isArray(response.data.data)) {
        // Filter out the current property from the results
        const similar = response.data.data.filter((p: Property) => p.id !== property.id);
        setSimilarProperties(similar.slice(0, 4));
      }
    } catch (error) {
      console.error("Error fetching similar properties:", error);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError("No property ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const apiBaseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
        const response = await axios.get<{ status: string; data: Property }>(
          `${apiBaseUrl}/properties/${propertyId}`
        );

        if (
          !response.data ||
          response.data.status !== "success" ||
          !response.data.data
        ) {
          throw new Error("No valid data returned from API");
        }

        const propertyData = processPropertyData(response.data.data);
        setProperty(propertyData);
        setError(null);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const processPropertyData = (data: any): Property => {
    console.log("Property Data from API:", data); // Debug log
    // Process agent data if it exists
    let agentData = null;
    if (data.agent) {
      console.log("Agent data found:", data.agent); // Debug log for agent
      agentData = {
        id: data.agent.id || data.agent._id || data.agentId, // Handle both id and _id or flat agentId
        name:
          `${data.agent.firstName || ""} ${data.agent.lastName || ""}`.trim() ||
          "Agent",
        email: data.agent.email || "",
        phone: data.agent.phone || "",
        avatar: data.agent.avatar || "",
        company: data.agent.agentProfile?.company || "",
        licenseNumber: data.agent.agentProfile?.licenseNumber || "",
        isVerified: data.agent.agentProfile?.isVerified || false,
        bio: data.agent.agentProfile?.bio || "",
        specializations: data.agent.agentProfile?.specializations || [],
      };
    }

    return {
      ...data,
      formattedPrice: data.price
        ? `${data.currency || "KSh"} ${data.price.toLocaleString()}`
        : "Price on request",
      location: [
        data.address,
        data.neighborhood,
        data.city,
        data.county,
        data.postalCode,
      ]
        .filter(Boolean)
        .join(", "),
      formattedArea: data.areaSize
        ? `${data.areaSize} ${data.areaUnit || "sqm"}`
        : "N/A",
      features: Array.isArray(data.features)
        ? data.features
        : typeof data.features === "string"
        ? data.features.split(",").map((f: string) => f.trim())
        : [],
      images:
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : [
              {
                id: "1",
                url: property1,
                altText: data.title || "Property image",
                isPrimary: true,
                order: 1,
              },
            ],
      agent: agentData,
    };
  };

  useEffect(() => {
    if (property && !isLoading && !error) {
      fetchSimilarProperties(property);
    }
  }, [property, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Error Loading Property</h2>
            <p className="mb-4">
              {error || "The property could not be found."}
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-2">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                {property.images.length > 0 ? (
                  <img
                    src={property.images[0]?.url}
                    alt={property.images[0]?.altText || property.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openCarousel(0)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <span className="mr-1">1</span> /{" "}
                  <span className="ml-1">{property.images.length || 1}</span>
                </div>
              </div>

              {property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.images.slice(0, 4).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => openCarousel(index)}
                    >
                      <img
                        src={image.url}
                        alt={
                          image.altText ||
                          `${property.title} - Image ${index + 1}`
                        }
                        className="w-full h-full object-cover"
                      />
                      {index === 3 && property.images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                          +{property.images.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Property Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location || "Location not specified"}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  {property.formattedPrice}
                </span>
                {property.rentPeriod && (
                  <span className="text-muted-foreground">
                    / {property.rentPeriod}
                  </span>
                )}
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                {[
                  { icon: Bed, value: property.bedrooms, label: "Beds" },
                  { icon: Bath, value: property.bathrooms, label: "Baths" },
                  {
                    icon: Square,
                    value: property.formattedArea,
                    label: "Area",
                  },
                  {
                    icon: Calendar,
                    value: property.yearBuilt,
                    label: "Year Built",
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <stat.icon className="h-6 w-6 mx-auto text-primary" />
                    <div className="mt-1">
                      <span className="font-semibold">
                        {stat.value || "N/A"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground">
                  {property.description || "No description available."}
                </p>
              </div>

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Features</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Amenities</h2>
                  <p className="text-muted-foreground">{property.amenities}</p>
                </div>
              )}

              {/* Nearby Amenities */}
              {property.nearbyAmenities && (
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Nearby Amenities</h2>
                  <p className="text-muted-foreground">
                    {property.nearbyAmenities}
                  </p>
                </div>
              )}

              {/* Map */}
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Location</h2>
                <div className="h-64 rounded-lg overflow-hidden bg-muted">
                  {property.latitude && property.longitude ? (
                    <PropertyMap
                      center={[property.longitude, property.latitude]}
                      zoom={14}
                      properties={[
                        {
                          id: property.id,
                          title: property.title,
                          price: property.price,
                          bedrooms: property.bedrooms,
                          bathrooms: property.bathrooms,
                          areaSize: property.areaSize,
                          areaUnit: property.areaUnit,
                          images: property.images || [],
                          address: property.address,
                          city: property.city,
                          listingType: property.listingType,
                          propertyType: property.propertyType,
                          slug: property.slug,
                          longitude: property.longitude,
                          latitude: property.latitude,
                        },
                      ]}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-muted-foreground">
                        Location map not available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Agent */}
            {property.agent && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {property.agent.avatar ? (
                        <img
                          src={property.agent.avatar}
                          alt={property.agent.name || "Agent"}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold">
                          {property.agent.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "A"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {property.agent.name || "Agent"}
                      </h3>
                      {property.agent.company && (
                        <p className="text-sm text-muted-foreground">
                          {property.agent.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsChatOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Agent
                    </Button>
                    {property.agent.phone && (
                      <Button asChild variant="outline" className="w-full">
                        <a href={`tel:${property.agent.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Now
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule a Viewing */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Viewing</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Book a Viewing</Button>
              </CardContent>
            </Card>

            {/* Property Facts */}
            <Card>
              <CardHeader>
                <CardTitle>Property Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <p className="text-sm text-muted-foreground">Property ID</p>
                    <p className="font-medium">{property.id}</p>
                  </div> */}
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Property Type
                    </p>
                    <p className="font-medium">{property.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Listing Type
                    </p>
                    <p className="font-medium">
                      {getDisplayListingType(property.listingType)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{property.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="mt-12">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <div className="prose max-w-none">
              <h3>Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4>Basic Information</h4>
                  <ul className="space-y-2 mt-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Property Type
                      </span>
                      <span>{property.propertyType}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Listing Type
                      </span>
                      <span>{getDisplayListingType(property.listingType)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="capitalize">{property.status}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Year Built</span>
                      <span>{property.yearBuilt || "N/A"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Floors</span>
                      <span>{property.floors || "N/A"}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4>Area & Size</h4>
                  <ul className="space-y-2 mt-2">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Area Size</span>
                      <span>{property.formattedArea}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Bedrooms</span>
                      <span>{property.bedrooms || "N/A"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Bathrooms</span>
                      <span>{property.bathrooms || "N/A"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        Parking Spaces
                      </span>
                      <span>{property.parkingSpaces || "N/A"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="location" className="mt-6">
            <div className="space-y-4">
              <h3>Location</h3>
              <div className="h-96 rounded-lg overflow-hidden bg-muted">
                {property.latitude && property.longitude ? (
                  <PropertyMap
                    center={[property.longitude, property.latitude]}
                    zoom={14}
                    properties={[
                      {
                        id: property.id,
                        title: property.title,
                        price: property.price,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        areaSize: property.areaSize,
                        areaUnit: property.areaUnit,
                        images: property.images || [],
                        address: property.address,
                        city: property.city,
                        propertyType: property.propertyType,
                        longitude: property.longitude,
                        latitude: property.latitude,
                      },
                    ]}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Location map not available
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4>Address</h4>
                  <p className="text-muted-foreground mt-2">
                    {property.location}
                  </p>
                </div>
                <div>
                  <h4>Neighborhood</h4>
                  <p className="text-muted-foreground mt-2">
                    {property.neighborhood || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="share" className="mt-6">
            <div className="space-y-4">
              <h3>Share This Property</h3>
              <p className="text-muted-foreground">
                Share this property with your friends and family
              </p>
              <div className="flex space-x-4">
                <Button variant="outline">
                  <span className="mr-2">Facebook</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
                <Button variant="outline">
                  <span className="mr-2">Twitter</span>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Similar Properties */}
        <section className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Similar Properties</h2>
            <p className="text-muted-foreground">
              You might also be interested in these properties
            </p>
          </div>
          {isLoadingSimilar ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : similarProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProperties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No similar properties found.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Image Carousel Modal */}
      {isCarouselOpen && property && property.images.length > 0 && (
        <ImageCarousel
          images={property.images}
          currentIndex={currentImageIndex}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onClose={closeCarousel}
          onIndexChange={setCurrentImageIndex}
        />
      )}

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        propertyTitle={property?.title || ""}
        agentName={property?.agent?.name || "the agent"}
        agentId={property?.agent?.id}
        propertyId={property?.id || ""}
      />
    </div>
  );
};

export default PropertyDetails;
