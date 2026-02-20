import jwt from "jsonwebtoken";
import { getPrismaClient } from "../config/database.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token is required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists using Prisma
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        avatar: true,
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
      return res.status(401).json({
        status: "error",
        message: "User no longer exists",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "User account is deactivated",
      });
    }

    // Add user info to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token has expired",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      status: "error",
      message: "Authentication failed",
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            avatar: true,
          },
        });

        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // Token is invalid, but don't fail the request
        console.warn("Invalid token in optional auth:", error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Agent-specific middleware
export const requireAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "AGENT" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      status: "error",
      message: "Agent access required",
    });
  }

  next();
};

// Host-specific middleware
export const requireHost = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "HOST" && req.user.role !== "ADMIN") {
    return res.status(403).json({
      status: "error",
      message: "Host access required",
    });
  }

  next();
};

// Admin-only middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required",
    });
  }

  next();
};

// Property ownership verification
export const requirePropertyOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const { propertyId } = req.params;

    // Admin can access all properties
    if (req.user.role === "ADMIN") {
      return next();
    }

    // Check if user owns the property or is the agent using Prisma
    const prisma = getPrismaClient();
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        ownerId: true,
        agentId: true,
      },
    });

    if (!property) {
      return res.status(404).json({
        status: "error",
        message: "Property not found",
      });
    }

    if (property.ownerId === req.user.id || property.agentId === req.user.id) {
      return next();
    }

    return res.status(403).json({
      status: "error",
      message: "Access denied to this property",
    });
  } catch (error) {
    console.error("Property ownership verification error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
