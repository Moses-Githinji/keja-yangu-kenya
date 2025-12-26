import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  MapPin,
  Bed,
  Bath,
  Square,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Building2,
  Shield,
  Award,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import PropertyModal from "@/components/properties/PropertyModal";
import PropertyMap from "@/components/map/PropertyMap";
import { SearchInput } from "@/components/search/SearchInput";
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
import { useSearchParams } from "react-router-dom";
import { useSearch, SearchFilters } from "@/hooks/useSearch";
import { getDisplayListingType, normalizeListingType } from "@/utils/propertyUtils";

const Buy = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapProperties, setMapProperties] = useState<any[]>([]);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (property: any) => {
    setSelectedProperty(property);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setSelectedProperty(null);
  };

  const itemsPerPage = 10;
  const [searchParams] = useSearchParams();

  // Initialize search hook with sale listing type
  const {
    searchQuery,
    updateSearchQuery,
    filters,
    updateFilters,
    resetSearch,
    totalResults,
    results,
    isLoading,
    error,
    hasInitialized,
  } = useSearch({
    listingType: "SALE",
    page: 1,
    limit: 10,
    status: 'AVAILABLE'
  });

  // Trigger search on component mount
  useEffect(() => {
    console.log('Component mounted, triggering initial search');
    updateFilters({}); // This will trigger a search with default filters
  }, []);

  // Debug log when results change
  useEffect(() => {
    console.log('Search results updated:', {
      hasInitialized,
      isLoading,
      error,
      results: results?.properties?.length || 0,
      total: results?.total || 0,
      filters,
      properties: results?.properties
    });
  }, [results, hasInitialized, isLoading, error, filters]);

  // Handle query parameters from landing page search
  useEffect(() => {
    const search = searchParams.get("search");
    const propertyTypeParam = searchParams.get("propertyType");
    const location = searchParams.get("location");
    const priceRangeParam = searchParams.get("priceRange");
    const bedroomsParam = searchParams.get("bedrooms");
    const bathroomsParam = searchParams.get("bathrooms");
    const areaParam = searchParams.get("area");

    if (search) updateSearchQuery(search);
    if (propertyTypeParam) updateFilters({ propertyType: propertyTypeParam });
    if (location) updateFilters({ city: location });
    if (priceRangeParam) {
      // Parse price range and set min/max
      const [min, max] = priceRangeParam
        .split("-")
        .map((p) =>
          p.replace(/[^\d]/g, "") === ""
            ? undefined
            : parseInt(p.replace(/[^\d]/g, ""))
        );
      updateFilters({
        minPrice: min,
        maxPrice: max,
      });
    }
    if (bedroomsParam) updateFilters({ minBedrooms: parseInt(bedroomsParam) });

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
  }, [searchParams, updateSearchQuery, updateFilters]);

  // Map properties from API to the format expected by the UI
  const properties = useMemo(() => {
    return (results?.properties || []).map(property => ({
      id: property.id,
      title: property.title,
      location: `${property.city || ''}${property.city && property.county ? ', ' : ''}${property.county || ''}`.trim() || 'Location not specified',
      price: typeof property.price === 'number' ? property.price.toLocaleString() : '0',
      image: property.images?.[0]?.url || '/placeholder-property.jpg',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      area: property.areaSize || 0,
      rating: 0, // Default rating if not provided
      type: getDisplayListingType(property.listingType),
      propertyType: property.propertyType || 'PROPERTY',
      longitude: property.longitude || 36.8219, // Default to Nairobi coordinates
      latitude: property.latitude || -1.2921,   // Default to Nairobi coordinates
      features: property.features || [],
      status: property.status || 'UNKNOWN',
      createdAt: property.createdAt || new Date().toISOString()
    }));
  }, [results]);

  // Update map properties when search results change
  useEffect(() => {
    if (properties.length > 0) {
      setMapProperties(properties);
    }
  }, [properties]);

  // Get paginated properties from results
  const paginatedProperties = properties;
  const totalPages = results?.totalPages || 1;

  // Handle map pin selection
  const handleMapPinClick = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    // Find the property and scroll to it in the grid
    const propertyIndex = properties.findIndex(
      (p) => p.id === propertyId
    );
    if (propertyIndex !== -1) {
      const targetPage = Math.floor(propertyIndex / itemsPerPage) + 1;
      setCurrentPage(targetPage);
    }
  };

  // Handle property click
  const handlePropertyClick = useCallback((property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
    
    // Update URL with property ID for deep linking
    const url = new URL(window.location.href);
    url.searchParams.set('propertyId', property.id);
    window.history.pushState({}, '', url.toString());
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Update filters with new page number
    updateFilters({ ...filters, page });
    
    // Update URL with page number
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    window.history.pushState({}, '', url.toString());
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateFilters]);

  // Handle price range filter updates
  const handlePriceRangeChange = useCallback((value: string) => {
    if (!value) {
      updateFilters({ minPrice: undefined, maxPrice: undefined });
    } else {
      const prices = value
        .split("-")
        .map((p) => {
          const num = p.replace(/[^\d]/g, "");
          return num === "" ? undefined : parseInt(num);
        });
      updateFilters({
        minPrice: prices[0],
        maxPrice: prices[1],
      });
    }
  }, [updateFilters]);

  const handlePropertyTypeChange = useCallback((value: string) => {
    updateFilters({ 
      propertyType: value || undefined,
      page: 1 // Reset to first page when filters change
    });
  }, [updateFilters]);

  const handleBedroomsChange = useCallback((value: string) => {
    updateFilters({ 
      minBedrooms: value ? parseInt(value) : undefined,
      page: 1 // Reset to first page when filters change
    });
  }, [updateFilters]);

  // Reset all filters
  const handleResetFilters = () => {
    resetSearch();
    // Reset all filter values to their defaults
    updateFilters({
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: undefined,
      minBedrooms: undefined,
      page: 1
    });
  };

  // Mortgage Calculator State
  const [mortgageData, setMortgageData] = useState({
    propertyPrice: "",
    downPayment: "",
    interestRate: "",
    loanTerm: 15, // Default to 15 years
  });

  const [mortgageResults, setMortgageResults] = useState({
    monthlyPayment: 0,
    principalInterest: 0,
    propertyTax: 0,
    insurance: 0,
    totalLoan: 0,
    totalInterest: 0,
  });

  const calculateMortgage = () => {
    const principal = parseInt(mortgageData.propertyPrice.replace(/,/g, ""));
    const downPayment = parseInt(mortgageData.downPayment.replace(/,/g, ""));
    const loanAmount = principal - downPayment;
    const interestRate = parseFloat(mortgageData.interestRate) / 100;
    const loanTerm = mortgageData.loanTerm;

    if (
      isNaN(principal) ||
      isNaN(downPayment) ||
      isNaN(interestRate) ||
      isNaN(loanTerm)
    ) {
      alert("Please enter valid numbers for all fields.");
      return;
    }

    if (downPayment < 0.2 * principal) {
      alert("Down payment must be at least 20% of the property price.");
      return;
    }

    if (loanAmount <= 0) {
      alert("Loan amount must be positive.");
      return;
    }

    if (interestRate <= 0) {
      alert("Interest rate must be positive.");
      return;
    }

    if (loanTerm <= 0) {
      alert("Loan term must be positive.");
      return;
    }

    const monthlyInterestRate = interestRate / 12;
    const numberOfPayments = loanTerm * 12;

    const monthlyPayment =
      (loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    const totalInterest = monthlyPayment * numberOfPayments - loanAmount;

    // Placeholder for property tax and insurance
    const propertyTax = 0.005 * principal; // 0.5% of principal
    const insurance = 0.001 * principal; // 0.1% of principal

    setMortgageResults({
      monthlyPayment: Math.round(monthlyPayment),
      principalInterest: Math.round(
        monthlyPayment * numberOfPayments - totalInterest
      ),
      propertyTax: Math.round(propertyTax),
      insurance: Math.round(insurance),
      totalLoan: Math.round(loanAmount),
      totalInterest: Math.round(totalInterest),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buy Property</h1>
          <p className="text-muted-foreground text-lg">
            Find your perfect home in Kenya
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          {/* Search Status */}
          {!hasInitialized && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
              <span className="text-gray-800 text-sm">
                Use the search bar or filters to find properties
              </span>
            </div>
          )}

          {isLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-800 text-sm">
                Searching properties...
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {hasInitialized &&
            !isLoading &&
            !error &&
            results &&
            results.properties &&
            results.properties.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 text-sm">
                  Found {results.total} properties matching your search criteria
                </span>
              </div>
            )}

          {hasInitialized &&
            !isLoading &&
            !error &&
            results &&
            results.properties &&
            results.properties.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  No properties found matching your criteria
                </span>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <SearchInput
                  placeholder="Search by location, property name..."
                  initialQuery={searchQuery}
                  onResultsChange={(results) => {
                    // Map will be updated automatically via useEffect
                  }}
                  listingType="SALE"
                  className="w-full"
                />
              </div>
            </div>

            <Select
              value={
                filters.minPrice && filters.maxPrice
                  ? `${filters.minPrice}-${filters.maxPrice}`
                  : ""
              }
              onValueChange={handlePriceRangeChange}
            >
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

            <Select
              value={filters.propertyType || ""}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOUSE">House</SelectItem>
                <SelectItem value="APARTMENT">Apartment</SelectItem>
                <SelectItem value="VILLA">Villa</SelectItem>
                <SelectItem value="TOWNHOUSE">Townhouse</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
                <SelectItem value="DUPLEX">Duplex</SelectItem>
                <SelectItem value="FARMHOUSE">Farmhouse</SelectItem>
                <SelectItem value="PENTHOUSE">Penthouse</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="STUDENT_HOSTEL">Student Hostel</SelectItem>
                <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.minBedrooms?.toString() || ""}
              onValueChange={handleBedroomsChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+ Bedrooms</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
                <SelectItem value="5">5+ Bedrooms</SelectItem>
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

        {/* Main Content - Map and Properties Split */}
        <div className="flex h-[calc(100vh-300px)] min-h-[600px] gap-6 mb-12">
          {/* Map Section - Left Side */}
          <div className="w-1/2 border rounded-lg overflow-hidden">
            <PropertyMap
              className="h-full"
              properties={mapProperties.map((property) => ({
                id: property.id,
                longitude: property.longitude,
                latitude: property.latitude,
                title: property.title,
                price: `KSh ${property.price}`,
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
                const property = mapProperties.find((p) => p.id === propertyId);
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
                    {hasInitialized
                      ? results?.total || 0
                      : properties.length}{" "}
                    properties found
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    in Kenya
                  </span>
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
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
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
                        priceType="sale"
                        image={property.image}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.area}
                        rating={property.rating}
                        isFeatured={property.rating >= 4.8}
                        isLuxury={
                          parseInt(property.price.replace(/,/g, "")) >= 30000000
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
                                <span>{property.bedrooms} baths</span>
                                <span>{property.area} m²</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-primary">
                                  KSh {property.price}
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

        {/* Mortgage Calculator Section */}
        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient-primary mb-4">
                  Mortgage Calculator
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Calculate your monthly mortgage payments and understand the
                  total cost of homeownership in Kenya
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator Inputs */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Property Price (KSh)
                      </label>
                      <Input
                        placeholder="25,000,000"
                        className="text-lg"
                        value={mortgageData.propertyPrice}
                        onChange={(e) =>
                          setMortgageData((prev) => ({
                            ...prev,
                            propertyPrice: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Down Payment (KSh)
                      </label>
                      <Input
                        placeholder="5,000,000"
                        className="text-lg"
                        value={mortgageData.downPayment}
                        onChange={(e) =>
                          setMortgageData((prev) => ({
                            ...prev,
                            downPayment: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Interest Rate (%)
                      </label>
                      <Input
                        placeholder="12.5"
                        className="text-lg"
                        value={mortgageData.interestRate}
                        onChange={(e) =>
                          setMortgageData((prev) => ({
                            ...prev,
                            interestRate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Loan Term (Years)
                      </label>
                      <Select
                        value={mortgageData.loanTerm.toString()}
                        onValueChange={(value) =>
                          setMortgageData((prev) => ({
                            ...prev,
                            loanTerm: parseInt(value),
                          }))
                        }
                      >
                        <SelectTrigger className="text-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 Years</SelectItem>
                          <SelectItem value="20">20 Years</SelectItem>
                          <SelectItem value="25">25 Years</SelectItem>
                          <SelectItem value="30">30 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-lg py-3"
                    onClick={calculateMortgage}
                  >
                    Calculate Mortgage
                  </Button>
                </div>

                {/* Calculator Results */}
                <div className="bg-background/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold text-center mb-6">
                    Your Monthly Payment
                  </h3>

                  {mortgageResults.monthlyPayment > 0 && (
                    <>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">
                          KSh {mortgageResults.monthlyPayment.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">per month</div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Principal & Interest:
                          </span>
                          <span className="font-medium">
                            KSh{" "}
                            {mortgageResults.principalInterest.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Property Tax:
                          </span>
                          <span className="font-medium">
                            KSh {mortgageResults.propertyTax.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Insurance:
                          </span>
                          <span className="font-medium">
                            KSh {mortgageResults.insurance.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Loan Amount:
                          </span>
                          <span className="font-medium">
                            KSh {mortgageResults.totalLoan.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Interest:
                          </span>
                          <span className="font-medium">
                            KSh {mortgageResults.totalInterest.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {mortgageResults.monthlyPayment === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      Enter property details above to calculate your mortgage
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kenyan Market Trends Section */}
        <div className="mb-12">
          <Card className="border-0 bg-gradient-to-r from-muted/30 to-background">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gradient-primary mb-4">
                  Kenyan Real Estate Market Trends
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Stay informed about the latest trends, opportunities, and
                  insights in Kenya's dynamic real estate market
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Market Overview */}
                <Card className="border-0 bg-primary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Market Overview</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Average Price:
                        </span>
                        <span className="font-medium">KSh 18.5M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Price Growth:
                        </span>
                        <span className="font-medium text-success">
                          +8.2% YoY
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Days on Market:
                        </span>
                        <span className="font-medium">45 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Areas */}
                <Card className="border-0 bg-secondary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <h3 className="text-lg font-semibold">Popular Areas</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Westlands:
                        </span>
                        <span className="font-medium text-success">+12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Karen:</span>
                        <span className="font-medium text-success">+9.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runda:</span>
                        <span className="font-medium text-success">+7.3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Investment Insights */}
                <Card className="border-0 bg-warning/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-warning" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        Investment Insights
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ROI Potential:
                        </span>
                        <span className="font-medium text-success">15-25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Rental Yield:
                        </span>
                        <span className="font-medium">6-8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Market Cycle:
                        </span>
                        <span className="font-medium text-success">
                          Growth Phase
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Financing Trends */}
                <Card className="border-0 bg-success/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-success" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        Financing Trends
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Avg. Interest Rate:
                        </span>
                        <span className="font-medium">12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Loan Approval:
                        </span>
                        <span className="font-medium text-success">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Down Payment:
                        </span>
                        <span className="font-medium">20-30%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Government Initiatives */}
                <Card className="border-0 bg-info/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-info" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        Government Support
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Boma Yangu:
                        </span>
                        <span className="font-medium text-success">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Tax Incentives:
                        </span>
                        <span className="font-medium text-success">
                          Available
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Infrastructure:
                        </span>
                        <span className="font-medium text-success">
                          Expanding
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Future Outlook */}
                <Card className="border-0 bg-purple/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple/10 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-purple" />
                      </div>
                      <h3 className="text-lg font-semibold">Future Outlook</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          2024 Growth:
                        </span>
                        <span className="font-medium text-success">
                          +10-15%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          New Developments:
                        </span>
                        <span className="font-medium text-success">+25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Market Confidence:
                        </span>
                        <span className="font-medium text-success">High</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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

export default Buy;
