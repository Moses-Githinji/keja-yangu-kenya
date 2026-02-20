import express from "express";
import { body, param, query, validationResult } from "express-validator";
import {
  authenticateToken,
  requireAgent,
  requireAdmin,
} from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";
import { sendEmail } from "../utils/email.js";
import { getEmailTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

// Validation for agent profile updates
const validateAgentProfile = [
  body("company")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Company name must be between 2 and 100 characters"),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a non-negative integer"),
  body("specializations")
    .optional()
    .isArray()
    .withMessage("Specializations must be an array"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio cannot exceed 1000 characters"),
];

// Helper to clear agent cache
const clearAgentCache = async (agentId = null) => {
  try {
    // Agent cache cleared (Redis removed)
    console.log("Agent cache cleared.");
  } catch (error) {
    console.warn("Failed to clear agent cache:", error.message);
  }
};

// @route   GET /api/v1/agents
// @desc    Get all agents with filtering, sorting, and pagination
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    // const cacheKey = `all_agents:${JSON.stringify(req.query)}`;
    // const cachedAgents = await redisClient.get(cacheKey);

    // if (cachedAgents) {
    //   console.log("Serving agents from Redis cache");
    //   return res.status(200).json(JSON.parse(cachedAgents));
    // }

    const {
      search,
      city,
      county,
      specialization,
      experience,
      isVerified,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const prisma = getPrismaClient();
    const where = {
      role: "AGENT",
      isActive: true,
    };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { "agentProfile.company": { contains: search, mode: "insensitive" } },
      ];
    }

    // Location filters - disabled since address fields don't exist in current schema
    // if (city) {
    //   where.addressCity = { contains: city, mode: "insensitive" };
    // }
    // if (county) {
    //   where.addressCounty = { contains: county, mode: "insensitive" };
    // }

    // Specialization filter
    if (specialization) {
      where.agentProfile = {
        specializations: { has: specialization },
      };
    }

    // Experience filter
    if (experience) {
      where.agentProfile = {
        experience: { gte: parseInt(experience) },
      };
    }

    // Verification filter
    if (isVerified !== undefined) {
      where.agentProfile = {
        isVerified: isVerified === "true",
      };
    }

    // Sorting
    const orderBy = {};
    orderBy[sortBy] = order === "desc" ? "desc" : "asc";

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [agents, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          agentProfile: {
            select: {
              company: true,
              experience: true,
              specializations: true,
              bio: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    const result = {
      status: "success",
      data: agents,
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
    };

    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/agents/applications/:id/approve
// @desc    Approve an agent application
// @access  Private (Admin only)
router.put(
  "/applications/:id/approve",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const prisma = getPrismaClient();

      // Find the agent profile
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!agentProfile) {
        return res.status(404).json({
          status: "error",
          message: "Agent application not found",
        });
      }

      if (agentProfile.isVerified) {
        return res.status(400).json({
          status: "error",
          message: "Agent application is already approved",
        });
      }

      // Update agent profile to verified
      const updatedProfile = await prisma.agentProfile.update({
        where: { id },
        data: {
          isVerified: true,
          verificationDate: new Date(),
        },
        include: { user: true },
      });

      // Update user role to AGENT if not already
      if (updatedProfile.user.role !== "AGENT") {
        await prisma.user.update({
          where: { id: updatedProfile.userId },
          data: { role: "AGENT" },
        });
      }

      // Send approval email
      try {
        const emailHtml = getEmailTemplate("agentApplicationApproved", {
          recipientName: `${updatedProfile.user.firstName} ${
            updatedProfile.user.lastName || ""
          }`.trim(),
          recipientEmail: updatedProfile.user.email,
          applicationId: updatedProfile.id,
        });

        await sendEmail({
          to: updatedProfile.user.email,
          subject:
            "🎉 Congratulations! Your Agent Application Has Been Approved - Keja Yangu Kenya",
          template: "custom",
          data: { html: emailHtml },
        });
      } catch (emailError) {
        console.warn("Failed to send approval email:", emailError.message);
      }

      await clearAgentCache(updatedProfile.userId);

      res.status(200).json({
        status: "success",
        message: "Agent application approved successfully",
        data: {
          id: updatedProfile.id,
          status: "APPROVED",
          approvedAt: updatedProfile.verificationDate
            .toISOString()
            .split("T")[0],
        },
      });
    } catch (error) {
      console.error("Error approving agent application:", error);
      next(error);
    }
  }
);

