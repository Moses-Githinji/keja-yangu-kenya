import express from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  requireContentCreator,
  canEnrollAsCreator,
} from "../middleware/contentCreator.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Validation for payment creation
const validatePayment = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency")
    .isIn(["KES", "USD"])
    .withMessage("Currency must be KES or USD"),
  body("paymentMethod")
    .isIn(["STRIPE", "MPESA", "BANK_TRANSFER", "CASH"])
    .withMessage("Invalid payment method"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Validation for content creator enrollment
const validateEnrollment = [
  body("taxId").optional().isString().withMessage("Tax ID must be a string"),
  body("bankAccount")
    .optional()
    .isObject()
    .withMessage("Bank account must be an object"),
  body("mpesaNumber")
    .optional()
    .matches(/^254\d{9}$/)
    .withMessage("M-Pesa number must be in format 254XXXXXXXXX"),
  body("payoutMethod")
    .isIn(["MPESA", "BANK_TRANSFER", "PAYPAL", "STRIPE"])
    .withMessage("Invalid payout method"),
];

// Validation for payout request
const validatePayout = [
  body("amount")
    .isFloat({ min: 100 })
    .withMessage("Minimum payout amount is KES 100"),
  body("method")
    .isIn(["MPESA", "BANK_TRANSFER", "PAYPAL", "STRIPE"])
    .withMessage("Invalid payout method"),
];

// @route   POST /api/v1/content-creators/enroll
// @desc    Enroll as a content creator
// @access  Private
router.post(
  "/enroll",
  authenticateToken,
  canEnrollAsCreator,
  validateEnrollment,
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

      const { taxId, bankAccount, mpesaNumber, payoutMethod } = req.body;
      const prisma = getPrismaClient();

      // Create content creator profile
      const creatorProfile = await prisma.contentCreatorProfile.create({
        data: {
          userId: req.user.id,
          isEnrolled: true,
          enrollmentDate: new Date(),
          enrollmentStatus: "PENDING",
          taxId,
          bankAccount,
          mpesaNumber,
          payoutMethod,
          viewRate: 0.01, // KES 0.01 per view
          inquiryRate: 0.5, // KES 0.50 per inquiry
          premiumListingRate: 0.1, // 10% of premium fee
          adRevenueRate: 0.7, // 70% of ad revenue
          minimumPayout: 100, // Minimum KES 100 for payout
          taxRate: 0.16, // 16% VAT
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update user role
      await prisma.user.update({
        where: { id: req.user.id },
        data: { role: "CONTENT_CREATOR" },
      });

      res.status(201).json({
        status: "success",
        message: "Content creator enrollment submitted successfully",
        data: creatorProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/content-creators/profile
// @desc    Get content creator profile
// @access  Private (Content Creator)
router.get(
  "/profile",
  authenticateToken,
  requireContentCreator,
  async (req, res, next) => {
    try {
      const prisma = getPrismaClient();

      const profile = await prisma.contentCreatorProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          earnings: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
          payouts: {
            take: 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/content-creators/earnings
// @desc    Get earnings history
// @access  Private (Content Creator)
router.get(
  "/earnings",
  authenticateToken,
  requireContentCreator,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, type, startDate, endDate } = req.query;
      const prisma = getPrismaClient();

      const where = { creatorId: req.creatorProfile.id };
      if (type) where.earningsType = type;
      if (startDate && endDate) {
        where.calculationDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [earnings, totalCount] = await Promise.all([
        prisma.propertyEarnings.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { calculationDate: "desc" },
          include: {
            property: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: {
                  take: 1,
                  where: { isPrimary: true },
                },
              },
            },
          },
        }),
        prisma.propertyEarnings.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        status: "success",
        data: earnings,
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
  }
);

// @route   POST /api/v1/content-creators/payout
// @desc    Request a payout
// @access  Private (Content Creator)
router.post(
  "/payout",
  authenticateToken,
  requireContentCreator,
  validatePayout,
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

      const { amount, method } = req.body;
      const prisma = getPrismaClient();

      if (amount > req.creatorProfile.availableBalance) {
        return res.status(400).json({
          status: "error",
          message: "Insufficient balance for payout",
        });
      }

      if (amount < req.creatorProfile.minimumPayout) {
        return res.status(400).json({
          status: "error",
          message: `Minimum payout amount is KES ${req.creatorProfile.minimumPayout}`,
        });
      }

      // Create payout request
      const payout = await prisma.creatorPayouts.create({
        data: {
          creatorId: req.creatorProfile.id,
          amount,
          method,
          status: "PENDING",
          currency: "KES",
        },
      });

      // Update available balance
      await prisma.contentCreatorProfile.update({
        where: { id: req.creatorProfile.id },
        data: {
          availableBalance: req.creatorProfile.availableBalance - amount,
        },
      });

      res.status(201).json({
        status: "success",
        message: "Payout request submitted successfully",
        data: payout,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/content-creators/payouts
// @desc    Get payout history
// @access  Private (Content Creator)
router.get(
  "/payouts",
  authenticateToken,
  requireContentCreator,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const prisma = getPrismaClient();

      const where = { creatorId: req.creatorProfile.id };
      if (status) where.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [payouts, totalCount] = await Promise.all([
        prisma.creatorPayouts.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
        }),
        prisma.creatorPayouts.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        status: "success",
        data: payouts,
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
  }
);

// @route   GET /api/v1/content-creators/stats
// @desc    Get content creator statistics
// @access  Private (Content Creator)
router.get(
  "/stats",
  authenticateToken,
  requireContentCreator,
  async (req, res, next) => {
    try {
      const { period = "30" } = req.query; // days
      const prisma = getPrismaClient();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const [earnings, payouts, properties, views, inquiries] =
        await Promise.all([
          prisma.propertyEarnings.aggregate({
            where: {
              creatorId: req.creatorProfile.id,
              calculationDate: { gte: startDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
          prisma.creatorPayouts.aggregate({
            where: {
              creatorId: req.creatorProfile.id,
              status: "COMPLETED",
              createdAt: { gte: startDate },
            },
            _sum: { amount: true },
            _count: true,
          }),
          prisma.property.count({
            where: {
              ownerId: req.user.id,
              status: "ACTIVE",
            },
          }),
          prisma.property.aggregate({
            where: {
              ownerId: req.user.id,
              status: "ACTIVE",
            },
            _sum: { views: true },
          }),
          prisma.property.aggregate({
            where: {
              ownerId: req.user.id,
              status: "ACTIVE",
            },
            _sum: { inquiryCount: true },
          }),
        ]);

      const stats = {
        period: `${period} days`,
        totalEarnings: earnings._sum.amount || 0,
        earningsCount: earnings._count || 0,
        totalPayouts: payouts._sum.amount || 0,
        payoutsCount: payouts._count || 0,
        activeProperties: properties,
        totalViews: views._sum.views || 0,
        totalInquiries: inquiries._sum.inquiryCount || 0,
        availableBalance: req.creatorProfile.availableBalance,
        complianceScore: req.creatorProfile.complianceScore,
      };

      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Admin routes for managing content creators

// @route   GET /api/v1/content-creators/admin/all
// @desc    Get all content creators (admin only)
// @access  Private (Admin)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const prisma = getPrismaClient();

      const where = {};
      if (status) where.enrollmentStatus = status;
      if (search) {
        where.user = {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [creators, totalCount] = await Promise.all([
        prisma.contentCreatorProfile.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                createdAt: true,
              },
            },
            violations: {
              where: { isResolved: false },
              take: 5,
            },
          },
        }),
        prisma.contentCreatorProfile.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / parseInt(limit));

      res.status(200).json({
        status: "success",
        data: creators,
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
  }
);

// @route   PUT /api/v1/content-creators/admin/:id/status
// @desc    Update content creator enrollment status (admin only)
// @access  Private (Admin)
router.put(
  "/admin/:id/status",
  authenticateToken,
  requireAdmin,
  [
    body("status")
      .isIn(["APPROVED", "REJECTED", "SUSPENDED", "TERMINATED"])
      .withMessage("Invalid status"),
    body("reason").optional().isString().withMessage("Reason must be a string"),
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
      const { status, reason } = req.body;
      const prisma = getPrismaClient();

      const profile = await prisma.contentCreatorProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!profile) {
        return res.status(404).json({
          status: "error",
          message: "Content creator profile not found",
        });
      }

      // Update status
      const updatedProfile = await prisma.contentCreatorProfile.update({
        where: { id },
        data: {
          enrollmentStatus: status,
          updatedAt: new Date(),
        },
      });

      // If rejected or terminated, update user role back to USER
      if (status === "REJECTED" || status === "TERMINATED") {
        await prisma.user.update({
          where: { id: profile.userId },
          data: { role: "USER" },
        });
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId: profile.userId,
          type: "SYSTEM_UPDATE",
          title: `Content Creator Status Updated`,
          message: `Your content creator status has been updated to ${status}. ${
            reason ? `Reason: ${reason}` : ""
          }`,
          status: "UNREAD",
        },
      });

      res.status(200).json({
        status: "success",
        message: "Content creator status updated successfully",
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
