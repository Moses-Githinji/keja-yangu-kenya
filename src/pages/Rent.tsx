import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Rent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rentRange, setRentRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [duration, setDuration] = useState("");

  // Sample rental properties
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
      type: "For Rent"
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
      type: "For Rent"
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
      type: "For Rent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rent Property</h1>
          <p className="text-muted-foreground text-lg">Find your next rental home in Kenya</p>
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
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            Furnished
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            Pet Friendly
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            Parking Available
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            Swimming Pool
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
            Gym
          </Badge>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{properties.length} rentals found</Badge>
            <span className="text-muted-foreground">in Nairobi</span>
          </div>
          
          <Select defaultValue="newest">
            <SelectTrigger className="w-48">
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

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {properties.map((property) => (
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

export default Rent;