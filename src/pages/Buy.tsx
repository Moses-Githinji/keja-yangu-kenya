import { useState } from "react";
import { Search, Filter, MapPin, Bed, Bath, Square } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Buy = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  // Sample properties for sale
  const properties = [
    {
      id: "1",
      title: "Modern Villa in Karen",
      location: "Karen, Nairobi",
      price: "KSh 25,000,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: "350 sqm",
      rating: 4.8,
      type: "For Sale"
    },
    {
      id: "2", 
      title: "Luxury Apartment in Westlands",
      location: "Westlands, Nairobi",
      price: "KSh 15,000,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 3,
      bathrooms: 2,
      area: "180 sqm",
      rating: 4.6,
      type: "For Sale"
    },
    {
      id: "3",
      title: "Family Home in Runda",
      location: "Runda, Nairobi", 
      price: "KSh 35,000,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 5,
      bathrooms: 4,
      area: "450 sqm",
      rating: 4.9,
      type: "For Sale"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buy Property</h1>
          <p className="text-muted-foreground text-lg">Find your perfect home in Kenya</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
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
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5m-15m">KSh 5M - 15M</SelectItem>
                <SelectItem value="15m-25m">KSh 15M - 25M</SelectItem>
                <SelectItem value="25m-50m">KSh 25M - 50M</SelectItem>
                <SelectItem value="50m+">KSh 50M+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-primary hover:bg-primary/90">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{properties.length} properties found</Badge>
            <span className="text-muted-foreground">in Nairobi</span>
          </div>
          
          <Select defaultValue="newest">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id}
              id={property.id}
              title={property.title}
              location={property.location}
              price={property.price.replace('KSh ', '').replace(',', '')}
              priceType="sale"
              image={property.image}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              area={parseInt(property.area)}
              rating={property.rating}
              isFeatured={true}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Properties
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Buy;