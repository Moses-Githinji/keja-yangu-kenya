import { useState } from "react";
import { Search, MapPin, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import heroImage from "@/assets/hero-kenya-real-estate.jpg";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 hero-gradient opacity-90" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 text-center">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Find Your Perfect
            <span className="block text-gradient-luxury">Space That Suits You</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Discover exceptional properties across Kenya with KejaYangu. 
            From Nairobi penthouses to Mombasa beachfront homes.
          </p>
        </div>

        {/* Search Widget */}
        <div className="animate-slide-up bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-[var(--shadow-elegant)] max-w-5xl mx-auto">
          <Tabs defaultValue="buy" className="w-full">
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
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { label: "Properties", value: "10,000+" },
            { label: "Cities", value: "50+" },
            { label: "Happy Clients", value: "25,000+" },
            { label: "Expert Agents", value: "500+" }
          ].map((stat, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
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
}

const SearchForm = ({ searchQuery, setSearchQuery, propertyType, setPropertyType, location, setLocation }: SearchFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-2">
        <Input
          placeholder="Search by city, neighborhood, or property name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 text-lg"
        />
      </div>
      
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Property Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apartment">Apartment</SelectItem>
          <SelectItem value="house">House</SelectItem>
          <SelectItem value="villa">Villa</SelectItem>
          <SelectItem value="condo">Condo</SelectItem>
          <SelectItem value="land">Land</SelectItem>
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
        </SelectContent>
      </Select>

      <Button className="h-12 col-span-full md:col-span-4 mt-4 bg-primary hover:bg-primary-glow animate-pulse-glow">
        <Search className="h-5 w-5 mr-2" />
        Search Properties
      </Button>
    </div>
  );
};

export default HeroSection;