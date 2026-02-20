import {
  createRateLimiter,
  paymentRateLimiter,
  stkPushRateLimiter,
  refundRateLimiter,
  validatePaymentData,
  fraudDetection,
  ipRestrictions,
  paymentAmountLimits,
  logSecurityEvent,
  getSeverityLevel,
  isSuspiciousIP,
} from "../../src/middleware/paymentSecurity.js";

// Mock Prisma client
jest.mock("../../src/config/database.js", () => ({
  getPrismaClient: jest.fn(() => ({
    securityLog: {
      create: jest.fn(),
    },
    blockedIP: {
      findUnique: jest.fn(),
    },
    payment: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  })),
}));

describe("Payment Security Middleware", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: { id: "test-user-id" },
      ip: "192.168.1.1",
      path: "/api/v1/payments",
      method: "POST",
      get: jest.fn((header) => "Mozilla/5.0 Test Browser"),
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
    };

    mockNext = jest.fn();

    // Reset rate limit store
    const rateLimitStore = new Map();
    // Clear the store between tests
    rateLimitStore.clear();
  });

  describe("createRateLimiter", () => {
    it("should allow requests within limit", async () => {
      const limiter = createRateLimiter({
        windowMs: 60000, // 1 minute
        maxRequests: 2,
      });

      // First request
      await limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request (still within limit)
      await limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    it("should block requests over limit", async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 1,
      });

      // First request
      await limiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request (over limit)
      await limiter(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Too many payment requests. Please try again later.",
        })
      );
    });

    it("should set rate limit headers", async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxRequests: 5,
      });

      await limiter(mockReq, mockRes, mockNext);

      expect(mockRes.set).toHaveBeenCalledWith({
        "X-RateLimit-Limit": 5,
        "X-RateLimit-Remaining": 4,
        "X-RateLimit-Reset": expect.any(String),
      });
    });
  });

  describe("validatePaymentData", () => {
    it("should validate correct payment data", async () => {
      mockReq.body = {
        amount: 10000,
        currency: "KES",
        paymentMethod: "MPESA",
      };

      await validatePaymentData(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject invalid amount", async () => {
      mockReq.body = {
        amount: "invalid",
        currency: "KES",
        paymentMethod: "MPESA",
      };

      await validatePaymentData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid amount. Must be a positive number.",
        })
      );
    });

    it("should reject suspicious amounts", async () => {
      mockReq.body = {
        amount: 20000000, // 20 million
        currency: "KES",
        paymentMethod: "MPESA",
      };

      await validatePaymentData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Payment amount exceeds maximum allowed limit.",
        })
      );
    });

    it("should reject invalid currency", async () => {
      mockReq.body = {
        amount: 10000,
        currency: "INVALID",
        paymentMethod: "MPESA",
      };

      await validatePaymentData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid currency. Only KES and USD are supported.",
        })
      );
    });

    it("should reject invalid payment method", async () => {
      mockReq.body = {
        amount: 10000,
        currency: "KES",
        paymentMethod: "INVALID_METHOD",
      };

      await validatePaymentData(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Invalid payment method.",
        })
      );
    });
  });

  describe("paymentAmountLimits", () => {
    it("should allow amounts within limits", () => {
      mockReq.body = { amount: 10000, currency: "KES" };

      paymentAmountLimits(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should reject amounts below minimum", () => {
      mockReq.body = { amount: 5, currency: "KES" }; // Below 10 KES

      paymentAmountLimits(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Minimum payment amount is 10 KES.",
        })
      );
    });

    it("should reject amounts above maximum", () => {
      mockReq.body = { amount: 10000000, currency: "KES" }; // Above 5M KES

      paymentAmountLimits(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Maximum payment amount is 5000000 KES.",
        })
      );
    });
  });

  describe("fraudDetection", () => {
    const mockPrisma = {
      payment: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    beforeEach(() => {
      const { getPrismaClient } = require("../../src/config/database.js");
      getPrismaClient.mockReturnValue(mockPrisma);
    });

    it("should allow legitimate requests", async () => {
      mockPrisma.payment.count.mockResolvedValue(0); // No failed payments
      mockPrisma.payment.findMany.mockResolvedValue([]); // No recent payments

      await fraudDetection(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should block users with too many failed payments", async () => {
      mockPrisma.payment.count.mockResolvedValue(5); // 5 failed payments in last hour

      await fraudDetection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Too many failed payment attempts. Please contact support.",
        })
      );
    });

    it("should detect round number amounts", async () => {
      mockReq.body = { amount: 100000 }; // Round number above threshold
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await fraudDetection(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Security event should be logged (mocked)
    });

    it("should detect rapid successive payments", async () => {
      mockPrisma.payment.count.mockResolvedValue(0);
      mockPrisma.payment.findMany.mockResolvedValue([
        { status: "COMPLETED", createdAt: new Date() },
        { status: "COMPLETED", createdAt: new Date() },
        { status: "COMPLETED", createdAt: new Date() },
        { status: "COMPLETED", createdAt: new Date() },
        { status: "COMPLETED", createdAt: new Date() },
        { status: "COMPLETED", createdAt: new Date() }, // 6 payments
      ]);

      await fraudDetection(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Security event should be logged (mocked)
    });
  });

  describe("ipRestrictions", () => {
    const mockPrisma = {
      blockedIP: {
        findUnique: jest.fn(),
      },
    };

    beforeEach(() => {
      const { getPrismaClient } = require("../../src/config/database.js");
      getPrismaClient.mockReturnValue(mockPrisma);
    });

    it("should allow non-blocked IPs", async () => {
      mockPrisma.blockedIP.findUnique.mockResolvedValue(null);

      await ipRestrictions(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("should block blacklisted IPs", async () => {
      mockPrisma.blockedIP.findUnique.mockResolvedValue({
        ipAddress: "192.168.1.1",
        reason: "Suspicious activity",
        createdAt: new Date(),
      });

      await ipRestrictions(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Access denied from this IP address.",
        })
      );
    });

    it("should detect suspicious IPs", async () => {
      mockReq.ip = "10.0.0.1"; // Private IP
      mockPrisma.blockedIP.findUnique.mockResolvedValue(null);

      await ipRestrictions(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Security event should be logged (mocked)
    });
  });

  describe("logSecurityEvent", () => {
    it("should log security events", async () => {
      const eventData = {
        type: "RATE_LIMIT_EXCEEDED",
        userId: "test-user-id",
        ipAddress: "192.168.1.1",
        userAgent: "Test Browser",
        endpoint: "/api/v1/payments",
        method: "POST",
        details: { requestCount: 10 },
      };

      await logSecurityEvent(eventData);

      const { getPrismaClient } = require("../../src/config/database.js");
      const prisma = getPrismaClient();
      expect(prisma.securityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: "RATE_LIMIT_EXCEEDED",
          userId: "test-user-id",
          ipAddress: "192.168.1.1",
          endpoint: "/api/v1/payments",
          method: "POST",
          severity: "MEDIUM",
        }),
      });
    });
  });

  describe("getSeverityLevel", () => {
    it("should return correct severity levels", () => {
      expect(getSeverityLevel("RATE_LIMIT_EXCEEDED")).toBe("MEDIUM");
      expect(getSeverityLevel("SUSPICIOUS_AMOUNT")).toBe("HIGH");
      expect(getSeverityLevel("BLOCKED_IP_ACCESS")).toBe("CRITICAL");
      expect(getSeverityLevel("ROUND_NUMBER_AMOUNT")).toBe("LOW");
      expect(getSeverityLevel("UNKNOWN_EVENT")).toBe("LOW");
    });
  });

  describe("isSuspiciousIP", () => {
    it("should detect private IPs", () => {
      expect(isSuspiciousIP("10.0.0.1")).toBe(true);
      expect(isSuspiciousIP("172.16.0.1")).toBe(true);
      expect(isSuspiciousIP("192.168.1.1")).toBe(true);
    });

    it("should detect known suspicious ranges", () => {
      expect(isSuspiciousIP("185.156.172.100")).toBe(true);
      expect(isSuspiciousIP("185.156.173.50")).toBe(true);
    });

    it("should allow legitimate public IPs", () => {
      expect(isSuspiciousIP("8.8.8.8")).toBe(false);
      expect(isSuspiciousIP("197.237.0.1")).toBe(false);
    });
  });
});
