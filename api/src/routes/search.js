import express from "express";
import { getPrismaClient } from "../config/database.js";

import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper to generate cache key (commented out until Redis is implemented)
// const getCacheKey = (prefix, query) => `${prefix}:${JSON.stringify(query)}`;

// @route   GET /api/v1/search
// @desc    Advanced property search with filters, sorting, and pagination
// @access  Public
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    // TODO: Implement Redis caching when available
    // const cacheKey = getCacheKey("search_results", req.query);
    // const cachedResults = await redisClient.get(cacheKey);
    // if (cachedResults) {
    //   console.log("Serving search results from Redis cache");
    //   return res.status(200).json(JSON.parse(cachedResults));
    // }

    const {
      q, // general search query
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minArea,
      maxArea,
      city,
      county,
      features, // comma-separated string
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      latitude,
      longitude,
      radius = 10, // radius in km for location-based search
      isVerified,
      isFeatured,
      hasImages,
      yearBuiltMin,
      yearBuiltMax,
    } = req.query;

    const prisma = getPrismaClient();
    const where = {};

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { county: { contains: q, mode: "insensitive" } },
        { neighborhood: { contains: q, mode: "insensitive" } },
      ];
    }

    // Property type filter
    if (propertyType) {
      // Convert to uppercase to match enum values
      where.propertyType = propertyType.toUpperCase();
    }

    // Listing type filter
    if (listingType) {
      // Convert to uppercase to match enum values
      where.listingType = listingType.toUpperCase();
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Bedrooms filter
    if (minBedrooms || maxBedrooms) {
      where.bedrooms = {};
      if (minBedrooms) where.bedrooms.gte = parseInt(minBedrooms);
      if (maxBedrooms) where.bedrooms.lte = parseInt(maxBedrooms);
    }

    // Bathrooms filter
    if (minBathrooms || maxBathrooms) {
      where.bathrooms = {};
      if (minBathrooms) where.bathrooms.gte = parseInt(minBathrooms);
      if (maxBathrooms) where.bathrooms.lte = parseInt(maxBathrooms);
    }

    // Area filter
    if (minArea || maxArea) {
      where.areaSize = {};
      if (minArea) where.areaSize.gte = parseFloat(minArea);
      if (maxArea) where.areaSize.lte = parseFloat(maxArea);
    }

    // Location filters
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (county) {
      where.county = { contains: county, mode: "insensitive" };
    }

    // Features filter
    if (features) {
      const featureArray = features.split(",").map((f) => f.trim());
      where.features = { hasSome: featureArray };
    }

    // Verification and featured filters
    if (isVerified !== undefined) {
      where.isVerified = isVerified === "true";
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }

    // Year built filter
    if (yearBuiltMin || yearBuiltMax) {
      where.yearBuilt = {};
      if (yearBuiltMin) where.yearBuilt.gte = parseInt(yearBuiltMin);
      if (yearBuiltMax) where.yearBuilt.lte = parseInt(yearBuiltMax);
    }

    // Has images filter
    if (hasImages === "true") {
      where.images = { some: {} };
    }

    // Location-based search (simplified - in production use MongoDB's $geoNear)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(lng);
      const radiusDegrees = radius / 111.32; // Rough conversion: 1 degree ≈ 111.32 km

      where.AND = [
        { latitude: { gte: lat - radiusDegrees } },
        { latitude: { lte: lat + radiusDegrees } },
        {
          longitude: {
            gte: lng - radiusDegrees / Math.cos((lat * Math.PI) / 180),
          },
        },
        {
          longitude: {
            lte: lng + radiusDegrees / Math.cos((lat * Math.PI) / 180),
          },
        },
      ];
    }

    // Sorting
    const orderBy = {};
    orderBy[sortBy] = order === "desc" ? "desc" : "asc";

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute search
    const [properties, totalCount] = await Promise.all([
      prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          images: {
            where: { isPrimary: true },
          },
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              agentProfile: {
                select: {
                  company: true,
                },
              },
            },
          },
        },
      }),
      prisma.property.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    const result = {
      status: "success",
      data: properties,
      pagination: {
        totalDocs: totalCount,
        limit: parseInt(limit),
        totalPages,
        page: parseInt(page),
        hasPrevPage: parseInt(page) > 1,
        hasNextPage: parseInt(page) < totalPages,
        prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null,
        nextPage: parseInt(page) < totalPages ? parseInt(page) + 1 : null,
      },
      filters: {
        applied: {
          q,
          propertyType,
          listingType,
          minPrice,
          maxPrice,
          minBedrooms,
          maxBedrooms,
          minBathrooms,
          maxBathrooms,
          minArea,
          maxArea,
          city,
          county,
          features,
          isVerified,
          isFeatured,
          hasImages,
          yearBuiltMin,
          yearBuiltMax,
        },
      },
    };

    // TODO: Cache results for 1 hour when Redis is available
    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/search/suggestions
