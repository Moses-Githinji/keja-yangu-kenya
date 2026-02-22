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
    if (city) where.city = { contains: city };
    if (county) where.county = { contains: county };

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
        { title: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
        { county: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (propertyType) where.propertyType = propertyType;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { contains: city };
    if (county) where.county = { contains: county };
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

    // Unique view tracking (24h)
    const sessionId = req.ip || req.headers["x-forwarded-for"] || "unknown-session";
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check if this session already viewed this property in the last 24h
    const existingView = await prisma.propertyView.findFirst({
      where: {
        propertyId: req.params.id,
        sessionId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (!existingView) {
      await prisma.$transaction([
        prisma.propertyView.create({
          data: {
            propertyId: req.params.id,
            sessionId,
          },
        }),
        prisma.property.update({
          where: { id: req.params.id },
          data: { views: { increment: 1 } },
        }),
      ]);
    }

    // Get unique view count for last 24h
    const uniqueViews24h = await prisma.propertyView.count({
      where: {
        propertyId: req.params.id,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    const result = {
      status: "success",
      data: {
        ...property,
        viewCount24h: uniqueViews24h,
      },
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
      // New metadata fields
      waterSource,
      backupPower,
      fiberProviders,
      hasSolarWaterHeating,
      securityFeatures,
      serviceCharge,
      depositMonths,
      legalStatus,
      projectedYield,
      annualAppreciation,
      virtualTourUrl,
      floorPlanUrl,
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
      // New metadata fields
      waterSource,
      backupPower,
      fiberProviders: Array.isArray(fiberProviders) ? fiberProviders.join(", ") : fiberProviders,
      hasSolarWaterHeating: hasSolarWaterHeating === true || hasSolarWaterHeating === "true",
      securityFeatures: Array.isArray(securityFeatures) ? securityFeatures.join(", ") : securityFeatures,
      serviceCharge: serviceCharge ? parseFloat(serviceCharge) : null,
      depositMonths: depositMonths ? parseInt(depositMonths) : null,
      legalStatus,
      projectedYield: projectedYield ? parseFloat(projectedYield) : null,
      annualAppreciation: annualAppreciation ? parseFloat(annualAppreciation) : null,
      virtualTourUrl,
      floorPlanUrl,
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
      // New metadata fields
      waterSource,
      backupPower,
      fiberProviders,
      hasSolarWaterHeating,
      securityFeatures,
      serviceCharge,
      depositMonths,
      legalStatus,
      projectedYield,
      annualAppreciation,
      virtualTourUrl,
      floorPlanUrl,
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

    // New metadata fields
    if (waterSource !== undefined) updateData.waterSource = waterSource;
    if (backupPower !== undefined) updateData.backupPower = backupPower;
    if (fiberProviders !== undefined) {
      updateData.fiberProviders = Array.isArray(fiberProviders) ? fiberProviders.join(", ") : fiberProviders;
    }
    if (hasSolarWaterHeating !== undefined) {
      updateData.hasSolarWaterHeating = hasSolarWaterHeating === true || hasSolarWaterHeating === "true";
    }
    if (securityFeatures !== undefined) {
      updateData.securityFeatures = Array.isArray(securityFeatures) ? securityFeatures.join(", ") : securityFeatures;
    }
    if (serviceCharge !== undefined) updateData.serviceCharge = serviceCharge ? parseFloat(serviceCharge) : null;
    if (depositMonths !== undefined) updateData.depositMonths = depositMonths ? parseInt(depositMonths) : null;
    if (legalStatus !== undefined) updateData.legalStatus = legalStatus;
    if (projectedYield !== undefined) updateData.projectedYield = projectedYield ? parseFloat(projectedYield) : null;
    if (annualAppreciation !== undefined) updateData.annualAppreciation = annualAppreciation ? parseFloat(annualAppreciation) : null;
    if (virtualTourUrl !== undefined) updateData.virtualTourUrl = virtualTourUrl;
    if (floorPlanUrl !== undefined) updateData.floorPlanUrl = floorPlanUrl;

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

// @desc    Create property inquiry
// @route   POST /api/v1/properties/:id/inquiry
// @access  Private
router.post("/:id/inquiry", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, message, contactPreference = "EMAIL" } = req.body;
    const userId = req.user.id;
    const prisma = getPrismaClient();

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    // Create inquiry
    const inquiry = await prisma.propertyInquiry.create({
      data: {
        propertyId: id,
        userId,
        agentId: property.agentId || property.ownerId, // Route to agent if exists, otherwise owner
        message: `[${category}] ${message}`,
        contactPreference,
      },
    });

    // Increment inquiry count on property
    await prisma.property.update({
      where: { id },
      data: { inquiryCount: { increment: 1 } },
    });

    res.status(201).json({
      status: "success",
      data: inquiry,
    });
  } catch (error) {
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

    // Property Enhancements: Added comprehensive metadata fields (utilities, security, financial, legal), unique session-based view tracking (last 24h), and a dedicated inquiry system.
    // Presence Tracking: Users can see if others are "Online" or when they were "Last Seen".
    // Typing Indicators: Real-time "Typing..." feedback in the chat window.
    // Delivery Status: "Delivered" acknowledgments when messages reach the recipient.
    // Search Fix: Resolved `PrismaClientValidationError` in search queries by ensuring compatibility with SQLite.
    // Admin Management: Registered admin routes for system management.
    // GitHub: All changes successfully committed and pushed to the `main` branch.
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
