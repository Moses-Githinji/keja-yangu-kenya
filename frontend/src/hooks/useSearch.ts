import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { normalizeListingType } from "@/utils/propertyUtils";

export interface SearchFilters {
  q?: string; // general search query
  propertyType?: string;
  listingType?: "SALE" | "RENT" | "SHORT_TERM_RENT";
  status?: "AVAILABLE" | "PENDING" | "SOLD" | "RENTED";
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  county?: string;
  features?: string[];
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface SearchResult {
  properties: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: SearchFilters;
}

export const useSearch = (initialFilters: SearchFilters = {}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  // Debounce search query (500ms for better UX)
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      console.log("Setting debounced query:", searchQuery);
      setDebouncedQuery(searchQuery);
    }, 500); // Reduced to 500ms for better UX

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  // Perform search with current filters and query
  const searchProperties = useCallback(
    async (searchParams: SearchFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        // Normalize listingType if it exists
        const normalizedParams = {
          ...searchParams,
          ...(searchParams.listingType && {
            listingType: normalizeListingType(searchParams.listingType),
          }),
        };

        console.log(
          "Final search params:",
          JSON.stringify(normalizedParams, null, 2)
        );

        // Remove undefined values
        Object.keys(normalizedParams).forEach((key) => {
          if (
            normalizedParams[key as keyof typeof normalizedParams] === undefined
          ) {
            delete normalizedParams[key as keyof typeof normalizedParams];
          }
        });

        console.log("Search params:", normalizedParams); // Debug log

        const response = await apiService.search.searchProperties(
          normalizedParams
        );

        // Log the raw response for debugging
        console.log("=== SEARCH API RESPONSE ===");
        console.log("Full response:", JSON.stringify(response.data, null, 2));
        console.log(
          "response.data.data:",
          JSON.stringify(response.data.data, null, 2)
        );
        console.log(
          "response.data.pagination:",
          JSON.stringify(response.data.pagination, null, 2)
        );
        console.log("===========================");

        // Map the backend response to the expected frontend format
        const searchResult: SearchResult = {
          properties: response.data.data || [],
          total: response.data.pagination?.totalDocs || 0,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 20,
          totalPages: response.data.pagination?.totalPages || 0,
          filters: response.data.filters || {},
        };

        // Log the mapped result
        console.log("=== MAPPED SEARCH RESULT ===");
        console.log("searchResult:", JSON.stringify(searchResult, null, 2));
        console.log("===========================");

        setResults(searchResult);

        // Show success toast for search results
        if (searchResult.properties && searchResult.properties.length > 0) {
          toast({
            title: "Search Results",
            description: `Found ${searchResult.properties.length} properties matching your criteria.`,
            variant: "default",
          });
        } else {
          toast({
            title: "No Results",
            description:
              "No properties found matching your search criteria. Try adjusting your filters.",
            variant: "default",
          });
        }
      } catch (err: any) {
        console.error("Search error:", err); // Debug log
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to perform search. Please try again.";
        setError(errorMessage);
        toast({
          title: "Search Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedQuery, filters, toast]
  );

  // Perform search when debounced query or filters change
  useEffect(() => {
    // Only perform search if we have meaningful filters or query
    const hasFilters = Object.keys(filters).some(
      (key) =>
        filters[key as keyof SearchFilters] !== undefined &&
        filters[key as keyof SearchFilters] !== ""
    );
    // Don't trigger search on initial mount if only default filters are present
    if (
      debouncedQuery ||
      (hasFilters && (debouncedQuery || Object.keys(filters).length > 1))
    ) {
      searchProperties({ ...filters, q: debouncedQuery });
      setHasInitialized(true);
    }
  }, [debouncedQuery, filters, searchProperties]);

  // Update search query
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset search
  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setFilters(initialFilters);
    setResults(null);
    setError(null);
  }, [initialFilters]);

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!results || results.page >= results.totalPages || isLoading) return;

    setIsLoading(true);
    try {
      const searchParams = {
        ...filters,
        q: debouncedQuery || undefined,
        page: results.page + 1,
      };

      const response = await apiService.search.searchProperties(searchParams);

      // Map the backend response to the expected frontend format
      const searchResult: SearchResult = {
        properties: response.data.data || [],
        total: response.data.pagination?.totalDocs || 0,
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 20,
        totalPages: response.data.pagination?.totalPages || 0,
        filters: response.data.filters || {},
      };

      setResults(
        (prev): SearchResult => ({
          limit: searchResult.limit,
          total: searchResult.total,
          page: searchResult.page,
          totalPages: searchResult.totalPages,
          filters: searchResult.filters,
          properties: [
            ...(prev?.properties || []),
            ...(searchResult.properties || []),
          ],
        })
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load more results.";
      toast({
        title: "Load Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [results, filters, debouncedQuery, isLoading, toast]);

  // Quick search (immediate, without debouncing)
  const quickSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setDebouncedQuery(query);
  }, []);

  return {
    // State
    searchQuery,
    debouncedQuery,
    filters,
    results,
    isLoading,
    error,
    hasInitialized,

    // Actions
    updateSearchQuery,
    updateFilters,
    performSearch: searchProperties,
    resetSearch,
    loadMore,
    quickSearch,

    // Computed values
    hasResults:
      hasInitialized && results?.properties && results.properties.length > 0,
    totalResults: hasInitialized ? results?.total || 0 : 0,
    currentPage: hasInitialized ? results?.page || 1 : 1,
    totalPages: hasInitialized ? results?.totalPages || 0 : 0,
    canLoadMore:
      hasInitialized &&
      results &&
      results.page < results.totalPages &&
      !isLoading,
  };
};
