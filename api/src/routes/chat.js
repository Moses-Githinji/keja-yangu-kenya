import express from "express";
import { body, query, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Validation for sending a message
const validateMessage = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message content must be between 1 and 2000 characters"),
];

// Validation for starting a chat
const validateStartChat = [
  body("agentId").isString().withMessage("Agent ID is required"),
  body("propertyId").optional().isString(),
];

// @route   POST /api/v1/chat
// @desc    Create or retrieve an existing chat conversation
// @access  Private
router.post(
  "/",
  authenticateToken,
  validateStartChat,
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

      const { agentId, propertyId } = req.body;
      const userId = req.user.id;
      const prisma = getPrismaClient();

      // Ensure user is not chatting with themselves
      if (userId === agentId) {
        return res.status(400).json({
          status: "error",
          message: "You cannot start a chat with yourself",
        });
      }

      // Check if chat already exists
      let chat = await prisma.chat.findFirst({
        where: {
            userId,
            agentId,
            propertyId: propertyId || null, 
        },
        include: {
          agent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              images: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
      });

      if (chat) {
        return res.status(200).json({
          status: "success",
          data: chat,
        });
      }

      // Create new chat
      // Note: We need to verify that 'agentId' corresponds to a valid user, 
      // but the foreign key constraint will handle that (throwing an error if invalid).
      // Same for propertyId.
      
      try {
        chat = await prisma.chat.create({
            data: {
              userId,
              agentId,
              propertyId: propertyId || null,
            },
            include: {
              agent: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  isOnline: true,
                  lastSeen: true,
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  isOnline: true,
                  lastSeen: true,
                },
              },
              property: {
                select: {
                  id: true,
                  title: true,
                  images: {
                    where: { isPrimary: true },
                    select: { url: true },
                    take: 1,
                  },
                },
              },
            },
          });
      } catch (dbError) {
          // Check for foreign key constraint failures (e.g. invalid agentId or propertyId)
          if (dbError.code === 'P2003') {
               return res.status(400).json({
                  status: "error",
                  message: "Invalid agentId or propertyId provided.",
              });
          }
          throw dbError;
      }

      res.status(201).json({
        status: "success",
        message: "Chat created successfully",
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/chat
// @desc    List user's conversations
// @access  Private
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const prisma = getPrismaClient();

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ userId: userId }, { agentId: userId }],
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            images: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1
            }
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: chats.length,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/chat/:id/messages
// @desc    Get message history for a chat
// @access  Private
router.get("/:id/messages", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const prisma = getPrismaClient();

    // Verify user is participant
    const chat = await prisma.chat.findUnique({
      where: { id },
      select: { userId: true, agentId: true },
    });

    if (!chat) {
        return res.status(404).json({ status: "error", message: "Chat not found" });
    }

    if (chat.userId !== req.user.id && chat.agentId !== req.user.id) {
      return res.status(403).json({
        status: "error",
        message: "You are not creating authorized to view this chat",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { chatId: id },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
        include: {
            sender: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            }
        }
      }),
      prisma.message.count({ where: { chatId: id } }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: {
        messages: messages.reverse(), // Return oldest first for UI
        pagination: {
          totalDocs: totalCount,
          limit: parseInt(limit),
          totalPages,
          page: parseInt(page),
          hasPrevPage: parseInt(page) > 1,
          hasNextPage: parseInt(page) < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/chat/:id/messages
// @desc    Send a message
// @access  Private
router.post(
  "/:id/messages",
  authenticateToken,
  validateMessage,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
            status: "error",
             message: "Validation failed", 
             errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      const prisma = getPrismaClient();

      // Verify user is participant
      const chat = await prisma.chat.findUnique({
        where: { id },
      });

      if (!chat) {
        return res.status(404).json({ status: "error", message: "Chat not found" });
      }

      if (chat.userId !== userId && chat.agentId !== userId) {
        return res.status(403).json({
          status: "error",
          message: "You are not authorized to send messages to this chat",
        });
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          chatId: id,
          senderId: userId,
          content,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    firstName: true,
                     lastName: true,
                     avatar: true
                }
            }
        }
      });

      // Update chat's updatedAt timestamp
      await prisma.chat.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to(`conversation-${id}`).emit("new-message", {
          message,
          chatId: id,
        });
      }

      res.status(201).json({
        status: "success",
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/chat/unread-count
// @desc    Get total unread message count for the user
// @access  Private
router.get("/unread-count", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const prisma = getPrismaClient();

    const count = await prisma.message.count({
      where: {
        chat: {
          OR: [{ userId: userId }, { agentId: userId }],
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    res.status(200).json({
      status: "success",
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/chat/:id/read-all
// @desc    Mark all messages in a conversation as read
// @access  Private
router.put("/:id/read-all", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const prisma = getPrismaClient();

    // Verify participant
    const chat = await prisma.chat.findUnique({
      where: { id },
      select: { userId: true, agentId: true },
    });

    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat not found" });
    }

    if (chat.userId !== userId && chat.agentId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to access this chat",
      });
    }

    await prisma.message.updateMany({
      where: {
        chatId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    res.status(200).json({
      status: "success",
      message: "All messages marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/chat/:id
// @desc    Delete a conversation
// @access  Private
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const prisma = getPrismaClient();

    const chat = await prisma.chat.findUnique({
      where: { id },
      select: { userId: true, agentId: true },
    });

    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat not found" });
    }

    if (chat.userId !== userId && chat.agentId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to delete this chat",
      });
    }

    await prisma.chat.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/chat/:id/messages/delivered
// @desc    Mark all messages in a conversation as delivered
// @access  Private
router.put("/:id/messages/delivered", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const prisma = getPrismaClient();

    // Verify participant
    const chat = await prisma.chat.findUnique({
      where: { id },
      select: { userId: true, agentId: true },
    });

    if (!chat) {
      return res.status(404).json({ status: "error", message: "Chat not found" });
    }

    if (chat.userId !== userId && chat.agentId !== userId) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to access this chat",
      });
    }

    const now = new Date();
    await prisma.message.updateMany({
      where: {
        chatId: id,
        senderId: { not: userId },
        isDelivered: false,
      },
      data: { 
        isDelivered: true,
        deliveredAt: now
      },
    });

    res.status(200).json({
      status: "success",
      message: "Messages marked as delivered",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