// @route   PUT /api/v1/agents/applications/:id/reject
// @desc    Reject an agent application
// @access  Private (Admin only)
router.put(
  "/applications/:id/reject",
  authenticateToken,
  requireAdmin,
  [
    body("reason")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Rejection reason must be between 10 and 500 characters"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const prisma = getPrismaClient();

      // Find the agent profile
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!agentProfile) {
        return res.status(404).json({
          status: "error",
          message: "Agent application not found",
        });
      }

      if (agentProfile.isVerified) {
        return res.status(400).json({
          status: "error",
          message: "Cannot reject an already approved application",
        });
      }

      // For now, we'll mark as not verified and add a rejection note
      // In a more complete implementation, you might want to add a rejection status field
      const updatedProfile = await prisma.agentProfile.update({
        where: { id },
        data: {
          isVerified: false,
          // Note: You might want to add a rejectionReason field to the schema
        },
        include: { user: true },
      });

      // Send rejection email
      try {
        const emailHtml = getEmailTemplate("agentApplicationRejected", {
          recipientName: `${updatedProfile.user.firstName} ${
            updatedProfile.user.lastName || ""
          }`.trim(),
          recipientEmail: updatedProfile.user.email,
          applicationId: updatedProfile.id,
          rejectionReason:
            reason || "Your application did not meet our current requirements.",
        });

        await sendEmail({
          to: updatedProfile.user.email,
          subject: "Agent Application Update - Keja Yangu Kenya",
          template: "custom",
          data: { html: emailHtml },
        });
      } catch (emailError) {
        console.warn("Failed to send rejection email:", emailError.message);
      }

      await clearAgentCache(updatedProfile.userId);

      res.status(200).json({
        status: "success",
        message: "Agent application rejected",
        data: {
          id: updatedProfile.id,
          status: "REJECTED",
          rejectedAt: new Date().toISOString().split("T")[0],
        },
      });
    } catch (error) {
      console.error("Error rejecting agent application:", error);
      next(error);
    }
  }
);

// @route   GET /api/v1/agents/applications/:id
// @desc    Get detailed agent application by ID
// @access  Private (Admin only)
router.get(
  "/applications/:id",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const prisma = getPrismaClient();

      const application = await prisma.agentProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      if (!application) {
        return res.status(404).json({
          status: "error",
          message: "Agent application not found",
        });
      }

      // Transform data for frontend
      const transformedApplication = {
        id: application.id,
        userId: application.userId,
        firstName: application.user.firstName,
        lastName: application.user.lastName,
        email: application.user.email,
        phone: application.user.phone,
        avatar: application.user.avatar,
        company: application.company,
        licenseNumber: application.licenseNumber,
        experience: application.experience,
        specializations: application.specializations,
        bio: application.bio,
        website: application.website,
        status: application.isVerified ? "APPROVED" : "PENDING",
        submittedAt: application.createdAt.toISOString().split("T")[0],
        approvedAt:
          application.isVerified && application.verificationDate
            ? application.verificationDate.toISOString().split("T")[0]
            : null,
        userCreatedAt: application.user.createdAt.toISOString().split("T")[0],
        userUpdatedAt: application.user.updatedAt.toISOString().split("T")[0],
      };

      res.status(200).json({
        status: "success",
        data: transformedApplication,
      });
    } catch (error) {
      console.error("Error fetching agent application details:", error);
      next(error);
    }
  }
);

