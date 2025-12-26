import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  Eye,
  MessageCircle,
  Trash2,
  Filter,
  SortAsc,
  Home,
  Building,
  Star,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Favorites = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "Modern 3-Bedroom Apartment",
      type: "Apartment",
      location: "Westlands, Nairobi",
      price: 25000000,
      priceType: "sale",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "/api/placeholder/300/200",
      agent: {
        name: "Sarah Kamau",
        avatar: "/api/placeholder/40/40",
        rating: 4.8,
      },
      addedDate: "2024-01-15",
      description:
        "Beautiful modern apartment with stunning city views, fully furnished and ready to move in.",
    },
    {
      id: 2,
      title: "Luxury Villa with Pool",
      type: "Villa",
      location: "Karen, Nairobi",
      price: 45000000,
      priceType: "sale",
      bedrooms: 4,
      bathrooms: 3,
      area: 250,
      image: "/api/placeholder/300/200",
      agent: {
        name: "John Ochieng",
        avatar: "/api/placeholder/40/40",
        rating: 4.9,
      },
      addedDate: "2024-01-10",
      description:
        "Spacious luxury villa featuring a private pool, garden, and modern amenities in an exclusive neighborhood.",
    },
    {
      id: 3,
      title: "Studio Apartment",
      type: "Studio",
      location: "Kilimani, Nairobi",
      price: 8500000,
      priceType: "sale",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      image: "/api/placeholder/300/200",
      agent: {
        name: "Grace Wanjiku",
        avatar: "/api/placeholder/40/40",
        rating: 4.7,
      },
      addedDate: "2024-01-05",
      description:
        "Cozy studio apartment perfect for young professionals, located in a vibrant neighborhood.",
    },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/signin");
      return;
    }

    // TODO: Fetch user favorites from API
  }, [isAuthenticated, navigate]);

  const handleRemoveFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    toast({
      title: "Removed from favorites",
      description: "Property has been removed from your favorites.",
      variant: "default",
    });
  };

  const handleViewProperty = (id: number) => {
    navigate(`/property/${id}`);
  };

  const handleContactAgent = (agentName: string) => {
    toast({
      title: "Contact Agent",
      description: `Redirecting to chat with ${agentName}...`,
      variant: "default",
    });
    // TODO: Navigate to chat or contact form
  };

  const filteredFavorites = favorites.filter((favorite) => {
    const matchesSearch =
      favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" ||
      favorite.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "recent":
        return (
          new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        );
      case "oldest":
        return (
          new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime()
        );
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `KES ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `KES ${(price / 1000).toFixed(0)}K`;
    }
    return `KES ${price.toLocaleString()}`;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-4xl font-bold">My Favorites</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Your saved properties and dream homes
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {sortedFavorites.length} favorites
              </Badge>
              <span className="text-muted-foreground">found</span>
            </div>

            {sortedFavorites.length > 0 && (
              <Button variant="outline" onClick={() => navigate("/buy")}>
                <Home className="h-4 w-4 mr-2" />
                Browse More Properties
              </Button>
            )}
          </div>

          {/* Favorites Grid */}
          <AnimatePresence>
            {sortedFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start exploring properties and save your favorites to see them
                  here
                </p>
                <Button onClick={() => navigate("/buy")}>
                  <Search className="h-4 w-4 mr-2" />
                  Explore Properties
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFavorites.map((favorite, index) => (
                  <motion.div
                    key={favorite.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 group">
                      <div className="relative">
                        <img
                          src={favorite.image}
                          alt={favorite.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant="secondary"
                            className="bg-white/90 text-foreground"
                          >
                            {favorite.priceType === "sale"
                              ? "For Sale"
                              : "For Rent"}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                            {favorite.title}
                          </h3>
                          <div className="flex items-center space-x-1 text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">{favorite.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(favorite.price)}
                          </span>
                          <Badge variant="outline">{favorite.type}</Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {favorite.bedrooms}
                          </span>
                          <span className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {favorite.bathrooms}
                          </span>
                          <span className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            {favorite.area}m²
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={favorite.agent.avatar}
                              alt={favorite.agent.name}
                            />
                            <AvatarFallback className="text-xs">
                              {favorite.agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {favorite.agent.name}
                            </p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">
                                {favorite.agent.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewProperty(favorite.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleContactAgent(favorite.agent.name)
                            }
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                        </div>

                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          Added{" "}
                          {new Date(favorite.addedDate).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
