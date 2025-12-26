import { useState } from "react";
import {
  Search,
  MapPin,
  Home,
  Building2,
  Filter,
  RotateCcw,
  DollarSign,
  Bed,
  Bath,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-kenya-real-estate.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [activeTab, setActiveTab] = useState("buy");

  const navigate = useNavigate();

  const handleSearch = () => {
    // Build query parameters based on active tab and filters
    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.append("search", searchQuery);
    if (propertyType) queryParams.append("propertyType", propertyType);
    if (location) queryParams.append("location", location);
    if (priceRange) queryParams.append("priceRange", priceRange);
    if (bedrooms) queryParams.append("bedrooms", bedrooms);
    if (bathrooms) queryParams.append("bathrooms", bathrooms);
    if (area) queryParams.append("area", area);

    // Route to appropriate page based on active tab
    const queryString = queryParams.toString();
    const url = `/${activeTab}${queryString ? `?${queryString}` : ""}`;
    navigate(url);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPropertyType("");
    setLocation("");
    setPriceRange("");
    setBedrooms("");
    setBathrooms("");
    setArea("");
  };

  return (
    <section className="relative min-h-[80vh] flex flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 hero-gradient opacity-90" />

      {/* Main Content Container - Centered */}
      <div className="relative z-10 flex-1 flex items-center justify-center md:mt-20 lg:mt-44 mt-14">
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Find Your Perfect
              <span className="block text-gradient-luxury">
                Space That Suits You
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Discover exceptional properties across Kenya with KejaYangu. From
              Nairobi penthouses to Mombasa beachfront homes.
            </p>
          </div>
        </div>
      </div>

      {/* Search Widget - Below the centered content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-8">
        <div className="animate-slide-up bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[var(--shadow-elegant)] max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="buy" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="rent" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Rent
              </TabsTrigger>
              <TabsTrigger value="sell" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-0">
              <SearchForm
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                location={location}
                setLocation={setLocation}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                area={area}
                setArea={setArea}
                onSearch={handleSearch}
                onReset={handleResetFilters}
                priceType="sale"
              />
            </TabsContent>

            <TabsContent value="rent" className="space-y-0">
              <SearchForm
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                location={location}
                setLocation={setLocation}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                area={area}
                setArea={setArea}
                onSearch={handleSearch}
                onReset={handleResetFilters}
                priceType="rent"
              />
            </TabsContent>

            <TabsContent value="sell" className="space-y-0">
              <SearchForm
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                propertyType={propertyType}
                setPropertyType={setPropertyType}
                location={location}
                setLocation={setLocation}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                bathrooms={bathrooms}
                setBathrooms={setBathrooms}
                area={area}
                setArea={setArea}
                onSearch={handleSearch}
                onReset={handleResetFilters}
                priceType="sale"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Stats - Below the search widget */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: "Properties", value: "10,000+" },
            { label: "Cities", value: "50+" },
            { label: "Happy Clients", value: "25,000+" },
            { label: "Expert Agents", value: "500+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface SearchFormProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  propertyType: string;
  setPropertyType: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  priceRange: string;
  setPriceRange: (value: string) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  bathrooms: string;
  setBathrooms: (value: string) => void;
  area: string;
  setArea: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  priceType: "sale" | "rent";
}

const SearchForm = ({
  searchQuery,
  setSearchQuery,
  propertyType,
  setPropertyType,
  location,
  setLocation,
  priceRange,
  setPriceRange,
  bedrooms,
  setBedrooms,
  bathrooms,
  setBathrooms,
  area,
  setArea,
  onSearch,
  onReset,
  priceType,
}: SearchFormProps) => {
  const getPriceOptions = () => {
    if (priceType === "rent") {
      return [
        { value: "20k-50k", label: "KSh 20K - 50K/month" },
        { value: "50k-80k", label: "KSh 50K - 80K/month" },
        { value: "80k-120k", label: "KSh 80K - 120K/month" },
        { value: "120k+", label: "KSh 120K+/month" },
      ];
    } else {
      return [
        { value: "5m-15m", label: "KSh 5M - 15M" },
        { value: "15m-25m", label: "KSh 15M - 25M" },
        { value: "25m-50m", label: "KSh 25M - 50M" },
        { value: "50m+", label: "KSh 50M+" },
      ];
    }
  };

  return (
    <div className="space-y-4">
      {/* First Row - Search and Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by city, neighborhood, or property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 text-lg pl-10"
            />
          </div>
        </div>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="duplex">Duplex</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="student-hostel">Student Hostel</SelectItem>
            <SelectItem value="industrial">Industrial</SelectItem>
            <SelectItem value="beach-house">Beach House</SelectItem>
            <SelectItem value="serviced">Serviced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nairobi">Nairobi</SelectItem>
            <SelectItem value="mombasa">Mombasa</SelectItem>
            <SelectItem value="kisumu">Kisumu</SelectItem>
            <SelectItem value="nakuru">Nakuru</SelectItem>
            <SelectItem value="eldoret">Eldoret</SelectItem>
            <SelectItem value="malindi">Malindi</SelectItem>
            <SelectItem value="diani">Diani</SelectItem>
            <SelectItem value="naivasha">Naivasha</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            {getPriceOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Second Row - Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="h-12">
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

        <Select value={bathrooms} onValueChange={setBathrooms}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Bathrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+ Bathrooms</SelectItem>
            <SelectItem value="2">2+ Bathrooms</SelectItem>
            <SelectItem value="3">3+ Bathrooms</SelectItem>
            <SelectItem value="4">4+ Bathrooms</SelectItem>
            <SelectItem value="5">5+ Bathrooms</SelectItem>
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Area (m²)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50">50+ m²</SelectItem>
            <SelectItem value="100">100+ m²</SelectItem>
            <SelectItem value="200">200+ m²</SelectItem>
            <SelectItem value="300">300+ m²</SelectItem>
            <SelectItem value="500">500+ m²</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            className="h-12 bg-primary hover:bg-primary/90 flex-1"
            onClick={onSearch}
          >
            <Search className="h-5 w-5 mr-2" />
            Search Properties
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="h-12 px-3"
            title="Reset all filters"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
