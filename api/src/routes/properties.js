import express from "express";
import { getPrismaClient } from "../utils/prismaClient.js";
import { authenticateToken } from "../middleware/auth.js";
import { getSimilarProperties } from "../services/propertyService.js";

const router = express.Router();

// @desc    Get similar properties
// @route   GET /api/v1/properties/similar/:id
// @access  Public
router.get("/similar/:id", async (req, res, next) => {
  try {
    const similarProperties = await getSimilarProperties(req.params.id);
    const result = {
      status: "success",
      results: similarProperties.length,
      data: similarProperties,
    };
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured properties
// @route   GET /api/v1/properties/featured
// @access  Public
router.get("/featured", async (req, res, next) => {
  try {
    const {
      limit = 5,
      propertyType,
      listingType,
      city,
      county,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
    } = req.query;

    const where = {
      isFeatured: true,
      status: "ACTIVE",
    };

    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (county) where.county = { contains: county, mode: "insensitive" };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (bathrooms) where.bathrooms = parseInt(bathrooms);

    const prisma = getPrismaClient();
    const featuredProperties = await prisma.property.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
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
        agent: {
          select: {
            firstName: true,
            lastName: true,
            agentProfile: {
              select: {
                company: true,
              },
            },
          },
        },
      },
    });

    const result = {
      status: "success",
      results: featuredProperties.length,
      data: featuredProperties,
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @desc    Get all properties
// @route   GET /api/v1/properties
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const {
      search,
      status,
      propertyType,
      listingType,
      city,
      county,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      agentId,
      ownerId,
      limit = 50,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { county: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (county) where.county = { contains: county, mode: "insensitive" };
    if (agentId) where.agentId = agentId;
    if (ownerId) where.ownerId = ownerId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (bathrooms) where.bathrooms = parseInt(bathrooms);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const properties = await prisma.property.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            agentProfile: {
              select: {
                company: true,
                licenseNumber: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.property.count({ where });

    const result = {
      status: "success",
      results: properties.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: properties,
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            agentProfile: {
              select: {
                company: true,
                licenseNumber: true,
                isVerified: true,
                bio: true,
                specializations: true,
              },
            },
          },
        },
        propertyInquiries: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Increment view count
    await prisma.property.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    const result = {
      status: "success",
      data: property,
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @desc    Create new property
// @route   POST /api/v1/properties
// @access  Private (Agent/Admin)
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only agents and admins can create properties
    if (!["AGENT", "ADMIN"].includes(userRole)) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to create properties",
      });
    }

    const {
      title,
      description,
      propertyType,
      listingType,
      address,
      city,
      county,
      neighborhood,
      postalCode,
      latitude,
      longitude,
      price,
      currency = "KES",
      priceType = "FIXED",
      rentPeriod,
      deposit,
      bedrooms,
      bathrooms,
      area,
      areaSize,
      areaUnit = "SQM",
      yearBuilt,
      floors,
      parkingSpaces,
      features = [],
      amenities = [],
      nearbyAmenities = [],
      images = [],
      status = "ACTIVE",
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !propertyType ||
      !listingType ||
      !city ||
      !county ||
      !latitude ||
      !longitude ||
      !price ||
      !areaSize
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
      });
    }

    // Create property slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Prepare property data
    const propertyData = {
      title,
      description,
      propertyType,
      listingType,
      status,
      address: address || "",
      city,
      county,
      neighborhood,
      postalCode,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      price: parseFloat(price),
      currency,
      priceType,
      rentPeriod,
      deposit: deposit ? parseFloat(deposit) : null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      area,
      areaSize: parseFloat(areaSize),
      areaUnit,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      floors: floors ? parseInt(floors) : null,
      parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : null,
      features: Array.isArray(features) ? features.join(", ") : features,
      amenities: Array.isArray(amenities) ? amenities.join(", ") : amenities,
      nearbyAmenities: Array.isArray(nearbyAmenities)
        ? nearbyAmenities.join(", ")
        : nearbyAmenities,
      ownerId: userId,
      agentId: userRole === "AGENT" ? userId : null,
      slug: `${slug}-${Date.now()}`, // Add timestamp to ensure uniqueness
    };

    // Create property
    const property = await prisma.property.create({
      data: propertyData,
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create property images if provided
    if (images && images.length > 0) {
      const imageData = images.map((image, index) => ({
        propertyId: property.id,
        url: image.url || image,
        altText: image.caption || `${property.title} - Image ${index + 1}`,
        isPrimary: image.isPrimary || index === 0,
        order: image.order || index,
      }));

      await prisma.propertyImage.createMany({
        data: imageData,
      });
    }

    // Fetch property with images
    const createdProperty = await prisma.property.findUnique({
      where: { id: property.id },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const result = {
      status: "success",
      data: createdProperty,
    };

    res.status(201).json(result);
  } catch (error) {
    console.error("Property creation error:", error);
    next(error);
  }
});

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private (Owner/Agent/Admin)
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;
    const userRole = req.user.role;
    const propertyId = req.params.id;

    // Check if property exists and user has permission
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Check permissions
    const canUpdate =
      userRole === "ADMIN" ||
      existingProperty.ownerId === userId ||
      existingProperty.agentId === userId;

    if (!canUpdate) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this property",
      });
    }

    const {
      title,
      description,
      propertyType,
      listingType,
      status,
      address,
      city,
      county,
      neighborhood,
      postalCode,
      latitude,
      longitude,
      price,
      currency,
      priceType,
      rentPeriod,
      deposit,
      bedrooms,
      bathrooms,
      area,
      areaSize,
      areaUnit,
      yearBuilt,
      floors,
      parkingSpaces,
      features,
      amenities,
      nearbyAmenities,
      isFeatured,
      isVerified,
      isPremium,
    } = req.body;

    // Prepare update data
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (propertyType) updateData.propertyType = propertyType;
    if (listingType) updateData.listingType = listingType;
    if (status) updateData.status = status;
    if (address !== undefined) updateData.address = address;
    if (city) updateData.city = city;
    if (county) updateData.county = county;
    if (neighborhood !== undefined) updateData.neighborhood = neighborhood;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (currency) updateData.currency = currency;
    if (priceType) updateData.priceType = priceType;
    if (rentPeriod !== undefined) updateData.rentPeriod = rentPeriod;
    if (deposit !== undefined)
      updateData.deposit = deposit ? parseFloat(deposit) : null;
    if (bedrooms !== undefined)
      updateData.bedrooms = bedrooms ? parseInt(bedrooms) : null;
    if (bathrooms !== undefined)
      updateData.bathrooms = bathrooms ? parseInt(bathrooms) : null;
    if (area !== undefined) updateData.area = area;
    if (areaSize !== undefined) updateData.areaSize = parseFloat(areaSize);
    if (areaUnit) updateData.areaUnit = areaUnit;
    if (yearBuilt !== undefined)
      updateData.yearBuilt = yearBuilt ? parseInt(yearBuilt) : null;
    if (floors !== undefined)
      updateData.floors = floors ? parseInt(floors) : null;
    if (parkingSpaces !== undefined)
      updateData.parkingSpaces = parkingSpaces ? parseInt(parkingSpaces) : null;

    if (features) {
      updateData.features = Array.isArray(features)
        ? features.join(", ")
        : features;
    }
    if (amenities) {
      updateData.amenities = Array.isArray(amenities)
        ? amenities.join(", ")
        : amenities;
    }
    if (nearbyAmenities) {
      updateData.nearbyAmenities = Array.isArray(nearbyAmenities)
        ? nearbyAmenities.join(", ")
        : nearbyAmenities;
    }

    // Only admin can update these fields
    if (userRole === "ADMIN") {
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (isPremium !== undefined) updateData.isPremium = isPremium;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const result = {
      status: "success",
      data: updatedProperty,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Property update error:", error);
    next(error);
  }
});

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Owner/Agent/Admin)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;
    const userRole = req.user.role;
    const propertyId = req.params.id;

    // Check if property exists and user has permission
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Check permissions
    const canDelete =
      userRole === "ADMIN" ||
      existingProperty.ownerId === userId ||
      existingProperty.agentId === userId;

    if (!canDelete) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to delete this property",
      });
    }

    // Delete property (cascade will handle related records)
    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.status(200).json({
      status: "success",
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Property deletion error:", error);
    next(error);
  }
});

export default router;
