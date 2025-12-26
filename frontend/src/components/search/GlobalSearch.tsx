import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Home,
  Building,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSearch } from "@/hooks/useSearch";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchSuggestion {
  id: string;
  type: "property" | "location" | "agent";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    performSearch,
    results,
    isLoading: searchLoading,
  } = useSearch({
    listingType: "SALE", // Default to sale, can be changed
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(recent.slice(0, 5));
  }, []);

  // Load trending searches (mock data for now)
  useEffect(() => {
    setTrendingSearches([
      "Nairobi apartments",
      "Karen houses",
      "Westlands commercial",
      "Mombasa beachfront",
      "Kiambu land",
    ]);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search input changes
  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (value.trim().length > 2) {
      // Generate suggestions based on query
      generateSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // Generate search suggestions
  const generateSuggestions = (searchQuery: string) => {
    const query = searchQuery.toLowerCase();

    const newSuggestions: SearchSuggestion[] = [];

    // Property type suggestions
    if (query.includes("house") || query.includes("home")) {
      newSuggestions.push({
        id: "house",
        type: "property",
        title: "Houses",
        subtitle: "Search for houses",
        icon: <Home className="h-4 w-4" />,
        action: () => navigate(`/buy?propertyType=HOUSE&q=${searchQuery}`),
      });
    }

    if (query.includes("apartment") || query.includes("flat")) {
      newSuggestions.push({
        id: "apartment",
        type: "property",
        title: "Apartments",
        subtitle: "Search for apartments",
        icon: <Building className="h-4 w-4" />,
        action: () => navigate(`/buy?propertyType=APARTMENT&q=${searchQuery}`),
      });
    }

    // Location suggestions
    if (
      query.includes("nairobi") ||
      query.includes("westlands") ||
      query.includes("karen")
    ) {
      newSuggestions.push({
        id: "nairobi",
        type: "location",
        title: "Nairobi",
        subtitle: "Properties in Nairobi",
        icon: <MapPin className="h-4 w-4" />,
        action: () => navigate(`/buy?city=Nairobi&q=${searchQuery}`),
      });
    }

    if (
      query.includes("mombasa") ||
      query.includes("diani") ||
      query.includes("nyali")
    ) {
      newSuggestions.push({
        id: "mombasa",
        type: "location",
        title: "Mombasa",
        subtitle: "Properties in Mombasa",
        icon: <MapPin className="h-4 w-4" />,
        action: () => navigate(`/buy?city=Mombasa&q=${searchQuery}`),
      });
    }

    // Generic search suggestion
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        id: "generic",
        type: "property",
        title: `Search for "${searchQuery}"`,
        subtitle: "Search all properties",
        icon: <Search className="h-4 w-4" />,
        action: () => navigate(`/buy?q=${searchQuery}`),
      });
    }

    setSuggestions(newSuggestions);
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;

    if (finalQuery.trim()) {
      // Save to recent searches
      const updated = [
        finalQuery,
        ...recentSearches.filter((s) => s !== finalQuery),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));

      // Navigate to search results
      navigate(`/buy?q=${encodeURIComponent(finalQuery)}`);
      onClose();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    suggestion.action();
    onClose();
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    handleSearch(search);
  };

  // Handle trending search click
  const handleTrendingSearchClick = (search: string) => {
    handleSearch(search);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl border-0">
            <CardContent className="p-0">
              {/* Search Input */}
              <div className="relative p-4 border-b">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Search properties, locations, agents..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-12 h-12 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Content */}
              <div className="max-h-96 overflow-y-auto">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Suggestions
                    </h3>
                    <div className="space-y-2">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="text-muted-foreground">
                            {suggestion.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.subtitle}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Searches
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1">{search}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                {/* Positioning the trending searches to the center of the page */}
                <div className="p-4 flex justify-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleTrendingSearchClick(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t bg-muted/30">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        navigate("/buy");
                        onClose();
                      }}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        navigate("/agents");
                        onClose();
                      }}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Find Agents
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
