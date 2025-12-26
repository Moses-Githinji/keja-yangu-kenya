import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch, SearchFilters } from "@/hooks/useSearch";

interface SearchInputProps {
  placeholder?: string;
  initialQuery?: string;
  initialFilters?: SearchFilters;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultsChange?: (results: any[]) => void;
  className?: string;
  showFilters?: boolean;
  listingType?: "SALE" | "RENT";
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search properties, locations, or keywords...",
  initialQuery = "",
  initialFilters = {},
  onSearch,
  onResultsChange,
  className = "",
  showFilters = true,
  listingType = "SALE",
}) => {
  const [localQuery, setLocalQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    debouncedQuery,
    filters,
    results,
    isLoading,
    error,
    updateSearchQuery,
    updateFilters,
    performSearch,
    resetSearch,
    totalResults,
  } = useSearch({
    ...initialFilters,
    listingType,
  });

  // Countdown timer for search submission
  useEffect(() => {
    if (localQuery && localQuery !== debouncedQuery) {
      setCountdown(10);

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            updateSearchQuery(localQuery);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(10);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [localQuery, debouncedQuery, updateSearchQuery]);

  // Notify parent of results change
  useEffect(() => {
    if (onResultsChange && results) {
      onResultsChange(results.properties);
    }
  }, [results, onResultsChange]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);

    if (!value) {
      resetSearch();
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  // Handle immediate search (bypass debouncing)
  const handleImmediateSearch = () => {
    updateSearchQuery(localQuery);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleImmediateSearch();
    }
  };

  // Clear search
  const handleClear = () => {
    setLocalQuery("");
    resetSearch();
    setShowSuggestions(false);
    setCountdown(10);
    inputRef.current?.focus();
  };

  // Get search suggestions (mock data for now)
  const getSuggestions = () => {
    if (!localQuery) return [];

    const mockSuggestions = [
      { type: "location", text: `${localQuery}, Nairobi`, icon: "📍" },
      { type: "property", text: `${localQuery} apartments`, icon: "🏢" },
      { type: "feature", text: `${localQuery} properties`, icon: "🏠" },
    ];

    return mockSuggestions.filter((suggestion) =>
      suggestion.text.toLowerCase().includes(localQuery.toLowerCase())
    );
  };

  const suggestions = getSuggestions();

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => localQuery && setShowSuggestions(true)}
          className="pl-10 pr-20 h-12 text-base"
        />

        {/* Countdown Timer */}
        {localQuery && localQuery !== debouncedQuery && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {countdown}s
            </Badge>
          </div>
        )}

        {/* Search Button */}
        <Button
          onClick={handleImmediateSearch}
          disabled={!localQuery || isLoading}
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>

        {/* Clear Button */}
        {localQuery && (
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-24 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && localQuery && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.length > 0 ? (
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLocalQuery(suggestion.text);
                    updateSearchQuery(suggestion.text);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left p-2 hover:bg-muted rounded-md flex items-center space-x-2 transition-colors"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-sm">{suggestion.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">No suggestions found</p>
            </div>
          )}
        </div>
      )}

      {/* Search Status */}
      {results && (
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Searching...
              </span>
            ) : (
              `${totalResults} properties found`
            )}
          </span>

          {error && <span className="text-destructive text-xs">{error}</span>}
        </div>
      )}

      {/* Filter Tags */}
      {showFilters && Object.keys(filters).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            return (
              <Badge
                key={key}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => updateFilters({ [key]: undefined })}
              >
                {key}: {value}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
