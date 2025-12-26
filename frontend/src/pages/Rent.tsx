import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  DollarSign,
  Users,
  Home,
  Award,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyModal from "@/components/properties/PropertyModal";
import PropertyMap from "@/components/map/PropertyMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, School } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Rent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rentRange, setRentRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [duration, setDuration] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const itemsPerPage = 10;
  const [searchParams] = useSearchParams();

  // Handle query parameters from landing page search
  useEffect(() => {
    const search = searchParams.get("search");
    const propertyTypeParam = searchParams.get("propertyType");
    const location = searchParams.get("location");
    const priceRangeParam = searchParams.get("priceRange");
    const bedroomsParam = searchParams.get("bedrooms");
    const bathroomsParam = searchParams.get("bathrooms");
    const areaParam = searchParams.get("area");

    if (search) setSearchQuery(search);
    if (propertyTypeParam) setPropertyType(propertyTypeParam);
    if (priceRangeParam) setRentRange(priceRangeParam);

    // Clear URL parameters after applying them
    if (
      search ||
      propertyTypeParam ||
      location ||
      priceRangeParam ||
      bedroomsParam ||
      bathroomsParam ||
      areaParam
    ) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Sample rental properties with coordinates for map
  const properties = [
    {
      id: "1",
      title: "Modern Apartment in Westlands",
      location: "Westlands, Nairobi",
      price: "120,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      rating: 4.7,
      type: "For Rent",
      propertyType: "apartment",
      longitude: 36.8094,
      latitude: -1.2681,
    },
    {
      id: "2",
      title: "Spacious House in Lavington",
      location: "Lavington, Nairobi",
      price: "250,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: 280,
      rating: 4.8,
      type: "For Rent",
      propertyType: "house",
      longitude: 36.7519,
      latitude: -1.2707,
    },
    {
      id: "3",
      title: "Luxury Villa in Karen",
      location: "Karen, Nairobi",
      price: "450,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 5,
      bathrooms: 4,
      area: 400,
      rating: 4.9,
      type: "For Rent",
      propertyType: "villa",
      longitude: 36.6855,
      latitude: -1.3197,
    },
    {
      id: "4",
      title: "Townhouse in Kileleshwa",
      location: "Kileleshwa, Nairobi",
      price: "180,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      rating: 4.6,
      type: "For Rent",
      propertyType: "townhouse",
      longitude: 36.7878,
      latitude: -1.2921,
    },
    {
      id: "5",
      title: "Studio Apartment in Kilimani",
      location: "Kilimani, Nairobi",
      price: "85,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 80,
      rating: 4.4,
      type: "For Rent",
      propertyType: "studio",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    {
      id: "6",
      title: "Penthouse in Upper Hill",
      location: "Upper Hill, Nairobi",
      price: "350,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 3,
      bathrooms: 3,
      area: 250,
      rating: 4.9,
      type: "For Rent",
      propertyType: "penthouse",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "7",
      title: "Duplex in Runda",
      location: "Runda, Nairobi",
      price: "280,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: 300,
      rating: 4.7,
      type: "For Rent",
      propertyType: "duplex",
      longitude: 36.7626,
      latitude: -1.2176,
    },
    {
      id: "8",
      title: "Student Room in Westlands",
      location: "Westlands, Nairobi",
      price: "45,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 60,
      rating: 4.2,
      type: "For Rent",
      propertyType: "student-hostel",
      longitude: 36.8094,
      latitude: -1.2681,
    },
    {
      id: "9",
      title: "Shared Student Accommodation",
      location: "Kilimani, Nairobi",
      price: "35,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 50,
      rating: 4.1,
      type: "For Rent",
      propertyType: "student-hostel",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    {
      id: "10",
      title: "Campus Hostel Room",
      location: "Upper Hill, Nairobi",
      price: "40,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 55,
      rating: 4.0,
      type: "For Rent",
      propertyType: "student-hostel",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "11",
      title: "Office Space in CBD",
      location: "CBD, Nairobi",
      price: "180,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 0,
      bathrooms: 2,
      area: 150,
      rating: 4.5,
      type: "For Rent",
      propertyType: "commercial",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "12",
      title: "Retail Shop in Westlands",
      location: "Westlands, Nairobi",
      price: "120,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 0,
      bathrooms: 1,
      area: 100,
      rating: 4.3,
      type: "For Rent",
      propertyType: "commercial",
      longitude: 36.8094,
      latitude: -1.2681,
    },
    {
      id: "13",
      title: "Warehouse Space",
      location: "Industrial Area, Nairobi",
      price: "95,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 0,
      bathrooms: 1,
      area: 300,
      rating: 4.1,
      type: "For Rent",
      propertyType: "industrial",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "14",
      title: "Manufacturing Unit",
      location: "Athi River, Nairobi",
      price: "150,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 0,
      bathrooms: 2,
      area: 500,
      rating: 4.0,
      type: "For Rent",
      propertyType: "industrial",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "15",
      title: "Storage Facility",
      location: "Ruiru, Nairobi",
      price: "75,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 0,
      bathrooms: 1,
      area: 200,
      rating: 4.2,
      type: "For Rent",
      propertyType: "industrial",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "16",
      title: "Beach House in Diani",
      location: "Diani, Coast",
      price: "200,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      rating: 4.8,
      type: "For Rent",
      propertyType: "beach-house",
      longitude: 39.5667,
      latitude: -4.2833,
    },
    {
      id: "17",
      title: "Coastal Villa in Malindi",
      location: "Malindi, Coast",
      price: "180,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      rating: 4.6,
      type: "For Rent",
      propertyType: "beach-house",
      longitude: 40.1167,
      latitude: -3.2167,
    },
    {
      id: "18",
      title: "Seaside Apartment",
      location: "Nyali, Mombasa",
      price: "150,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      rating: 4.7,
      type: "For Rent",
      propertyType: "beach-house",
      longitude: 39.6682,
      latitude: -4.0435,
    },
    {
      id: "19",
      title: "Serviced Apartment",
      location: "Westlands, Nairobi",
      price: "200,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: 140,
      rating: 4.8,
      type: "For Rent",
      propertyType: "serviced",
      longitude: 36.8094,
      latitude: -1.2681,
    },
    {
      id: "20",
      title: "Luxury Serviced Suite",
      location: "Kilimani, Nairobi",
      price: "300,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 100,
      rating: 4.9,
      type: "For Rent",
      propertyType: "serviced",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    // Additional properties to ensure each filter has at least 3 options
    {
      id: "21",
      title: "Cozy Studio in Hurlingham",
      location: "Hurlingham, Nairobi",
      price: "65,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 70,
      rating: 4.3,
      type: "For Rent",
      propertyType: "studio",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    {
      id: "22",
      title: "Compact Studio in South C",
      location: "South C, Nairobi",
      price: "55,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 1,
      bathrooms: 1,
      area: 55,
      rating: 4.1,
      type: "For Rent",
      propertyType: "studio",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "23",
      title: "Family House in Spring Valley",
      location: "Spring Valley, Nairobi",
      price: "220,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      rating: 4.6,
      type: "For Rent",
      propertyType: "house",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    {
      id: "24",
      title: "Garden House in Gigiri",
      location: "Gigiri, Nairobi",
      price: "280,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 5,
      bathrooms: 4,
      area: 380,
      rating: 4.7,
      type: "For Rent",
      propertyType: "house",
      longitude: 36.8144,
      latitude: -1.2354,
    },
    {
      id: "25",
      title: "Executive Penthouse in Westlands",
      location: "Westlands, Nairobi",
      price: "400,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 3,
      bathrooms: 3,
      area: 280,
      rating: 4.8,
      type: "For Rent",
      propertyType: "penthouse",
      longitude: 36.8094,
      latitude: -1.2681,
    },
    {
      id: "26",
      title: "Luxury Penthouse in Kilimani",
      location: "Kilimani, Nairobi",
      price: "380,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 2,
      bathrooms: 2,
      area: 200,
      rating: 4.9,
      type: "For Rent",
      propertyType: "penthouse",
      longitude: 36.7989,
      latitude: -1.2589,
    },
    {
      id: "27",
      title: "Modern Duplex in Lavington",
      location: "Lavington, Nairobi",
      price: "320,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      rating: 4.8,
      type: "For Rent",
      propertyType: "duplex",
      longitude: 36.7519,
      latitude: -1.2707,
    },
    {
      id: "28",
      title: "Townhouse in Runda",
      location: "Runda, Nairobi",
      price: "240,000",
      image: "/src/assets/property-1.jpg",
      bedrooms: 3,
      bathrooms: 2,
      area: 250,
      rating: 4.5,
      type: "For Rent",
      propertyType: "townhouse",
      longitude: 36.7626,
      latitude: -1.2176,
    },
    {
      id: "29",
      title: "Commercial Office in Upper Hill",
      location: "Upper Hill, Nairobi",
      price: "220,000",
      image: "/src/assets/property-2.jpg",
      bedrooms: 0,
      bathrooms: 2,
      area: 180,
      rating: 4.4,
      type: "For Rent",
      propertyType: "commercial",
      longitude: 36.8219,
      latitude: -1.2864,
    },
    {
      id: "30",
      title: "Villa in Muthaiga",
      location: "Muthaiga, Nairobi",
      price: "500,000",
      image: "/src/assets/property-3.jpg",
      bedrooms: 6,
      bathrooms: 5,
      area: 450,
      rating: 4.9,
      type: "For Rent",
      propertyType: "villa",
      longitude: 36.8144,
      latitude: -1.2354,
    },
  ];

  // Filter and paginate properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPropertyType =
      !propertyType || property.propertyType === propertyType;

    const matchesRentRange =
      !rentRange ||
      (() => {
        const price = parseInt(property.price.replace(/,/g, ""));
        switch (rentRange) {
          case "20k-50k":
            return price >= 20000 && price <= 50000;
          case "50k-80k":
            return price >= 50000 && price <= 80000;
          case "80k-120k":
            return price >= 80000 && price <= 120000;
          case "120k+":
            return price >= 120000;
          default:
            return true;
        }
      })();

    const matchesDuration =
      !duration ||
      (() => {
        // For now, all properties are long-term rentals
        // In a real app, this would check actual duration data
        return true;
      })();

    return (
      matchesSearch &&
      matchesPropertyType &&
      matchesRentRange &&
      matchesDuration
    );
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (
          parseInt(a.price.replace(/,/g, "")) -
          parseInt(b.price.replace(/,/g, ""))
        );
      case "price-high":
        return (
          parseInt(b.price.replace(/,/g, "")) -
          parseInt(a.price.replace(/,/g, ""))
        );
      case "rating":
        return b.rating - a.rating;
      default:
        return 0; // newest first (keep original order)
    }
  });

  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);

  const paginatedProperties = sortedProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
    setCurrentPage(1); // Reset to first page when filters change
    setSelectedPropertyId(null);
  };

  // Handle map pin selection
  const handleMapPinClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    // Find the property and scroll to it in the grid
    const propertyIndex = sortedProperties.findIndex(
      (p) => p.id === propertyId
    );
    if (propertyIndex !== -1) {
      const targetPage = Math.floor(propertyIndex / itemsPerPage) + 1;
      setCurrentPage(targetPage);
    }
  };

  // Handle Quick View button click
  const handleQuickView = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  // Reset selection when filters change
  const handleFilterChange = () => {
    setSelectedPropertyId(null);
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setRentRange("");
    setPropertyType("");
    setDuration("");
    setActiveFilters([]);
    handleFilterChange(); // This will re-filter and re-paginate
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Rent Property</h1>
          <p className="text-muted-foreground text-lg">
            Find your next rental home in Kenya
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={rentRange}
              onValueChange={(value) => {
                setRentRange(value);
                handleFilterChange();
              }}
            >
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

            <Select
              value={propertyType}
              onValueChange={(value) => {
                setPropertyType(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="duplex">Duplex</SelectItem>
                <SelectItem value="student-hostel">Student Hostel</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="beach-house">Beach House</SelectItem>
                <SelectItem value="serviced">Serviced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={duration}
              onValueChange={(value) => {
                setDuration(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short Term (1-6 months)</SelectItem>
                <SelectItem value="medium">
                  Medium Term (6-12 months)
                </SelectItem>
                <SelectItem value="long">Long Term (1+ years)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="bg-primary hover:bg-primary/90 flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="px-3"
                title="Reset all filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            "Furnished",
            "Pet Friendly",
            "Parking",
            "Swimming Pool",
            "Gym",
            "Garden",
            "Security",
          ].map((filter) => (
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
      <div className="flex h-[calc(100vh-300px)] min-h-[600px] gap-6 px-4 mb-12">
        {/* Map Section - Left Side */}
        <div className="w-1/2 border rounded-lg overflow-hidden">
          <PropertyMap
            className="h-full"
            properties={filteredProperties.map((property) => ({
              id: property.id,
              longitude: property.longitude,
              latitude: property.latitude,
              title: property.title,
              price: `KSh ${property.price}/month`,
              propertyType: property.propertyType,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              area: property.area,
              images: [property.image], // Convert single image to array
              amenities: [
                "Swimming Pool",
                "Security System",
                "Garden",
                "Parking",
                "Modern Kitchen",
                "Balcony",
              ], // Sample amenities
              rating: property.rating,
            }))}
            onPinClick={handleMapPinClick}
            onQuickView={(propertyId) => {
              const property = filteredProperties.find(
                (p) => p.id === propertyId
              );
              if (property) {
                setSelectedProperty(property);
                setIsModalOpen(true);
              }
            }}
            selectedPropertyId={selectedPropertyId}
            showMapToggle={true}
          />
        </div>

        {/* Properties Section - Right Side */}
        <div className="w-1/2 flex flex-col">
          {/* Controls Header */}
          <div className="bg-card border rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {filteredProperties.length} rentals found
                </Badge>
                <span className="text-muted-foreground text-sm">in Kenya</span>
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
                    <SelectItem value="price-high">
                      Rent: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Properties Content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4">
                {paginatedProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`transition-all duration-200 ${
                      selectedPropertyId === property.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  >
                    <PropertyCard
                      id={property.id}
                      title={property.title}
                      location={property.location}
                      price={property.price}
                      priceType="rent"
                      image={property.image}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      rating={property.rating}
                      isFeatured={property.rating >= 4.8}
                      isLuxury={
                        parseInt(property.price.replace(/,/g, "")) >= 150000
                      }
                      isVerified={Math.random() < 0.7} // 70% chance of being verified
                      isPaid={Math.random() < 0.6} // 60% chance of being paid
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`transition-all duration-200 ${
                      selectedPropertyId === property.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {property.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mb-2">
                              {property.location}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span>{property.bedrooms} beds</span>
                              <span>{property.bathrooms} baths</span>
                              <span>{property.area} m²</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">
                                KSh {property.price}/month
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  ★ {property.rating}
                                </Badge>
                                {/* Random badges for list view */}
                                {Math.random() < 0.7 && (
                                  <Badge className="bg-green-500 text-green-50 text-xs">
                                    Verified
                                  </Badge>
                                )}
                                {Math.random() < 0.6 && (
                                  <Badge className="bg-blue-500 text-blue-50 text-xs">
                                    Paid
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                  onClick={() => handleQuickView(property)}
                                >
                                  Quick View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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

      {/* Kenyan Rental Market Trends Section */}
      <div className="mb-12 px-4">
        <Card className="border-0 bg-gradient-to-r from-muted/30 to-background">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gradient-primary mb-4">
                Kenyan Rental Market Trends
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Stay informed about the latest rental trends, opportunities, and
                insights in Kenya's dynamic rental market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rental Market Overview */}
              <Card className="border-0 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Rental Market Overview
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Average Rent:
                      </span>
                      <span className="font-medium">KSh 85,000/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Rent Growth:
                      </span>
                      <span className="font-medium text-success">
                        +6.8% YoY
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Vacancy Rate:
                      </span>
                      <span className="font-medium">8.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Rental Areas */}
              <Card className="border-0 bg-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Popular Rental Areas
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kilimani:</span>
                      <span className="font-medium text-success">+9.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Westlands:</span>
                      <span className="font-medium text-success">+7.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lavington:</span>
                      <span className="font-medium text-success">+6.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Yields */}
              <Card className="border-0 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-warning" />
                    </div>
                    <h3 className="text-lg font-semibold">Rental Yields</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Apartments:</span>
                      <span className="font-medium text-success">7.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Houses:</span>
                      <span className="font-medium text-success">6.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Studios:</span>
                      <span className="font-medium text-success">8.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Demographics */}
              <Card className="border-0 bg-success/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Tenant Demographics
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Young Professionals:
                      </span>
                      <span className="font-medium text-success">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Expatriates:
                      </span>
                      <span className="font-medium">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">27%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Preferences */}
              <Card className="border-0 bg-info/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                      <Home className="h-6 w-6 text-info" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Rental Preferences
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Furnished Units:
                      </span>
                      <span className="font-medium text-success">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Security Features:
                      </span>
                      <span className="font-medium text-success">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Parking Space:
                      </span>
                      <span className="font-medium text-success">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Outlook */}
              <Card className="border-0 bg-purple/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple" />
                    </div>
                    <h3 className="text-lg font-semibold">Market Outlook</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        2024 Growth:
                      </span>
                      <span className="font-medium text-success">+8-12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Supply:</span>
                      <span className="font-medium text-success">+18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Demand Trend:
                      </span>
                      <span className="font-medium text-success">Strong</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Short-term Rentals */}
              <Card className="border-0 bg-orange/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Short-term Rentals
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Airbnb Growth:
                      </span>
                      <span className="font-medium text-success">+35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Daily Rates:
                      </span>
                      <span className="font-medium">KSh 8,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Occupancy Rate:
                      </span>
                      <span className="font-medium text-success">72%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Corporate Rentals */}
              <Card className="border-0 bg-teal/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-teal" />
                    </div>
                    <h3 className="text-lg font-semibold">Corporate Rentals</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Company Demand:
                      </span>
                      <span className="font-medium text-success">+22%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Avg. Contract:
                      </span>
                      <span className="font-medium">18 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Premium Rate:
                      </span>
                      <span className="font-medium text-success">+15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Housing */}
              <Card className="border-0 bg-pink/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink/10 rounded-lg flex items-center justify-center">
                      <School className="h-6 w-6 text-pink" />
                    </div>
                    <h3 className="text-lg font-semibold">Student Housing</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Enrollment Growth:
                      </span>
                      <span className="font-medium text-success">+12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Rent:</span>
                      <span className="font-medium">KSh 45,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Shared Units:
                      </span>
                      <span className="font-medium text-success">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />

      {/* Property Modal - Only render when property is selected */}
      {selectedProperty && (
        <PropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={selectedProperty}
        />
      )}
    </div>
  );
};

export default Rent;
