import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyMap from "@/components/map/PropertyMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Star } from "lucide-react";

const MapDemo = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // Sample properties with multiple images and amenities for demo
  const demoProperties = [
    {
      id: "1",
      title: "Luxury Villa with Ocean Views",
      location: "Nyali, Mombasa",
      price: "25,000,000",
      propertyType: "villa",
      longitude: 39.6682,
      latitude: -4.0435,
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      rating: 4.8,
      images: [
        "/src/assets/property-1.jpg",
        "/src/assets/property-2.jpg",
        "/src/assets/property-3.jpg",
        "/src/assets/property-1.jpg", // Duplicate for demo
      ],
      amenities: [
        "Private Swimming Pool",
        "Ocean View",
        "Security System",
        "Garden",
        "Modern Kitchen",
        "Balcony",
        "Parking",
        "Backup Generator",
      ],
    },
    {
      id: "2",
      title: "Modern Apartment in Westlands",
      location: "Westlands, Nairobi",
      price: "15,000,000",
      propertyType: "apartment",
      longitude: 36.8094,
      latitude: -1.2681,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      rating: 4.6,
      images: [
        "/src/assets/property-2.jpg",
        "/src/assets/property-3.jpg",
        "/src/assets/property-1.jpg",
      ],
      amenities: [
        "Swimming Pool",
        "Gym",
        "Security",
        "Parking",
        "Balcony",
        "Modern Kitchen",
      ],
    },
    {
      id: "3",
      title: "Family Home in Runda",
      location: "Runda, Nairobi",
      price: "35,000,000",
      propertyType: "house",
      longitude: 36.7626,
      latitude: -1.2176,
      bedrooms: 5,
      bathrooms: 4,
      area: 450,
      rating: 4.9,
      images: [
        "/src/assets/property-3.jpg",
        "/src/assets/property-1.jpg",
        "/src/assets/property-2.jpg",
      ],
      amenities: [
        "Swimming Pool",
        "Garden",
        "Security System",
        "Parking",
        "Modern Kitchen",
        "Study Room",
        "Servant Quarters",
      ],
    },
    {
      id: "4",
      title: "Beachfront Plot in Diani",
      location: "Diani, Coast",
      price: "45,000,000",
      propertyType: "land",
      longitude: 39.5833,
      latitude: -4.3167,
      bedrooms: 0,
      bathrooms: 0,
      area: 1000,
      rating: 4.7,
      images: ["/src/assets/property-1.jpg", "/src/assets/property-2.jpg"],
      amenities: [
        "Beach Access",
        "Ocean View",
        "Security",
        "Road Access",
        "Water Connection",
      ],
    },
  ];

  const handleMapPinClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const selectedProperty = demoProperties.find(
    (p) => p.id === selectedPropertyId
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">🗺️ Enhanced Map Demo</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the enhanced PropertyMap with interactive popups, image
            carousels, and detailed property information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span>Interactive Property Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <PropertyMap
                    className="h-full"
                    properties={demoProperties.map((property) => ({
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
                      amenities: property.amenities,
                      rating: property.rating,
                    }))}
                    onPinClick={handleMapPinClick}
                    onQuickView={(propertyId) => {
                      const property = demoProperties.find(
                        (p) => p.id === propertyId
                      );
                      if (property) {
                        setSelectedPropertyId(propertyId);
                        // You could add a modal here or navigate to property details
                        console.log("Quick view for property:", propertyId);
                      }
                    }}
                    selectedPropertyId={selectedPropertyId}
                    showMapToggle={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Properties on Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPropertyId === property.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {property.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-1">
                            {property.location}
                          </p>
                          <div className="text-sm font-bold text-green-600">
                            KSh {property.price}
                          </div>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-muted-foreground">
                            {property.bedrooms > 0 && (
                              <div className="flex items-center space-x-1">
                                <Bed className="h-3 w-3" />
                                <span>{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms > 0 && (
                              <div className="flex items-center space-x-1">
                                <Bath className="h-3 w-3" />
                                <span>{property.bathrooms}</span>
                              </div>
                            )}
                            {property.area > 0 && (
                              <div className="flex items-center space-x-1">
                                <Square className="h-3 w-3" />
                                <span>{property.area} sqm</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{property.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Property Details */}
            {selectedProperty && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">
                        {selectedProperty.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedProperty.location}
                      </p>
                    </div>

                    <div className="text-lg font-bold text-green-600">
                      KSh {selectedProperty.price}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {selectedProperty.bedrooms > 0 && (
                        <div className="flex items-center space-x-1">
                          <Bed className="h-3 w-3" />
                          <span>{selectedProperty.bedrooms}</span>
                        </div>
                      )}
                      {selectedProperty.bathrooms > 0 && (
                        <div className="flex items-center space-x-1">
                          <Bath className="h-3 w-3" />
                          <span>{selectedProperty.bathrooms}</span>
                        </div>
                      )}
                      {selectedProperty.area > 0 && (
                        <div className="flex items-center space-x-1">
                          <Square className="h-3 w-3" />
                          <span>{selectedProperty.area} sqm</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">
                        Amenities
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedProperty.amenities
                          .slice(0, 6)
                          .map((amenity, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {amenity}
                            </Badge>
                          ))}
                        {selectedProperty.amenities.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{selectedProperty.amenities.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">
                        Images
                      </h5>
                      <div className="flex space-x-2 overflow-x-auto">
                        {selectedProperty.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${selectedProperty.title} - Image ${
                              index + 1
                            }`}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Use the Enhanced Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">🎯 Interactive Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • Click on any property marker to see detailed popup
                    </li>
                    <li>
                      • Navigate through property images using carousel controls
                    </li>
                    <li>• View property details, amenities, and stats</li>
                    <li>
                      • Switch between map styles (Light, Dark, Satellite)
                    </li>
                    <li>• Use navigation controls for zoom and pan</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📱 Popup Information</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Property title and price</li>
                    <li>• Image carousel with navigation</li>
                    <li>• Bedrooms, bathrooms, and area</li>
                    <li>• Property rating</li>
                    <li>• Key amenities (up to 4 shown)</li>
                    <li>• Property type and view details link</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MapDemo;
