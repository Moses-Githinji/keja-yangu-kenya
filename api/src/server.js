import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

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

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { authenticateToken } from "./middleware/auth.js";

// Import database connection
import connectDB from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
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
const corsOrigins = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:3001",
];
console.log("🔧 CORS Origins configured:", corsOrigins);

// Enable proper CORS handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        ...(process.env.CORS_ORIGIN?.split(",") || []),
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log(`🚫 CORS blocked origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
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

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "KejaYangu API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, authenticateToken, userRoutes);
app.use(`/api/${API_VERSION}/properties`, propertyRoutes);
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

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join property-specific room for real-time updates
  socket.on("join-property", (propertyId) => {
    socket.join(`property-${propertyId}`);
    console.log(`User ${socket.id} joined property ${propertyId}`);
  });

  // Join agent-specific room
  socket.on("join-agent", (agentId) => {
    socket.join(`agent-${agentId}`);
    console.log(`User ${socket.id} joined agent ${agentId}`);
  });

  // Handle chat messages
  socket.on("send-message", (data) => {
    // Broadcast message to appropriate room
    socket.to(`property-${data.propertyId}`).emit("new-message", data);
  });

  // Handle property view updates
  socket.on("property-view", (propertyId) => {
    socket.to(`property-${propertyId}`).emit("property-viewed", {
      propertyId,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
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
