import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Validation for notification creation
const validateNotification = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("type")
    .isIn(["EMAIL", "SMS", "PUSH", "SYSTEM"])
    .withMessage("Invalid notification type"),
  body("metadata").optional().isString().withMessage("Metadata must be a string"),
];

// @route   GET /api/v1/notifications
// @desc    Get user's notifications
// @access  Private
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const prisma = getPrismaClient();

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          status: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: notifications,
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

// @route   GET /api/v1/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get("/unread-count", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        status: "UNREAD",
      },
    });

    res.status(200).json({
      status: "success",
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });
    }

    await prisma.notification.update({
      where: { id },
      data: { 
        status: "READ",
        readAt: new Date()
      },
    });

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        status: "UNREAD",
      },
      data: { 
        status: "READ",
        readAt: new Date()
      },
    });

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/notifications/clear-read
// @desc    Clear all read notifications
// @access  Private
router.delete("/clear-read", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    await prisma.notification.deleteMany({
      where: {
        userId: req.user.id,
        status: "READ",
      },
    });

    res.status(200).json({
      status: "success",
      message: "All read notifications cleared",
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/notifications
// @desc    Create a new notification (Admin only)
// @access  Private (Admin)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateNotification,
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

      const { title, message, type, metadata, userIds } = req.body;
      const prisma = getPrismaClient();

      if (userIds && Array.isArray(userIds)) {
        // Send to specific users
        const notifications = await Promise.all(
          userIds.map((userId) =>
            prisma.notification.create({
              data: {
                title,
                message,
                type,
                metadata: metadata || null,
                userId,
              },
            })
          )
        );

        res.status(201).json({
          status: "success",
          message: `Notification sent to ${notifications.length} users`,
          data: { notifications },
        });
      } else {
        // Send to all users
        const users = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true },
        });

        const notifications = await Promise.all(
          users.map((user) =>
            prisma.notification.create({
              data: {
                title,
                message,
                type,
                metadata: metadata || null,
                userId: user.id,
              },
            })
          )
        );

        res.status(201).json({
          status: "success",
          message: `Notification sent to all ${notifications.length} users`,
          data: { notifications },
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