// @desc    Get search suggestions based on user input
// @access  Public
router.get("/suggestions", async (req, res, next) => {
  try {
    const { q, type = "all" } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    const prisma = getPrismaClient();
    let suggestions = [];

    if (type === "all" || type === "cities") {
      const cities = await prisma.property.findMany({
        where: {
          city: { contains: q, mode: "insensitive" },
        },
        select: { city: true },
        distinct: ["city"],
        take: 5,
      });
      suggestions.push(...cities.map((c) => ({ type: "city", value: c.city })));
    }

    if (type === "all" || type === "counties") {
      const counties = await prisma.property.findMany({
        where: {
          county: { contains: q, mode: "insensitive" },
        },
        select: { county: true },
        distinct: ["county"],
        take: 5,
      });
      suggestions.push(
        ...counties.map((c) => ({ type: "county", value: c.county }))
      );
    }

    if (type === "all" || type === "properties") {
      const properties = await prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { title: true, address: true },
        take: 5,
      });
      suggestions.push(
        ...properties.map((p) => ({
          type: "property",
          value: p.title,
          subtitle: p.address,
        }))
      );
    }

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter(
        (s, index, self) => index === self.findIndex((t) => t.value === s.value)
      )
      .slice(0, 10);

    res.status(200).json({
      status: "success",
      data: uniqueSuggestions,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/search/trending
// @desc    Get trending search terms and popular properties
// @access  Public
router.get("/trending", async (req, res, next) => {
  try {
    const cacheKey = "trending_searches";
    // const cachedTrending = await redisClient.get(cacheKey);

    // if (cachedTrending) {
    //   return res.status(200).json(JSON.parse(cachedTrending));
    // }

    const prisma = getPrismaClient();

    // Get popular cities
    const popularCities = await prisma.property.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 5,
    });

    // Get popular property types
    const popularPropertyTypes = await prisma.property.groupBy({
      by: ["propertyType"],
      _count: { propertyType: true },
      orderBy: { _count: { propertyType: "desc" } },
      take: 5,
    });

    // Get most viewed properties
    const mostViewedProperties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { views: "desc" },
      take: 5,
      include: {
        images: {
          where: { isPrimary: true },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const result = {
      status: "success",
      data: {
        popularCities: popularCities.map((c) => ({
          city: c.city,
          count: c._count.city,
        })),
        popularPropertyTypes: popularPropertyTypes.map((p) => ({
          type: p.propertyType,
          count: p._count.propertyType,
        })),
        mostViewedProperties,
      },
    };

    // Cache for 2 hours (Redis removed)
    // await redisClient.setEx(cacheKey, 7200, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/search/filters
// @desc    Get available filter options for search
// @access  Public
router.get("/filters", async (req, res, next) => {
  try {
    const cacheKey = "search_filters";
    // const cachedFilters = await redisClient.get(cacheKey);

    // if (cachedFilters) {
    //   return res.status(200).json(JSON.parse(cachedFilters));
    // }

    const prisma = getPrismaClient();

    // Get all available filters
    const [cities, counties, propertyTypes, features, priceRanges] =
      await Promise.all([
        prisma.property.findMany({
          select: { city: true },
          distinct: ["city"],
          orderBy: { city: "asc" },
        }),
        prisma.property.findMany({
          select: { county: true },
          distinct: ["county"],
          orderBy: { county: "asc" },
        }),
        prisma.property.findMany({
          select: { propertyType: true },
          distinct: ["propertyType"],
          orderBy: { propertyType: "asc" },
        }),
        prisma.property.findMany({
          select: { features: true },
        }),
        prisma.property.aggregate({
          _min: { price: true },
          _max: { price: true },
        }),
      ]);

    // Process features (flatten arrays and count occurrences)
    const featureCounts = {};
    features.forEach((property) => {
      property.features.forEach((feature) => {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      });
    });

    const sortedFeatures = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([feature]) => feature);

    const result = {
      status: "success",
      data: {
        cities: cities.map((c) => c.city),
        counties: counties.map((c) => c.county),
        propertyTypes: propertyTypes.map((p) => p.propertyType),
        features: sortedFeatures,
        priceRange: {
          min: priceRanges._min.price || 0,
          max: priceRanges._max.price || 0,
        },
      },
    };

    // TODO: Cache for 24 hours when Redis is available
    // await redisClient.setEx(cacheKey, 86400, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/search/save
// @desc    Save a search query for the authenticated user
// @access  Private
router.post("/save", optionalAuth, async (req, res, next) => {
  try {
    const { query, name } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required to save searches",
      });
    }

    if (!query || !name) {
      return res.status(400).json({
        status: "error",
        message: "Search query and name are required",
      });
    }

    // In a full implementation, you would save this to a SavedSearch model
    // For now, we'll just return success
    res.status(200).json({
      status: "success",
      message: "Search saved successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
