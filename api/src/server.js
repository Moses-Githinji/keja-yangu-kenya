import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import apicache from "apicache";

// Import logger
import logger, { stream } from "./config/logger.js";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import propertyRoutes from "./routes/properties.js";
import agentRoutes from "./routes/agents.js";
import searchRoutes from "./routes/search.js";
import chatRoutes from "./routes/chat.js";
import paymentRoutes from "./routes/payments.js";
import notificationRoutes from "./routes/notifications.js";
import uploadRoutes from "./routes/upload.js";
import contentCreatorRoutes from "./routes/content-creators.js";
import briefStayRoutes from "./routes/brief-stay.js";
import healthRoutes from "./routes/health.js";
import adminRoutes from "./routes/admin.js";
import ussdRoutes from "./routes/ussd.js";

// Import specific payment functions for public routes
import { handleMpesaCallback } from "./services/paymentService.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authenticateToken } from "./middleware/auth.js";

// Import database connection
import connectDB, { getPrismaClient } from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
app.set("trust proxy", 1); // Trust the first proxy (ngrok, Vercel, etc.)
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3001", "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || "v1";

// Connect to databases
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.mapbox.com", "wss:", "ws:"],
      },
    },
  })
);

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];

// Remove any empty strings from the origins array
const corsOrigins = allowedOrigins.filter(
  (origin) => origin && origin.trim() !== ""
);
console.log("🔧 CORS Origins configured:", corsOrigins);

// Enable proper CORS handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is allowed
      if (corsOrigins.includes(origin) || corsOrigins.includes("*")) {
        console.log(`✅ Allowed CORS request from: ${origin}`);
        return callback(null, true);
      }

      // Log blocked origins for debugging
      console.warn(`🚫 Blocked CORS request from: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Accept",
    ],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Handle preflight requests explicitly
app.options("*", cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize API Cache
const cache = apicache.middleware;
const onlyStatus200 = (req, res) => res.statusCode === 200;
const cacheOptions = {
  statusCodes: {
    include: [200]
  }
};

// URL Normalization (Strip double slashes)
app.use((req, res, next) => {
  if (req.url.includes("//")) {
    req.url = req.url.replace(/\/+/g, "/");
  }
  next();
});

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan("combined", { stream }));

// Health check routes
app.use("/health", healthRoutes);

// M-Pesa callback endpoint (public - called by M-Pesa)
app.post(
  `/api/${API_VERSION}/payments/mpesa-callback`,
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      console.log("M-Pesa callback received at:", new Date().toISOString());

      // Parse JSON body since we used raw middleware
      const callbackData = JSON.parse(req.body);

      // Basic validation of callback data
      if (!callbackData.Body || !callbackData.Body.stkCallback) {
        console.error("Invalid callback data structure");
        return res.status(400).json({
          status: "error",
          message: "Invalid callback data",
        });
      }

      const result = await handleMpesaCallback(callbackData);

      if (result.success) {
        res.status(200).json({
          status: "success",
          message: "Callback processed successfully",
        });
      } else {
        console.error("Callback processing failed:", result.error);
        res.status(500).json({
          status: "error",
          message: "Callback processing failed",
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error in M-Pesa callback:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, authenticateToken, userRoutes);
app.use(`/api/${API_VERSION}/properties`, cache("5 minutes", onlyStatus200), propertyRoutes);
app.use(`/api/${API_VERSION}/agents`, agentRoutes);
app.use(`/api/${API_VERSION}/search`, searchRoutes);
app.use(`/api/${API_VERSION}/chat`, authenticateToken, chatRoutes);
app.use(`/api/${API_VERSION}/payments`, authenticateToken, paymentRoutes);
app.use(
  `/api/${API_VERSION}/notifications`,
  authenticateToken,
  notificationRoutes
);
app.use(`/api/${API_VERSION}/upload`, authenticateToken, uploadRoutes);
app.use(`/api/${API_VERSION}/content-creators`, contentCreatorRoutes);
app.use(`/api/${API_VERSION}/brief-stay`, briefStayRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/internal/ussd`, ussdRoutes);

// Socket.IO Middleware for Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new Error("Authentication error: Token required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});


// Socket.IO connection handling
io.on("connection", async (socket) => {
  const userId = socket.user?.userId;
  console.log(`User connected: ${socket.id} (UserId: ${userId || "Unknown"})`);

  const prisma = getPrismaClient();

  // 1. Update Online Status (if authenticated)
  if (userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });
      
      socket.broadcast.emit("user-online", { userId });
      socket.join(`user-${userId}`);
      console.log(`User ${userId} is now Online`);
    } catch (error) {
      console.error(`Failed to update online status for ${userId}:`, error.message);
    }
  }

  // Join conversation room
  socket.on("join-conversation", (chatId) => {
    socket.join(`conversation-${chatId}`);
    console.log(`User ${socket.id} joined conversation-${chatId}`);
  });

  // Join property-specific room
  socket.on("join-property", (propertyId) => {
    socket.join(`property-${propertyId}`);
  });

  // Join agent-specific room
  socket.on("join-agent", (agentId) => {
    socket.join(`agent-${agentId}`);
  });

  // Handle chat messages
  socket.on("send-message", (data) => {
    // API handles persistence and broadcasting, this is a fallback/echo if needed
  });

  // 2. Typing Events
  socket.on("typing-start", ({ chatId }) => {
    if (userId) {
      socket.to(`conversation-${chatId}`).emit("user-typing", {
        userId,
        chatId,
      });
    }
  });

  socket.on("typing-stop", ({ chatId }) => {
    if (userId) {
      socket.to(`conversation-${chatId}`).emit("user-stopped-typing", {
        userId,
        chatId,
      });
    }
  });

  // Handle property view updates
  socket.on("property-view", (propertyId) => {
    socket.to(`property-${propertyId}`).emit("property-viewed", {
      propertyId,
      timestamp: new Date(),
    });
  });

  // 3. Message Delivery Status
  socket.on("message-delivered", async ({ messageId, chatId }) => {
    if (userId) {
      try {
        const message = await prisma.message.update({
          where: { id: messageId },
          data: { 
            isDelivered: true,
            deliveredAt: new Date() 
          },
          include: {
            chat: {
              select: { userId: true, agentId: true }
            }
          }
        });

        // Notify the sender (if they are online)
        const recipientId = message.senderId;
        socket.to(`user-${recipientId}`).emit("message-status-update", {
          messageId,
          chatId,
          status: "delivered",
          deliveredAt: message.deliveredAt
        });
      } catch (error) {
        console.error(`Failed to update delivery status for message ${messageId}:`, error.message);
      }
    }
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // 3. Update Offline Status
    if (userId) {
      try {
        const lastSeen = new Date();
        await prisma.user.update({
          where: { id: userId },
          data: { 
            isOnline: false,
            lastSeen 
          },
        });
        
        socket.broadcast.emit("user-offline", { userId, lastSeen });
        console.log(`User ${userId} is now Offline`);
      } catch (error) {
         console.error(`Failed to update offline status for ${userId}:`, error.message);
      }
    }
  });
});

// Make io available to routes
app.set("io", io);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 KejaYangu API server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Version: ${API_VERSION}`);
  console.log(
    `🌍 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3001"}`
  );
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(
    `📚 API Documentation: http://localhost:${PORT}/api/${API_VERSION}/docs`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});



export default app;
