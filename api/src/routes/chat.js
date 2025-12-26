import express from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Validation for chat messages
const validateMessage = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message content must be between 1 and 1000 characters"),
  body("conversationId").isString().withMessage("Conversation ID is required"),
];

// Helper to clear chat cache
const clearChatCache = async (conversationId = null) => {
  try {
    const redisClient = getRedisClient();
    if (conversationId) {
      await redisClient.del(`conversation:${conversationId}`);
      await redisClient.del(`conversation_messages:${conversationId}`);
    }
    console.log("Chat cache cleared.");
  } catch (error) {
    console.warn("Failed to clear chat cache:", error.message);
  }
};

// @route   GET /api/v1/chat/conversations
// @desc    Get user's conversations
// @access  Private
router.get("/conversations", authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const prisma = getPrismaClient();

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [conversations, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { lastMessageAt: "desc" },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              images: {
                where: { isPrimary: true },
                select: { url: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              content: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      prisma.conversation.count({ where: { userId: req.user.id } }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: conversations,
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

// @route   GET /api/v1/chat/conversations/:id
// @desc    Get conversation by ID with messages
// @access  Private
router.get("/conversations/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const prisma = getPrismaClient();

    // Check if user is part of this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { userId: req.user.id },
          { property: { ownerId: req.user.id } },
          { property: { agentId: req.user.id } },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ status: "error", message: "Conversation not found" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.message.count({ where: { conversationId: id } }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        conversation,
        messages: messages.reverse(), // Reverse to show oldest first
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
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/chat/conversations
// @desc    Create a new conversation
// @access  Private
router.post(
  "/conversations",
  authenticateToken,
  [
    body("propertyId").isString().withMessage("Property ID is required"),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title cannot exceed 200 characters"),
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

      const { propertyId, title } = req.body;
      const prisma = getPrismaClient();

      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return res
          .status(404)
          .json({ status: "error", message: "Property not found" });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          userId: req.user.id,
          propertyId,
        },
      });

      if (existingConversation) {
        return res.status(400).json({
          status: "error",
          message: "Conversation already exists for this property",
        });
      }

      // Create conversation
      const conversation = await prisma.conversation.create({
        data: {
          title: title || `Inquiry about ${property.title}`,
          userId: req.user.id,
          propertyId,
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              images: {
                where: { isPrimary: true },
                select: { url: true },
              },
            },
          },
        },
      });

      res.status(201).json({
        status: "success",
        message: "Conversation created successfully",
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/v1/chat/messages
// @desc    Send a message in a conversation
// @access  Private
router.post(
  "/messages",
  authenticateToken,
  validateMessage,
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

      const { content, conversationId } = req.body;
      const prisma = getPrismaClient();

      // Check if conversation exists and user is part of it
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { userId: req.user.id },
            { property: { ownerId: req.user.id } },
            { property: { agentId: req.user.id } },
          ],
        },
      });

      if (!conversation) {
        return res
          .status(404)
          .json({ status: "error", message: "Conversation not found" });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          content,
          conversationId,
          senderId: req.user.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Update conversation last message time
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      });

      // Clear cache
      await clearChatCache(conversationId);

      // Emit to Socket.IO if available
      const io = req.app.get("io");
      if (io) {
        io.to(`conversation-${conversationId}`).emit("new-message", {
          message,
          conversationId,
        });
      }

      res.status(201).json({
        status: "success",
        message: "Message sent successfully",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/v1/chat/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put("/messages/:id/read", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    // Check if message exists and user is part of the conversation
    const message = await prisma.message.findFirst({
      where: {
        id,
        conversation: {
          OR: [
            { userId: req.user.id },
            { property: { ownerId: req.user.id } },
            { property: { agentId: req.user.id } },
          ],
        },
      },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ status: "error", message: "Message not found" });
    }

    // Mark message as read
    await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    await clearChatCache(message.conversation.id);

    res.status(200).json({
      status: "success",
      message: "Message marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/chat/unread-count
// @desc    Get unread message count for user
// @access  Private
router.get("/unread-count", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    const unreadCount = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { userId: req.user.id },
            { property: { ownerId: req.user.id } },
            { property: { agentId: req.user.id } },
          ],
        },
        senderId: { not: req.user.id },
        isRead: false,
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

// @route   DELETE /api/v1/chat/conversations/:id
// @desc    Delete a conversation
// @access  Private
router.delete(
  "/conversations/:id",
  authenticateToken,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const prisma = getPrismaClient();

      // Check if conversation exists and user is part of it
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!conversation) {
        return res
          .status(404)
          .json({ status: "error", message: "Conversation not found" });
      }

      // Delete conversation (cascades to messages)
      await prisma.conversation.delete({
        where: { id },
      });

      await clearChatCache(id);

      res.status(200).json({
        status: "success",
        message: "Conversation deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
