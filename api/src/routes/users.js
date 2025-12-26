import express from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";
import { sendEmail } from "../utils/email.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Validation for user updates
const validateUserUpdate = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("phone")
    .optional()
    .matches(/^(\+254|0)[17]\d{8}$/)
    .withMessage("Please provide a valid Kenyan phone number"),
  body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .withMessage("Invalid gender"),
  body("nationality")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Nationality cannot exceed 50 characters"),
  body("idNumber")
    .optional()
    .matches(/^\d{8}$/)
    .withMessage("ID number must be 8 digits"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
];

// Helper to clear user cache
const clearUserCache = async (userId = null) => {
  try {
    // User cache cleared
    if (userId) {
      // User cache cleared
    }
    console.log("User cache cleared.");
  } catch (error) {
    console.warn("Failed to clear user cache:", error.message);
  }
};

// @route   GET /api/v1/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        idNumber: true,
        passportNumber: true,
        bio: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        agentProfile: {
          select: {
            company: true,
            licenseNumber: true,
            experience: true,
            specializations: true,
            bio: true,
            website: true,
            isVerified: true,
            verificationDate: true,
          },
        },
        preferences: {
          select: {
            propertyTypes: true,
            locations: true,
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update current user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  validateUserUpdate,
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

      const prisma = getPrismaClient();
      const updateData = {};

      // Only allow updating certain fields
      const allowedFields = [
        "firstName",
        "lastName",
        "phone",
        "dateOfBirth",
        "gender",
        "nationality",
        "idNumber",
        "bio",
      ];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          nationality: true,
          idNumber: true,
          bio: true,
          role: true,
          isActive: true,
          isVerified: true,
        },
      });

      await clearUserCache(req.user.id);

      res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/v1/users/address
// @desc    Update current user address (currently disabled - address fields not in schema)
// @access  Private
router.put("/address", authenticateToken, async (req, res, next) => {
  try {
    res.status(501).json({
      status: "error",
      message:
        "Address update is currently not supported. Address fields are not in the current schema.",
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/preferences
// @desc    Update current user preferences
// @access  Private
router.put("/preferences", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const { preferences } = req.body;

    if (!preferences) {
      return res
        .status(400)
        .json({ status: "error", message: "Preferences data is required" });
    }

    // Update or create preferences
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: req.user.id },
      update: preferences,
      create: {
        ...preferences,
        userId: req.user.id,
      },
      select: {
        propertyTypes: true,
        locations: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
      },
    });

    await clearUserCache(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Preferences updated successfully",
      data: updatedPreferences,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/avatar
// @desc    Update current user avatar
// @access  Private
router.put("/avatar", authenticateToken, async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res
        .status(400)
        .json({ status: "error", message: "Avatar URL is required" });
    }

    const prisma = getPrismaClient();
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar },
      select: {
        id: true,
        avatar: true,
      },
    });

    await clearUserCache(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Avatar updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/password
// @desc    Change current user password
// @access  Private
router.put(
  "/password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
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

      const { currentPassword, newPassword } = req.body;
      const prisma = getPrismaClient();

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true },
      });

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return res
          .status(400)
          .json({ status: "error", message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_ROUNDS) || 12
      );
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword },
      });

      res.status(200).json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get("/:id", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        agentProfile: {
          select: {
            company: true,
            experience: true,
            specializations: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private (Admin)
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [body("isActive").isBoolean().withMessage("isActive must be a boolean")],
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

      const { isActive } = req.body;
      const prisma = getPrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Prevent admin from deactivating themselves
      if (req.params.id === req.user.id && !isActive) {
        return res.status(400).json({
          status: "error",
          message: "Cannot deactivate your own account",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      await clearUserCache(req.params.id);

      res.status(200).json({
        status: "success",
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/v1/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const prisma = getPrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Prevent admin from deleting themselves
      if (req.params.id === req.user.id) {
        return res
          .status(400)
          .json({ status: "error", message: "Cannot delete your own account" });
      }

      // Soft delete - mark as inactive instead of hard delete
      await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });

      await clearUserCache(req.params.id);

      res.status(200).json({
        status: "success",
        message: "User deactivated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/users
// @desc    Get all users with filtering and pagination (Admin only)
// @access  Private (Admin)
router.get("/", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      isVerified,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const prisma = getPrismaClient();
    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (isVerified !== undefined) where.isVerified = isVerified === "true";

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: users,
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
    });
  } catch (error) {
    next(error);
  }
});

export default router;
