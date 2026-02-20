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
import { SortingOptions } from "@/components/properties/SortingOptions";

import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearch, SearchFilters } from "@/hooks/useSearch";
import {
  getDisplayListingType,
  normalizeListingType,
} from "@/utils/propertyUtils";
import {
  optimizeCloudinaryUrl,
  getPlaceholderImageUrl,
} from "@/utils/imageUtils";

const ITEMS_PER_PAGE = 10;

const Rent = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const [searchParams] = useSearchParams();

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
    listingType: "RENT",
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: "AVAILABLE",
  });

  // Initial search trigger
  useEffect(() => {
    updateFilters({});
  }, []);

  // Handle URL query parameters from landing page
  useEffect(() => {
    const search = searchParams.get("search");
    const propertyType = searchParams.get("propertyType");
    const location = searchParams.get("location");
    const priceRange = searchParams.get("priceRange");
    const bedrooms = searchParams.get("bedrooms");

    if (search) updateSearchQuery(search);
    if (propertyType) updateFilters({ propertyType });
    if (location) updateFilters({ city: location });

    if (priceRange) {
      const [min, max] = priceRange
        .split("-")
        .map((p) =>
          p.replace(/[^\d]/g, "")
            ? parseInt(p.replace(/[^\d]/g, ""))
            : undefined
        );
      updateFilters({ minPrice: min, maxPrice: max });
    }

    if (bedrooms) updateFilters({ minBedrooms: parseInt(bedrooms) });

    // Clean URL after applying parameters
    if (search || propertyType || location || priceRange || bedrooms) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, updateSearchQuery, updateFilters]);

  // Transform API results into UI-friendly format
  const properties = useMemo(() => {
    return (results?.properties || []).map((property) => {
      const optimizedImages =
        property.images?.length > 0
          ? property.images
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((img) =>
                optimizeCloudinaryUrl(img.url, {
                  width: 400,
                  height: 300,
                  crop: "fill",
                  quality: "auto",
                  format: "auto",
                })
              )
          : [getPlaceholderImageUrl()];

      return {
        id: property.id,
        title: property.title,
        address: property.address || "",
        city: property.city || "",
        county: property.county || "",
        listingType: property.listingType || "SALE",
        location:
          [property.city, property.county].filter(Boolean).join(", ") ||
          "Location not specified",
        price:
          typeof property.price === "number"
            ? property.price.toLocaleString()
            : "0",
        rawPrice: Number(property.price) || 0,
        images: optimizedImages,
        primaryImage: optimizedImages[0],
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        areaSize: property.areaSize || 0,
        area: property.areaSize || 0,
        areaUnit: property.areaUnit || "m²",
        rating: property.rating || 0,
        propertyType: property.propertyType || "PROPERTY",
        longitude: property.longitude || 36.8219,
        latitude: property.latitude || -1.2921,
        features: property.features || [],
        status: property.status || "UNKNOWN",
        isFeatured: property.isFeatured || false,
        isLuxury: property.isLuxury || property.price >= 30000000 || false,
        isVerified: property.isVerified || false,
        isPaid: property.isPaid || false,
        agent: property.agent || null,
      };
    });
  }, [results]);

  // Mortgage Calculator State
  const [mortgageData, setMortgageData] = useState({
    propertyPrice: "",
    downPayment: "",
    interestRate: "",
    loanTerm: 15,
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
    const principal = Number(mortgageData.propertyPrice.replace(/,/g, ""));
    const downPayment = Number(mortgageData.downPayment.replace(/,/g, ""));
    const loanAmount = principal - downPayment;
    const interestRate = Number(mortgageData.interestRate) / 100;
    const loanTerm = mortgageData.loanTerm;

    if (
      isNaN(principal) ||
      isNaN(downPayment) ||
      isNaN(interestRate) ||
      isNaN(loanTerm) ||
      downPayment < 0.2 * principal ||
      loanAmount <= 0 ||
      interestRate <= 0 ||
      loanTerm <= 0
    ) {
      alert("Please enter valid values. Down payment must be at least 20%.");
      return;
    }

    const monthlyRate = interestRate / 12;
    const payments = loanTerm * 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * (1 + monthlyRate) ** payments) /
      ((1 + monthlyRate) ** payments - 1);

    const totalInterest = monthlyPayment * payments - loanAmount;

    setMortgageResults({
      monthlyPayment: Math.round(monthlyPayment),
      principalInterest: Math.round(monthlyPayment * payments - totalInterest),
      propertyTax: Math.round(0.005 * principal),
      insurance: Math.round(0.001 * principal),
      totalLoan: Math.round(loanAmount),
      totalInterest: Math.round(totalInterest),
    });
  };

  const handleResetFilters = () => {
    resetSearch();
    updateFilters({ page: 1 });
  };

  const navigate = useNavigate();

  const handlePropertyClick = useCallback(
    (property: any) => {
      navigate(`/property/${property.id}`);
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rent Property</h1>
          <p className="text-muted-foreground text-lg">
            Find your perfect home in Kenya
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          {/* Status Messages */}
          {!hasInitialized && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
              Use the search bar or filters to find properties
            </div>
          )}

          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Searching properties...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {hasInitialized && !isLoading && !error && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
                results?.properties?.length > 0
                  ? "bg-green-50 text-green-800"
                  : "bg-yellow-50 text-yellow-800"
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              <span>
                {results?.properties?.length > 0
                  ? `Found ${results.total || 0} properties`
                  : "No properties found matching your criteria"}
              </span>
            </div>
          )}

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SearchInput
                  placeholder="Search by location, property name..."
                  initialQuery={searchQuery}
                  listingType="RENT"
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={
                filters.minPrice && filters.maxPrice
                  ? `${filters.minPrice}-${filters.maxPrice}`
                  : ""
              }
              onValueChange={(value) => {
                if (!value) {
                  updateFilters({ minPrice: undefined, maxPrice: undefined });
                } else {
                  const [min, max] = value
                    .split("-")
                    .map((v) => (v ? Number(v) : undefined));
                  updateFilters({ minPrice: min, maxPrice: max, page: 1 });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5000000-15000000">KSh 5M - 15M</SelectItem>
                <SelectItem value="15000000-25000000">KSh 15M - 25M</SelectItem>
                <SelectItem value="25000000-50000000">KSh 25M - 50M</SelectItem>
                <SelectItem value="50000000-">KSh 50M+</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.propertyType || ""}
              onValueChange={(value) =>
                updateFilters({ propertyType: value || undefined, page: 1 })
              }
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
              </SelectContent>
            </Select>

            <Select
              value={filters.minBedrooms?.toString() || ""}
              onValueChange={(v) =>
                updateFilters({
                  minBedrooms: v ? Number(v) : undefined,
                  page: 1,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetFilters}
                title="Reset filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map + Listings Layout */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12 h-[70vh] min-h-[600px]">
          {/* Map */}
          <div className="border rounded-xl overflow-hidden bg-muted/30">
            <PropertyMap
              properties={properties.map((p) => ({
                id: p.id,
                title: p.title,
                price: p.rawPrice,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                areaSize: p.areaSize,
                areaUnit: p.areaUnit,
                images: p.images,
                longitude: Number(p.longitude),
                latitude: Number(p.latitude),
                propertyType: p.propertyType,
                listingType: p.listingType,
                address: p.address,
                city: p.city,
              }))}
              onPinClick={setSelectedPropertyId}
              selectedPropertyId={selectedPropertyId}
            />
          </div>

          {/* Listings */}
          <div className="flex flex-col bg-card border rounded-xl overflow-hidden">
            {/* Controls */}
            <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {results?.total || properties.length} properties
                </Badge>
                <span className="text-sm text-muted-foreground">in Kenya</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-muted rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <SortingOptions
                  sortBy={sortBy}
                  order={sortOrder}
                  onSortChange={(value) => {
                    setSortBy(value);
                    updateFilters({
                      sortBy: value as "createdAt" | "price",
                      order: value === "price" ? sortOrder : "desc",
                      page: 1,
                    });
                  }}
                  onOrderChange={(value) => {
                    setSortOrder(value);
                    updateFilters({
                      order: value,
                      page: 1,
                    });
                  }}
                />
              </div>
            </div>

            {/* Properties List/Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-4">
                  {properties.map((property) => (
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
                        priceType={
                          property.listingType === 'RENT' 
                            ? 'rent' 
                            : property.listingType === 'SHORT_TERM_RENT' 
                              ? 'short_term' 
                              : 'sale'
                        }
                        images={
                          property.images?.length > 0
                            ? property.images.map((img) =>
                                typeof img === "string"
                                  ? img
                                  : img?.url || "/placeholder-property.jpg"
                              )
                            : ["/placeholder-property.jpg"]
                        }
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.areaSize}
                        rating={property.rating || 0}
                        isFeatured={property.rating >= 4.8}
                        isLuxury={parseInt(property.price) >= 150000}
                        isVerified={property.isVerified || false}
                        isPaid={property.isPaid || false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <Card
                      key={property.id}
                      className={`hover:shadow-md transition-all cursor-pointer ${
                        selectedPropertyId === property.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : ""
                      }`}
                      onClick={() => handlePropertyClick(property)}
                    >
                      <Card
                        key={property.id}
                        className={`hover:shadow-md transition-all cursor-pointer ${
                          selectedPropertyId === property.id
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                        onClick={() => handlePropertyClick(property)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-5">
                            <img
                              src={property.primaryImage}
                              alt={property.title}
                              className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                              onError={(e) =>
                                (e.currentTarget.src =
                                  "/placeholder-property.jpg")
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 truncate">
                                {property.title}
                              </h3>
                              <p className="text-muted-foreground text-sm mb-2">
                                {property.location}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
                                <span>{property.bedrooms} beds</span>
                                <span>{property.bathrooms} baths</span>
                                <span>
                                  {property.areaSize.toLocaleString()}{" "}
                                  {property.areaUnit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <span className="font-bold text-xl text-primary">
                                  KSh {property.price}
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {property.isLuxury && <Badge>Luxury</Badge>}
                                  {property.isVerified && (
                                    <Badge className="bg-green-600">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mortgage Calculator */}
        <Card className="mb-12 border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Mortgage Calculator</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estimate your monthly payments for buying property in Kenya
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Property Price (KSh)
                    </label>
                    <Input
                      placeholder="25,000,000"
                      value={mortgageData.propertyPrice}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          propertyPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Down Payment (KSh)
                    </label>
                    <Input
                      placeholder="5,000,000"
                      value={mortgageData.downPayment}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          downPayment: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Interest Rate (%)
                    </label>
                    <Input
                      placeholder="12.5"
                      value={mortgageData.interestRate}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          interestRate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loan Term (Years)
                    </label>
                    <Select
                      value={mortgageData.loanTerm.toString()}
                      onValueChange={(v) =>
                        setMortgageData({
                          ...mortgageData,
                          loanTerm: Number(v),
                        })
                      }
                    >
                      <SelectTrigger>
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
                  size="lg"
                  className="w-full"
                  onClick={calculateMortgage}
                >
                  Calculate Payment
                </Button>
              </div>

              {/* Results */}
              <div className="bg-muted/40 rounded-xl p-6">
                {mortgageResults.monthlyPayment > 0 ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-1">
                        KSh {mortgageResults.monthlyPayment.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">Monthly Payment</p>
                    </div>

                    <div className="space-y-3 pt-6 border-t">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Principal & Interest
                        </span>
                        <span>
                          KSh{" "}
                          {mortgageResults.principalInterest.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Interest
                        </span>
                        <span>
                          KSh {mortgageResults.totalInterest.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total Cost</span>
                        <span>
                          KSh{" "}
                          {(
                            mortgageResults.principalInterest +
                            mortgageResults.totalInterest
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Fill in the details to see your estimated payment
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />

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
