import express from "express";
import { body, param, validationResult } from "express-validator";
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
  body("data").optional().isString().withMessage("Data must be a string"),
];

// Helper to clear notification cache
const clearNotificationCache = async (userId = null) => {
  try {
    const redisClient = getRedisClient();
    if (userId) {
      await redisClient.del(`user_notifications:${userId}`);
      await redisClient.del(`unread_count:${userId}`);
    }
    console.log("Notification cache cleared.");
  } catch (error) {
    console.warn("Failed to clear notification cache:", error.message);
  }
};

// @route   GET /api/v1/notifications
// @desc    Get user's notifications
// @access  Private
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const prisma = getPrismaClient();

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === "true";

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
          isRead: true,
          data: true,
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
    const redisClient = getRedisClient();
    const cacheKey = `unread_count:${req.user.id}`;
    const cachedCount = await redisClient.get(cacheKey);

    if (cachedCount) {
      return res.status(200).json({
        status: "success",
        data: { unreadCount: parseInt(cachedCount) },
      });
    }

    const prisma = getPrismaClient();
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    // Cache for 5 minutes
    await redisClient.setEx(cacheKey, 300, unreadCount.toString());

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
      data: { isRead: true },
    });

    await clearNotificationCache(req.user.id);

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
        isRead: false,
      },
      data: { isRead: true },
    });

    await clearNotificationCache(req.user.id);

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

    await clearNotificationCache(req.user.id);

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
        isRead: true,
      },
    });

    await clearNotificationCache(req.user.id);

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

      const { title, message, type, data, userIds } = req.body;
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
                data: data || null,
                userId,
              },
            })
          )
        );

        // Clear cache for affected users
        await Promise.all(
          userIds.map((userId) => clearNotificationCache(userId))
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
                data: data || null,
                userId: user.id,
              },
            })
          )
        );

        // Clear cache for all users
        await Promise.all(users.map((user) => clearNotificationCache(user.id)));

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

// @route   POST /api/v1/notifications/bulk
// @desc    Send bulk notifications (Admin only)
// @access  Private (Admin)
router.post(
  "/bulk",
  authenticateToken,
  requireAdmin,
  [
    body("notifications")
      .isArray({ min: 1 })
      .withMessage("Notifications array is required"),
    body("notifications.*.title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("notifications.*.message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("notifications.*.type")
      .isIn(["EMAIL", "SMS", "PUSH", "SYSTEM"])
      .withMessage("Invalid notification type"),
    body("notifications.*.userIds")
      .optional()
      .isArray()
      .withMessage("User IDs must be an array"),
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

      const { notifications } = req.body;
      const prisma = getPrismaClient();

      const results = [];
      const affectedUsers = new Set();

      for (const notification of notifications) {
        const { title, message, type, data, userIds } = notification;

        if (userIds && Array.isArray(userIds)) {
          // Send to specific users
          const createdNotifications = await Promise.all(
            userIds.map((userId) =>
              prisma.notification.create({
                data: {
                  title,
                  message,
                  type,
                  data: data || null,
                  userId,
                },
              })
            )
          );

          userIds.forEach((userId) => affectedUsers.add(userId));
          results.push({
            title,
            sentTo: userIds.length,
            notifications: createdNotifications,
          });
        } else {
          // Send to all users
          const users = await prisma.user.findMany({
            where: { isActive: true },
            select: { id: true },
          });

          const createdNotifications = await Promise.all(
            users.map((user) =>
              prisma.notification.create({
                data: {
                  title,
                  message,
                  type,
                  data: data || null,
                  userId: user.id,
                },
              })
            )
          );

          users.forEach((user) => affectedUsers.add(user.id));
          results.push({
            title,
            sentTo: users.length,
            notifications: createdNotifications,
          });
        }
      }

      // Clear cache for affected users
      await Promise.all(
        Array.from(affectedUsers).map((userId) =>
          clearNotificationCache(userId)
        )
      );

      res.status(201).json({
        status: "success",
        message: `Bulk notifications sent successfully`,
        data: { results, totalUsersAffected: affectedUsers.size },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
