import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import PropertyCard from "@/components/properties/PropertyCard";

interface PropertySectionProps {
  title: string;
  subtitle: string;
  type: "featured" | "verified";
  bgColor?: string;
}

const PropertySection: React.FC<PropertySectionProps> = ({ title, subtitle, type, bgColor = "bg-gray-50" }) => {
  const [filters, setFilters] = useState({
    propertyType: "all",
    listingType: "all",
    maxPrice: "",
    bedrooms: "all",
    city: "",
  });

  const { data: properties, isLoading, error } = useQuery({
    queryKey: [type, filters],
    queryFn: async () => {
      const params: any = {};
      
      if (filters.propertyType && filters.propertyType !== "all") params.propertyType = filters.propertyType;
      if (filters.listingType && filters.listingType !== "all") params.listingType = filters.listingType;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms && filters.bedrooms !== "all") params.bedrooms = filters.bedrooms;
      if (filters.city) params.city = filters.city;

      const response = await (type === "featured" 
        ? apiService.properties.getFeatured(params)
        : apiService.properties.getVerified(params));
        
      return response.data.data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg shadow-sm w-full md:w-auto">
            <div className="flex items-center gap-2 mr-2 text-sm font-medium text-gray-500">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            <Select value={filters.listingType} onValueChange={(val) => handleFilterChange("listingType", val)}>
              <SelectTrigger className="w-[110px] h-9 text-xs">
                <SelectValue placeholder="For" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Status</SelectItem>
                <SelectItem value="SALE">For Sale</SelectItem>
                <SelectItem value="RENT">For Rent</SelectItem>
                <SelectItem value="SHORT_TERM_RENT">Brief Stay</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.propertyType} onValueChange={(val) => handleFilterChange("propertyType", val)}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Type</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="Max Price" 
              className="w-[100px] h-9 text-xs"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />

            <Select value={filters.bedrooms} onValueChange={(val) => handleFilterChange("bedrooms", val)}>
              <SelectTrigger className="w-[100px] h-9 text-xs">
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Beds</SelectItem>
                <SelectItem value="1">1+ Bed</SelectItem>
                <SelectItem value="2">2+ Beds</SelectItem>
                <SelectItem value="3">3+ Beds</SelectItem>
                <SelectItem value="4">4+ Beds</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="City/Location" 
              className="w-[120px] h-9 text-xs"
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
           <div className="text-center py-10 text-red-500 bg-white rounded-lg shadow-sm">
            <p>Failed to load properties. Please try again later.</p>
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters to see more results.</p>
            <Button 
                variant="link" 
                className="mt-2 text-primary"
                onClick={() => setFilters({ propertyType: "all", listingType: "all", maxPrice: "", bedrooms: "all", city: "" })}
            >
                Clear Filters
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 pb-4">
                {properties.map((property: Property) => (
                  <CarouselItem
                    key={property.id}
                    className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <div className="h-full">
                       <PropertyCard 
                        id={property.id}
                        title={property.title}
                        location={property.city || property.address}
                        price={property.price.toLocaleString()}
                        priceType={
                          property.listingType === 'RENT' 
                            ? 'rent' 
                            : property.listingType === 'SHORT_TERM_RENT' 
                              ? 'short_term' 
                              : 'sale'
                        }
                        images={property.images?.map(img => img.url) || []}
                        primaryImage={property.images?.[0]?.url}
                        bedrooms={property.bedrooms || 0}
                        bathrooms={property.bathrooms || 0}
                        area={property.areaSize || 0}
                        areaUnit={property.areaUnit}
                        rating={property.rating || 0}
                        isVerified={property.isVerified}
                        isFeatured={property.isFeatured}
                        isLuxury={false}
                        isPaid={false}
                       />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 -translate-x-2 bg-white/90 shadow-md hover:bg-white z-10 border-none text-primary" />
              <CarouselNext className="right-0 translate-x-2 bg-white/90 shadow-md hover:bg-white z-10 border-none text-primary" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertySection;
