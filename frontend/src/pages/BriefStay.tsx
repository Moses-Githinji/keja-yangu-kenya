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
  Calendar,
  Users,
  Wifi,
  Car,
  Waves,
  ChefHat,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortingOptions } from "@/components/properties/SortingOptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearch, SearchFilters } from "@/hooks/useSearch";
import {
  optimizeCloudinaryUrl,
  getPlaceholderImageUrl,
} from "@/utils/imageUtils";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

const BriefStay = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Date range state
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);

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
    listingType: "SHORT_TERM_RENT",
    page: 1,
    limit: ITEMS_PER_PAGE,
    status: "AVAILABLE",
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
        pricePerNight: rawPrice, // Assuming price is per night
        images: optimizedImages,
        primaryImage: optimizedImages[0],
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        areaSize: property.areaSize || 0,
        areaUnit: property.areaUnit || "m²",
        rating: property.rating || 0,
        reviewCount: property.reviewCount || 0,
        propertyType: property.propertyType || "PROPERTY",
        longitude: property.longitude || 36.8219,
        latitude: property.latitude || -1.2921,
        features: property.features || [],
        amenities: property.amenities || [],
        isFeatured: property.isFeatured || false,
        isVerified: property.isVerified || false,
        isPaid: property.isPaid || false,
        host: property.host || null,
        minStay: property.minStay || 1,
        maxStay: property.maxStay || 30,
      };
    });
  }, [results]);

  // Handle URL query params
  useEffect(() => {
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests");

    if (search) updateSearchQuery(search);
    if (location) updateFilters({ city: location });
    if (checkInParam) setCheckIn(new Date(checkInParam));
    if (checkOutParam) setCheckOut(new Date(checkOutParam));
    if (guestsParam) setGuests(parseInt(guestsParam));

    // Clean URL
    if (search || location || checkInParam || checkOutParam || guestsParam) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, updateSearchQuery, updateFilters]);

  const handlePropertyClick = useCallback(
    (property: any) => {
      navigate(`/property/${property.id}`);
    },
    [navigate]
  );

  const handleResetFilters = () => {
    resetSearch();
    updateFilters({ page: 1 });
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests(2);
  };

  // Calculate total nights
  const totalNights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Brief Stay</h1>
          <p className="text-muted-foreground text-lg">
            Find perfect short-term accommodation across Kenya
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          {/* Status Messages */}
          {!hasInitialized && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
              Start searching for your perfect stay
            </div>
          )}

          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50/50 rounded-lg flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Finding available stays...</span>
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
                  ? `${results.total || 0} stays available`
                  : "No stays match your criteria"}
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SearchInput
                  placeholder="Search destinations, properties..."
                  initialQuery={searchQuery}
                  listingType="SHORT_TERM_RENT"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Check-in Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${
                    !checkIn && "text-muted-foreground"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "MMM dd") : "Check-in"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Check-out Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`justify-start text-left font-normal ${
                    !checkOut && "text-muted-foreground"
                  }`}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "MMM dd") : "Check-out"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => !checkIn || date <= checkIn}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Guests */}
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4 Guests</SelectItem>
                <SelectItem value="5">5+ Guests</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Filters
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

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              <Wifi className="h-3 w-3 mr-1" />
              WiFi
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              <Car className="h-3 w-3 mr-1" />
              Parking
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              <Waves className="h-3 w-3 mr-1" />
              Pool
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            >
              <ChefHat className="h-3 w-3 mr-1" />
              Kitchen
            </Badge>
          </div>
        </div>

        {/* Map + Listings */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12 h-[70vh] min-h-[600px]">
          {/* Map Section */}
          <div className="border rounded-xl overflow-hidden bg-muted/30">
            <PropertyMap
              properties={properties.map((p) => {
                console.log(`Mapping property ${p.id} to map:`, { lat: p.latitude, lng: p.longitude });
                return {
                  id: p.id,
                  title: p.title,
                  price: p.rawPrice,
                  bedrooms: p.bedrooms,
                  bathrooms: p.bathrooms,
                  areaSize: p.areaSize,
                  areaUnit: p.areaUnit,
                  images: p.images,
                  longitude: Number(p.longitude) || 36.8219,
                  latitude: Number(p.latitude) || -1.2921,
                };
              })}
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
                  {results?.total || properties.length} stays
                </Badge>
                <span className="text-sm text-muted-foreground">available</span>
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
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyClick(property)}
                    >
                      <PropertyCard
                        id={property.id}
                        title={property.title}
                        location={property.location}
                        price={property.price}
                        priceType="short_term"
                        rawPrice={property.rawPrice.toString()}
                        images={property.images}
                        primaryImage={property.primaryImage}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.areaSize}
                        areaUnit={property.areaUnit}
                        rating={property.rating}
                        isFeatured={property.isFeatured}
                        isVerified={property.isVerified}
                        isPaid={property.isPaid}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => handlePropertyClick(property)}
                    >
                      <PropertyCard
                        id={property.id}
                        title={property.title}
                        location={property.location}
                        price={property.price}
                        priceType="short_term"
                        rawPrice={property.rawPrice.toString()}
                        images={property.images}
                        primaryImage={property.primaryImage}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.areaSize}
                        areaUnit={property.areaUnit}
                        rating={property.rating}
                        isFeatured={property.isFeatured}
                        isVerified={property.isVerified}
                        isPaid={property.isPaid}
                      />
                    </div>
                  ))}
                </div>
              )}

              {properties.length === 0 && !isLoading && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No stays found in current view
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Calculator */}
        <Card className="mb-12">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Trip Calculator</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estimate costs for your Kenyan getaway
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
              {/* Inputs */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Check-in Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !checkIn && "text-muted-foreground"
                          }`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Check-out Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !checkOut && "text-muted-foreground"
                          }`}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => !checkIn || date <= checkIn}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Number of Guests
                    </label>
                    <Select
                      value={guests.toString()}
                      onValueChange={(value) => setGuests(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                        <SelectItem value="5">5+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Average Nightly Rate (KSh)
                    </label>
                    <Input placeholder="15,000" value="15,000" readOnly />
                  </div>
                </div>

                <Button size="lg" className="w-full">
                  Calculate Trip Cost
                </Button>
              </div>

              {/* Results */}
              <div className="bg-muted/50 rounded-xl p-6 flex flex-col">
                {totalNights > 0 ? (
                  <div className="space-y-6 mt-auto">
                    <div className="text-center pb-6 border-b">
                      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                        KSh {(15000 * totalNights).toLocaleString()}
                      </div>
                      <p className="text-muted-foreground">
                        Total for {totalNights} nights
                      </p>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span>Accommodation ({totalNights} nights)</span>
                        <span>
                          KSh {(15000 * totalNights).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span>KSh 2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service fee</span>
                        <span>
                          KSh{" "}
                          {Math.round(
                            15000 * totalNights * 0.03
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t font-medium">
                        <span>Total</span>
                        <span>
                          KSh{" "}
                          {(
                            15000 * totalNights +
                            2000 +
                            Math.round(15000 * totalNights * 0.03)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-center py-12">
                    Select your dates to see estimated costs
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

export default BriefStay;
