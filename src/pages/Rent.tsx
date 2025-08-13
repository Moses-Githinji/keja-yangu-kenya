import { useState } from "react";
import { Search, Filter, Calendar, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyMap from "@/components/map/PropertyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Rent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rentRange, setRentRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [duration, setDuration] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const itemsPerPage = 6;

  // Sample rental properties with coordinates for map
  const properties = [
    {
      id: "1",
      title: "Furnished Apartment in Kilimani",
      location: "Kilimani, Nairobi",
      price: "KSh 80,000/month",
      image: "/src/assets/property-1.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: "120 sqm",
      rating: 4.7,
      type: "For Rent",
      longitude: 36.7878,
      latitude: -1.2921,
      amenities: ["Furnished", "Parking", "Security"]
    },
    {
      id: "2", 
      title: "Studio in CBD",
      location: "Central Business District",
      price: "KSh 45,000/month",
      image: "/src/assets/property-2.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: "45 sqm",
      rating: 4.4,
      type: "For Rent",
      longitude: 36.8219,
      latitude: -1.2864,
      amenities: ["Gym", "24/7 Security"]
    },
    {
      id: "3",
      title: "3BR House in Lavington",
      location: "Lavington, Nairobi", 
      price: "KSh 120,000/month",
      image: "/src/assets/property-3.jpg",
      bedrooms: 3,
      bathrooms: 2,
      area: "200 sqm",
      rating: 4.8,
      type: "For Rent",
      longitude: 36.7519,
      latitude: -1.2707,
      amenities: ["Swimming Pool", "Garden", "Parking", "Pet Friendly"]
    },
    {
      id: "4",
      title: "Modern 2BR in Westlands",
      location: "Westlands, Nairobi",
      price: "KSh 95,000/month",
      image: "/src/assets/property-1.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: "150 sqm",
      rating: 4.6,
      type: "For Rent",
      longitude: 36.8094,
      latitude: -1.2681,
      amenities: ["Furnished", "Gym", "Parking"]
    },
    {
      id: "5",
      title: "1BR Apartment in Karen",
      location: "Karen, Nairobi",
      price: "KSh 65,000/month",
      image: "/src/assets/property-2.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: "85 sqm",
      rating: 4.5,
      type: "For Rent",
      longitude: 36.6855,
      latitude: -1.3197,
      amenities: ["Garden", "Security", "Parking"]
    },
    {
      id: "6",
      title: "Luxury 4BR Villa",
      location: "Runda, Nairobi",
      price: "KSh 180,000/month",
      image: "/src/assets/property-3.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: "300 sqm",
      rating: 4.9,
      type: "For Rent",
      longitude: 36.7626,
      latitude: -1.2176,
      amenities: ["Swimming Pool", "Garden", "Gym", "Security", "Parking"]
    }
  ];

  // Filter and paginate properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || 
                          activeFilters.some(filter => property.amenities.includes(filter));
    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Rent Property</h1>
          <p className="text-muted-foreground text-lg">Find your next rental home in Kenya</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={rentRange} onValueChange={setRentRange}>
              <SelectTrigger>
                <SelectValue placeholder="Monthly Rent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20k-50k">KSh 20K - 50K</SelectItem>
                <SelectItem value="50k-80k">KSh 50K - 80K</SelectItem>
                <SelectItem value="80k-120k">KSh 80K - 120K</SelectItem>
                <SelectItem value="120k+">KSh 120K+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short Term (1-6 months)</SelectItem>
                <SelectItem value="medium">Medium Term (6-12 months)</SelectItem>
                <SelectItem value="long">Long Term (1+ years)</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["Furnished", "Pet Friendly", "Parking", "Swimming Pool", "Gym", "Garden", "Security"].map((filter) => (
            <Badge 
              key={filter}
              variant={activeFilters.includes(filter) ? "default" : "outline"} 
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => toggleFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Content - Map and Properties Split */}
      <div className="flex h-[calc(100vh-300px)] min-h-[600px]">
        {/* Map Section - Left Side */}
        <div className="w-1/2 border-r">
          <PropertyMap 
            className="h-full"
            properties={filteredProperties.map(property => ({
              id: property.id,
              longitude: property.longitude,
              latitude: property.latitude,
              title: property.title,
              price: property.price
            }))}
          />
        </div>

        {/* Properties Section - Right Side */}
        <div className="w-1/2 flex flex-col">
          {/* Controls Header */}
          <div className="bg-card border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{filteredProperties.length} rentals found</Badge>
                <span className="text-muted-foreground text-sm">in Nairobi</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Rent: Low to High</SelectItem>
                    <SelectItem value="price-high">Rent: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Properties Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4">
                {paginatedProperties.map((property) => (
                  <PropertyCard 
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    location={property.location}
                    price={property.price.replace('KSh ', '').replace('/month', '').replace(',', '')}
                    priceType="rent"
                    image={property.image}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    area={parseInt(property.area)}
                    rating={property.rating}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProperties.map((property) => (
                  <Card key={property.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img 
                          src={property.image} 
                          alt={property.title}
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                          <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{property.bedrooms} beds</span>
                            <span>{property.bathrooms} baths</span>
                            <span>{property.area}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{property.price}</span>
                            <Badge variant="outline">★ {property.rating}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Rent;