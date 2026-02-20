import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCcw,
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
  optimizeCloudinaryUrl,
  getPlaceholderImageUrl,
} from "@/utils/imageUtils";

const ITEMS_PER_PAGE = 10;

const Buy = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
    limit: ITEMS_PER_PAGE,
    status: "AVAILABLE",
  });

  // Mortgage Calculator State
  const [mortgageData, setMortgageData] = useState({
    propertyPrice: "",
    downPayment: "",
    interestRate: "",
    loanTerm: 15,
  });

  const [mortgageResults, setMortgageResults] = useState({
    monthlyPayment: 0,
    totalLoan: 0,
    totalInterest: 0,
  });

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

      const rawPrice = Number(property.price) || 0;
      const formattedPrice = rawPrice.toLocaleString();

      return {
        id: property.id,
        title: property.title,
        address: property.address || "",
        city: property.city || "",
        county: property.county || "",
        location:
          [property.city, property.county].filter(Boolean).join(", ") ||
          "Location not specified",
        price: formattedPrice,
        rawPrice,
        images: optimizedImages,
        primaryImage: optimizedImages[0],
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        areaSize: property.areaSize || 0,
        areaUnit: property.areaUnit || "m²",
        rating: property.rating || 0,
        propertyType: property.propertyType || "PROPERTY",
        longitude: property.longitude || 36.8219,
        latitude: property.latitude || -1.2921,
        isFeatured: property.isFeatured || false,
        isLuxury: rawPrice >= 15_000_000,
        isVerified: property.isVerified || false,
        isPaid: property.isPaid || false,
      };
    });
  }, [results]);

  // Handle URL query params from landing page
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

    // Clean URL
    if (search || propertyType || location || priceRange || bedrooms) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, updateSearchQuery, updateFilters]);

  // Quick view handler
  const handleQuickView = useCallback((property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  }, []);

  const handlePropertyClick = useCallback(
    (property: any) => {
      navigate(`/property/${property.id}`);
    },
    [navigate]
  );

  // Mortgage Calculation (Kenyan context ~12-14% rates)
  const calculateMortgage = () => {
    const principal = Number(mortgageData.propertyPrice.replace(/,/g, "")) || 0;
    const downPayment = Number(mortgageData.downPayment.replace(/,/g, "")) || 0;
    const interestRate = Number(mortgageData.interestRate) / 100 || 0;
    const years = mortgageData.loanTerm;

    if (
      principal <= 0 ||
      downPayment < 0.1 * principal ||
      interestRate <= 0 ||
      years <= 0
    ) {
      alert(
        "Please check inputs:\n• Property price > 0\n• Down payment ≥ 10%\n• Valid interest rate & term"
      );
      return;
    }

    const loanAmount = principal - downPayment;
    const monthlyRate = interestRate / 12;
    const totalPayments = years * 12;

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - loanAmount;

    setMortgageResults({
      monthlyPayment: Math.round(monthlyPayment),
      totalLoan: Math.round(loanAmount),
      totalInterest: Math.round(totalInterest),
    });
  };

  const handleResetFilters = () => {
    resetSearch();
    updateFilters({ page: 1 });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buy Property</h1>
          <p className="text-muted-foreground text-lg">
            Discover your ideal home across Kenya
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          {/* Status Messages */}
          {!hasInitialized && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
              Start searching using the bar or filters above
            </div>
          )}

          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50/50 rounded-lg flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Finding properties...</span>
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
                  ? `${results.total || 0} properties found`
                  : "No properties match your criteria"}
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SearchInput
                  placeholder="Search location, estate, or keyword..."
                  initialQuery={searchQuery}
                  listingType="SALE"
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
                  updateFilters({
                    minPrice: undefined,
                    maxPrice: undefined,
                    page: 1,
                  });
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
                <SelectItem value="5000000-15000000">KSh 5M – 15M</SelectItem>
                <SelectItem value="15000000-25000000">KSh 15M – 25M</SelectItem>
                <SelectItem value="25000000-50000000">KSh 25M – 50M</SelectItem>
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
                title="Reset all filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map + Listings */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12 h-[70vh] min-h-[600px]">
          {/* Map Section */}
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
                  sortBy={filters.sortBy || "createdAt"}
                  order={filters.order || "desc"}
                  onSortChange={(value) =>
                    updateFilters({
                      sortBy: value as "createdAt" | "price",
                      order: value === "price" ? "desc" : "asc",
                      page: 1,
                    })
                  }
                  onOrderChange={(value) =>
                    updateFilters({ order: value, page: 1 })
                  }
                />
              </div>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto p-5">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {properties.map((property) => {
                    const propertyData = {
                      id: property.id,
                      title: property.title || "No Title",
                      price:
                        typeof property.price === "string"
                          ? parseFloat(property.price)
                          : property.price || 0,
                      currency: "KSh", // Default currency
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      areaSize: property.areaSize || 0,
                      areaUnit: property.areaUnit || "sqft",
                      images:
                        property.images?.length > 0
                          ? property.images.map((img, index) => ({
                              id: img.id || `img-${index}`,
                              url: img.url,
                              isPrimary: index === 0,
                              order: index,
                            }))
                          : [
                              {
                                id: "placeholder",
                                url: getPlaceholderImageUrl(),
                                isPrimary: true,
                                order: 0,
                              },
                            ],
                      address: property.address || "",
                      propertyType: property.propertyType || "Property",
                      city: property.city,
                      county: property.county,
                    };

                    return (
                      <div
                        key={property.id}
                        onClick={() => handlePropertyClick(property)}
                      >
                        <PropertyCard
                          id={property.id}
                          title={property.title}
                          location={`${property.address || ""} ${
                            property.city || ""
                          } ${property.county || ""}`.trim()}
                          price={property.price}
                          priceType={
                            property.listingType === 'RENT' 
                              ? 'rent' 
                              : property.listingType === 'SHORT_TERM_RENT' 
                                ? 'short_term' 
                                : 'sale'
                          }
                          rawPrice={property.price}
                          images={property.images || []}
                          primaryImage={property.primaryImage || ""}
                          bedrooms={property.bedrooms}
                          bathrooms={property.bathrooms}
                          area={property.areaSize || 0}
                          areaUnit={property.areaUnit || "sqft"}
                          rating={0} // Add appropriate rating or make it optional in the interface
                          isPaid={property.isPaid || false}
                          address={property.address}
                          city={property.city}
                          county={property.county}
                        />
                      </div>
                    );
                  })}
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
                  ))}
                </div>
              )}

              {properties.length === 0 && !isLoading && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No properties found in current view
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mortgage Calculator */}
        <Card className="mb-12">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Mortgage Calculator</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estimate your monthly payments (indicative – current rates
                ~12-14%)
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Property Price (KSh)
                    </label>
                    <Input
                      placeholder="25,000,000"
                      value={mortgageData.propertyPrice}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          propertyPrice: e.target.value.replace(/[^0-9,]/g, ""),
                        }))
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
                        setMortgageData((prev) => ({
                          ...prev,
                          downPayment: e.target.value.replace(/[^0-9,]/g, ""),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Interest Rate (%)
                    </label>
                    <Input
                      placeholder="13.5"
                      value={mortgageData.interestRate}
                      onChange={(e) =>
                        setMortgageData((prev) => ({
                          ...prev,
                          interestRate: e.target.value.replace(/[^0-9.]/g, ""),
                        }))
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
                        setMortgageData((prev) => ({
                          ...prev,
                          loanTerm: Number(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
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
              <div className="bg-muted/50 rounded-xl p-6 flex flex-col">
                {mortgageResults.monthlyPayment > 0 ? (
                  <div className="space-y-6 mt-auto">
                    <div className="text-center pb-6 border-b">
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        KSh {mortgageResults.monthlyPayment.toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">per month</p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span>Loan Amount</span>
                        <span>
                          KSh {mortgageResults.totalLoan.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Interest</span>
                        <span>
                          KSh {mortgageResults.totalInterest.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t font-medium">
                        <span>Total Payable</span>
                        <span>
                          KSh{" "}
                          {(
                            mortgageResults.totalLoan +
                            mortgageResults.totalInterest
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-center py-12">
                    Enter details above to see estimated monthly payments
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

export default Buy;