// @route   GET /api/v1/agents/applications
// @desc    Get all agent applications for admin review
// @access  Private (Admin only)
router.get(
  "/applications",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const {
        status,
        search,
        sortBy = "createdAt",
        order = "desc",
        page = 1,
        limit = 10,
      } = req.query;

      const prisma = getPrismaClient();
      const where = {};

      // Status filter - improved logic
      if (status && status !== "ALL") {
        if (status === "APPROVED") {
          where.isVerified = true;
        } else if (status === "PENDING") {
          where.isVerified = false;
        } else if (status === "REJECTED") {
          // For now, rejected applications are those that are not verified
          // In a more complete implementation, you might have a separate status field
          where.isVerified = false;
        }
      }

      // Search filter
      if (search) {
        where.OR = [
          { user: { firstName: { contains: search, mode: "insensitive" } } },
          { user: { lastName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { company: { contains: search, mode: "insensitive" } },
          { licenseNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      // Sorting
      const orderByObj = {};
      orderByObj[sortBy] = order === "desc" ? "desc" : "asc";

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get applications with user details
      const applications = await prisma.agentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: orderByObj,
        skip,
        take: parseInt(limit),
      });

      // Get total count
      const totalCount = await prisma.agentProfile.count({ where });

      // Transform data to match frontend expectations
      const transformedApplications = applications.map((app) => ({
        id: app.id,
        userId: app.userId,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        email: app.user.email,
        phone: app.user.phone,
        company: app.company,
        licenseNumber: app.licenseNumber,
        experience: app.experience,
        specializations: app.specializations,
        bio: app.bio,
        website: app.website,
        status: app.isVerified ? "APPROVED" : "PENDING", // Simplified status mapping
        submittedAt: app.createdAt.toISOString().split("T")[0],
        approvedAt:
          app.isVerified && app.verificationDate
            ? app.verificationDate.toISOString().split("T")[0]
            : null,
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      const result = {
        status: "success",
        data: transformedApplications,
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
      };

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching agent applications:", error);
      next(error);
    }
  }
);

// @route   GET /api/v1/agents/:id
// @desc    Get a single agent by ID
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    // const redisClient = getRedisClient(); // Redis removed
    // const cacheKey = `agent:${req.params.id}`;
    // const cachedAgent = await redisClient.get(cacheKey);

    // if (cachedAgent) {
    //   console.log("Serving agent from Redis cache");
    //   return res.status(200).json(JSON.parse(cachedAgent));
    // }

    const prisma = getPrismaClient();
    const agent = await prisma.user.findUnique({
      where: {
        id: req.params.id,
        role: "AGENT",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        agentProfile: {
          select: {
            company: true,
            experience: true,
            specializations: true,
            bio: true,
            isVerified: true,
            licenseNumber: true,
            website: true,
          },
        },
        // Get agent's properties
        agentProperties: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            title: true,
            price: true,
            propertyType: true,
            city: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
            },
          },
          take: 5,
        },
      },
    });

    if (!agent) {
      return res
        .status(404)
        .json({ status: "error", message: "Agent not found" });
    }

    const result = { status: "success", data: agent };
    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/agents/:id/profile
// @desc    Update agent profile
// @access  Private (Agent/Admin)
router.put(
  "/:id/profile",
  authenticateToken,
  requireAgent,
  validateAgentProfile,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      // Check if user is updating their own profile or is admin
      if (req.user.id !== req.params.id && req.user.role !== "ADMIN") {
        return res
          .status(403)
          .json({ status: "error", message: "Access denied" });
      }

      const prisma = getPrismaClient();
      const { agentProfile, ...userData } = req.body;

      // Update user data
      const updateData = {};
      if (Object.keys(userData).length > 0) {
        updateData.user = userData;
      }

      // Update agent profile
      if (agentProfile) {
        updateData.agentProfile = {
          upsert: {
            create: agentProfile,
            update: agentProfile,
          },
        };
      }

      const updatedAgent = await prisma.user.update({
        where: { id: req.params.id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          agentProfile: {
            select: {
              company: true,
              experience: true,
              specializations: true,
              bio: true,
              isVerified: true,
            },
          },
        },
      });

      await clearAgentCache(req.params.id);

      res.status(200).json({
        status: "success",
        message: "Agent profile updated successfully",
        data: updatedAgent,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/v1/agents/:id/verify
// @desc    Verify an agent (Admin only)
// @access  Private (Admin)
router.post(
  "/:id/verify",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      // const { verificationDocuments } = req.body; // Field not in current schema
      const prisma = getPrismaClient();

      const agent = await prisma.user.findUnique({
        where: {
          id: req.params.id,
          role: "AGENT",
        },
        include: { agentProfile: true },
      });

      if (!agent) {
        return res
          .status(404)
          .json({ status: "error", message: "Agent not found" });
      }

      if (!agent.agentProfile) {
        return res
          .status(400)
          .json({ status: "error", message: "Agent profile not found" });
      }

      // Update verification status
      await prisma.agentProfile.update({
        where: { userId: req.params.id },
        data: {
          isVerified: true,
          // verificationDocuments: verificationDocuments || [], // Field not in current schema
        },
      });

      await clearAgentCache(req.params.id);

      res.status(200).json({
        status: "success",
        message: "Agent verified successfully",
      });
    } catch (error) {
      console.error("Error in agent application:", error);
      next(error);
    }
  }
);

// @route   GET /api/v1/agents/specialization/:specialization
// @desc    Get agents by specialization
// @access  Public
router.get("/specialization/:specialization", async (req, res, next) => {
  try {
    const { specialization } = req.params;
    const { limit = 10 } = req.query;

    const redisClient = getRedisClient();
    const cacheKey = `agents_by_specialization:${specialization}:${limit}`;
    const cachedAgents = await redisClient.get(cacheKey);

    if (cachedAgents) {
      console.log("Serving agents by specialization from Redis cache");
      return res.status(200).json(JSON.parse(cachedAgents));
    }

    const prisma = getPrismaClient();
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
        isActive: true,
        agentProfile: {
          specializations: { has: specialization },
          isVerified: true,
        },
      },
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        agentProfile: {
          select: {
            company: true,
            experience: true,
            specializations: true,
            languages: true,
            bio: true,
            commission: true,
            isVerified: true,
          },
        },
      },
    });

    const result = {
      status: "success",
      specialization,
      results: agents.length,
      data: agents,
    };

    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/agents/stats/overview
// @desc    Get agent statistics overview
// @access  Public
router.get("/stats/overview", async (req, res, next) => {
  try {
    const redisClient = getRedisClient();
    const cacheKey = "agent_stats_overview";
    const cachedStats = await redisClient.get(cacheKey);

    if (cachedStats) {
      return res.status(200).json(JSON.parse(cachedStats));
    }

    const prisma = getPrismaClient();

    const [totalAgents, verifiedAgents, totalProperties, avgExperience] =
      await Promise.all([
        prisma.user.count({ where: { role: "AGENT", isActive: true } }),
        prisma.user.count({
          where: {
            role: "AGENT",
            isActive: true,
            agentProfile: { isVerified: true },
          },
        }),
        prisma.property.count({ where: { agentId: { not: null } } }),
        prisma.agentProfile.aggregate({
          where: { user: { isActive: true } },
          _avg: { experience: true },
        }),
      ]);

    const stats = {
      totalAgents,
      verifiedAgents,
      totalProperties,
      averageExperience: avgExperience._avg.experience || 0,
      verificationRate:
        totalAgents > 0 ? ((verifiedAgents / totalAgents) * 100).toFixed(1) : 0,
    };

    const result = { status: "success", data: stats };
    // await redisClient.setEx(cacheKey, 7200, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/agents/featured
// @desc    Get featured/verified agents
// @access  Public
router.get("/featured", async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const redisClient = getRedisClient();
    const cacheKey = `featured_agents:${limit}`;
    const cachedAgents = await redisClient.get(cacheKey);

    if (cachedAgents) {
      return res.status(200).json(JSON.parse(cachedAgents));
    }

    const prisma = getPrismaClient();
    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT",
        isActive: true,
        agentProfile: {
          isVerified: true,
        },
      },
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        agentProfile: {
          select: {
            company: true,
            experience: true,
            specializations: true,
            languages: true,
            bio: true,
            commission: true,
            isVerified: true,
          },
        },
      },
    });

    const result = {
      status: "success",
      results: agents.length,
      data: agents,
    };

    // await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/agents/apply
// @desc    Submit agent application with uniqueness validation
// @access  Private (Authenticated users)
router.post(
  "/apply",
  authenticateToken,
  [
    body("company")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Company name must be between 2 and 100 characters"),
    body("licenseNumber")
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage("License number must be between 5 and 20 characters"),
    body("experience")
      .isInt({ min: 0 })
      .withMessage("Experience must be a non-negative integer"),
    body("specializations")
      .isArray({ min: 1 })
      .withMessage("At least one specialization is required"),
    body("bio")
      .trim()
      .isLength({ min: 50, max: 1000 })
      .withMessage("Bio must be between 50 and 1000 characters"),
    body("phone").custom((value) => {
      // Kenyan phone number validation
      const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
      const internationalPhoneRegex = /^\+\d{1,4}\d{6,14}$/;

      // Check if it's a Kenyan number
      if (kenyanPhoneRegex.test(value.replace(/\s+/g, ""))) {
        return true;
      }

      // Check if it's a valid international number (basic check)
      if (internationalPhoneRegex.test(value.replace(/\s+/g, ""))) {
        return true;
      }

      throw new Error(
        "Please enter a valid phone number. Kenyan numbers should start with +254, 254, or 0, followed by 7xxxxxxxx or 1xxxxxxxx"
      );
    }),
    body("website")
      .optional()
      .isURL()
      .withMessage("Website must be a valid URL"),
  ],
  async (req, res, next) => {
    try {
      console.log("Agent application request received:", {
        userId: req.user.id,
        body: req.body,
        headers: req.headers,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        company,
        licenseNumber,
        experience,
        specializations,
        bio,
        phone,
        website,
      } = req.body;
      const userId = req.user.id;

      console.log("Parsed request data:", {
        company,
        licenseNumber,
        experience,
        specializations,
        bio,
        phone,
        website,
        userId,
      });

      const prisma = getPrismaClient();

      // Check if user already has an agent profile
      console.log("Checking for existing agent profile for userId:", userId);
      const existingProfile = await prisma.agentProfile.findUnique({
        where: { userId },
      });

      console.log("Existing profile result:", existingProfile);

      if (existingProfile) {
        console.log("User already has agent profile, returning 400");
        return res.status(400).json({
          status: "error",
          message: "You already have an agent application submitted",
        });
      }

      // Uniqueness validation
      console.log("Starting uniqueness validation checks");
      const uniquenessChecks = await Promise.all([
        // Check company uniqueness (if provided)
        company
          ? prisma.agentProfile.findFirst({
              where: {
                company: { contains: company.toLowerCase(), mode: "insensitive" },
              },
            })
          : null,
        // Check license number uniqueness with case-insensitive comparison
        prisma.agentProfile.findFirst({
          where: {
            licenseNumber: {
              equals: licenseNumber,
            },
          },
        }),
        // Check phone uniqueness
        prisma.user.findFirst({
          where: {
            phone: { equals: phone, mode: "insensitive" },
            id: { not: userId },
          },
        }),
        // Check website uniqueness (if provided)
        website
          ? prisma.agentProfile.findFirst({
              where: { website: { equals: website, mode: "insensitive" } },
            })
          : null,
      ]);

      const [existingCompany, existingLicense, existingPhone, existingWebsite] =
        uniquenessChecks;

      console.log("Uniqueness check results:", {
        existingCompany: !!existingCompany,
        existingLicense: !!existingLicense,
        existingPhone: !!existingPhone,
        existingWebsite: !!existingWebsite,
      });

      const uniquenessErrors = [];

      if (existingCompany) {
        uniquenessErrors.push({
          field: "company",
          message: "This company name is already registered",
        });
      }

      if (existingLicense) {
        uniquenessErrors.push({
          field: "licenseNumber",
          message: "This license number is already registered",
        });
      }

      if (existingPhone) {
        uniquenessErrors.push({
          field: "phone",
          message: "This phone number is already registered",
        });
      }

      if (existingWebsite) {
        uniquenessErrors.push({
          field: "website",
          message: "This website is already registered",
        });
      }

      if (uniquenessErrors.length > 0) {
        console.log(
          "Uniqueness validation failed with errors:",
          uniquenessErrors
        );
        return res.status(409).json({
          status: "error",
          message: "Validation failed - duplicate entries found",
          errors: uniquenessErrors,
        });
      }

      console.log("Uniqueness validation passed");

      // Create agent profile
      console.log("Creating agent profile with data:", {
        userId,
        company,
        licenseNumber,
        experience: parseInt(experience),
        specializations,
        bio,
        website,
      });

      const agentProfile = await prisma.agentProfile.create({
        data: {
          userId,
          company,
          licenseNumber,
          experience: parseInt(experience),
          specializations,
          bio,
          website,
        },
      });

      console.log("Agent profile created successfully:", agentProfile);

      // Update user phone if different
      if (phone !== req.user.phone) {
        console.log("Updating user phone from", req.user.phone, "to", phone);
        await prisma.user.update({
          where: { id: userId },
          data: { phone },
        });
      }

      // Send confirmation email
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { firstName: true, lastName: true, email: true },
        });

        const emailHtml = getEmailTemplate("agentApplicationSuccess", {
          recipientName: `${user.firstName} ${user.lastName || ""}`.trim(),
          recipientEmail: user.email,
          applicationId: agentProfile.id,
        });

        await sendEmail({
          to: user.email,
          subject: "🎉 Agent Application Submitted - Keja Yangu Kenya",
          template: "custom",
          data: { html: emailHtml },
        });
      } catch (emailError) {
        console.warn("Failed to send confirmation email:", emailError.message);
        // Don't fail the application if email fails
      }

      res.status(201).json({
        status: "success",
        message: "Agent application submitted successfully",
        data: {
          applicationId: agentProfile.id,
          status: "PENDING",
          submittedAt: agentProfile.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/agents/applications
// @desc    Get all agent applications for admin review
// @access  Private (Admin only)
router.get(
  "/applications",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const {
        status,
        search,
        sortBy = "createdAt",
        order = "desc",
        page = 1,
        limit = 10,
      } = req.query;

      const prisma = getPrismaClient();
      const where = {};

      // Status filter
      if (status && status !== "ALL") {
        where.isVerified = status === "APPROVED";
        // For pending applications, we need to check if they exist but are not verified
        if (status === "PENDING") {
          // This will be handled in the query logic below
        } else if (status === "REJECTED") {
          // Rejected applications would need a separate status field
          // For now, we'll assume rejected means not verified and possibly marked differently
        }
      }

      // Search filter
      if (search) {
        where.OR = [
          { user: { firstName: { contains: search, mode: "insensitive" } } },
          { user: { lastName: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { company: { contains: search, mode: "insensitive" } },
          { licenseNumber: { contains: search, mode: "insensitive" } },
        ];
      }

      // Sorting
      const orderByObj = {};
      orderByObj[sortBy] = order === "desc" ? "desc" : "asc";

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get applications with user details
      const applications = await prisma.agentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true,
            },
          },
        },
        orderBy: orderByObj,
        skip,
        take: parseInt(limit),
      });

      // Get total count
      const totalCount = await prisma.agentProfile.count({ where });

      // Transform data to match frontend expectations
      const transformedApplications = applications.map((app) => ({
        id: app.id,
        userId: app.userId,
        firstName: app.user.firstName,
        lastName: app.user.lastName,
        email: app.user.email,
        phone: app.user.phone,
        company: app.company,
        licenseNumber: app.licenseNumber,
        experience: app.experience,
        specializations: app.specializations,
        bio: app.bio,
        website: app.website,
        status: app.isVerified ? "APPROVED" : "PENDING", // Simplified status mapping
        submittedAt: app.createdAt.toISOString().split("T")[0],
        approvedAt:
          app.isVerified && app.verificationDate
            ? app.verificationDate.toISOString().split("T")[0]
            : null,
      }));

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      const result = {
        status: "success",
        data: transformedApplications,
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
      };

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching agent applications:", error);
      next(error);
    }
  }
);

export default router;
