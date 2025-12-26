import { getPrismaClient } from "../config/database.js";

/**
 * Middleware to check if user is an approved content creator
 */
export const requireContentCreator = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    // Check if user has content creator profile
    const creatorProfile = await prisma.contentCreatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!creatorProfile) {
      return res.status(403).json({
        status: "error",
        message: "Content creator profile not found. Please enroll first.",
      });
    }

    if (!creatorProfile.isEnrolled) {
      return res.status(403).json({
        status: "error",
        message: "Content creator enrollment not completed.",
      });
    }

    if (creatorProfile.enrollmentStatus !== "APPROVED") {
      return res.status(403).json({
        status: "error",
        message: `Content creator application is ${creatorProfile.enrollmentStatus.toLowerCase()}. Please wait for approval.`,
      });
    }

    // Add creator profile to request for use in routes
    req.creatorProfile = creatorProfile;
    next();
  } catch (error) {
    console.error("Content creator middleware error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to check if user can enroll as content creator
 */
export const canEnrollAsCreator = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    // Check if user already has a profile
    const existingProfile = await prisma.contentCreatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existingProfile) {
      return res.status(400).json({
        status: "error",
        message: "User already has a content creator profile",
      });
    }

    // Check if user has verified properties
    const propertyCount = await prisma.property.count({
      where: {
        ownerId: req.user.id,
        isVerified: true,
        status: "ACTIVE",
      },
    });

    if (propertyCount < 1) {
      return res.status(400).json({
        status: "error",
        message:
          "You must have at least one verified property to enroll as a content creator",
      });
    }

    next();
  } catch (error) {
    console.error("Creator enrollment check error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
