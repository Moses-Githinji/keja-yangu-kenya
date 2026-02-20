import express from "express";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Basic health check
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "KejaYangu API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Detailed health check
router.get("/detailed", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const health = {
      status: "success",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      services: {},
    };

    // Database health check
    try {
      await prisma.$queryRaw`SELECT 1`;
      health.services.database = {
        status: "healthy",
        message: "Database connection successful",
      };
    } catch (error) {
      health.services.database = {
        status: "unhealthy",
        message: `Database connection failed: ${error.message}`,
      };
      health.status = "degraded";
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    health.services.memory = {
      status:
        memUsage.heapUsed / memUsage.heapTotal > 0.9 ? "warning" : "healthy",
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
      percentage:
        Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) + "%",
    };

    // Uptime
    health.services.uptime = {
      status: "healthy",
      uptime: Math.round(process.uptime()) + " seconds",
    };

    res.status(health.status === "success" ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Payment system health check
router.get("/payments", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    const health = {
      status: "success",
      timestamp: new Date().toISOString(),
      payment_system: {},
    };

    // Check payment database connectivity
    try {
      const paymentCount = await prisma.payment.count();
      health.payment_system.database = {
        status: "healthy",
        message: "Payment database accessible",
        total_payments: paymentCount,
      };
    } catch (error) {
      health.payment_system.database = {
        status: "unhealthy",
        message: `Payment database error: ${error.message}`,
      };
      health.status = "error";
    }

    // Check recent payment activity
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentPayments = await prisma.payment.count({
        where: {
          createdAt: {
            gte: oneHourAgo,
          },
        },
      });

      health.payment_system.recent_activity = {
        status: "healthy",
        message: "Recent payment activity checked",
        payments_last_hour: recentPayments,
      };
    } catch (error) {
      health.payment_system.recent_activity = {
        status: "error",
        message: `Failed to check recent activity: ${error.message}`,
      };
      health.status = "error";
    }

    // Check payment success rate (last 24 hours)
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [totalPayments, successfulPayments] = await Promise.all([
        prisma.payment.count({
          where: { createdAt: { gte: twentyFourHoursAgo } },
        }),
        prisma.payment.count({
          where: {
            createdAt: { gte: twentyFourHoursAgo },
            status: "COMPLETED",
          },
        }),
      ]);

      const successRate =
        totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      health.payment_system.success_rate = {
        status:
          successRate >= 95
            ? "healthy"
            : successRate >= 90
            ? "warning"
            : "error",
        message: `Payment success rate: ${successRate.toFixed(1)}%`,
        total_payments_24h: totalPayments,
        successful_payments_24h: successfulPayments,
        success_rate_percentage: successRate.toFixed(1),
      };

      if (successRate < 90) {
        health.status = "error";
      }
    } catch (error) {
      health.payment_system.success_rate = {
        status: "error",
        message: `Failed to calculate success rate: ${error.message}`,
      };
      health.status = "error";
    }

    // Check payment gateway configurations
    health.payment_system.gateways = {};

    // M-Pesa check
    if (process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET) {
      health.payment_system.gateways.mpesa = {
        status: "configured",
        message: "M-Pesa credentials configured",
      };
    } else {
      health.payment_system.gateways.mpesa = {
        status: "not_configured",
        message: "M-Pesa credentials not configured",
      };
    }

    // Stripe check
    if (process.env.STRIPE_SECRET_KEY) {
      health.payment_system.gateways.stripe = {
        status: "configured",
        message: "Stripe credentials configured",
      };
    } else {
      health.payment_system.gateways.stripe = {
        status: "not_configured",
        message: "Stripe credentials not configured",
      };
    }

    // Flutterwave check
    if (process.env.FLUTTERWAVE_SECRET_KEY) {
      health.payment_system.gateways.flutterwave = {
        status: "configured",
        message: "Flutterwave credentials configured",
      };
    } else {
      health.payment_system.gateways.flutterwave = {
        status: "not_configured",
        message: "Flutterwave credentials not configured",
      };
    }

    // Determine overall payment system status
    const gatewayStatuses = Object.values(health.payment_system.gateways).map(
      (g) => g.status
    );
    if (gatewayStatuses.every((status) => status === "not_configured")) {
      health.payment_system.overall_status = "error";
      health.payment_system.message = "No payment gateways configured";
      health.status = "error";
    } else if (gatewayStatuses.includes("configured")) {
      health.payment_system.overall_status = "healthy";
      health.payment_system.message = "At least one payment gateway configured";
    } else {
      health.payment_system.overall_status = "warning";
      health.payment_system.message =
        "Payment gateway configuration incomplete";
    }

    res.status(health.status === "success" ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Payment health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Readiness check (for Kubernetes/load balancers)
router.get("/ready", async (req, res) => {
  try {
    const prisma = getPrismaClient();
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ready",
      message: "Service is ready to accept traffic",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      message: "Service is not ready",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check (for Kubernetes)
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "alive",
    message: "Service is alive",
    timestamp: new Date().toISOString(),
  });
});

export default router;
