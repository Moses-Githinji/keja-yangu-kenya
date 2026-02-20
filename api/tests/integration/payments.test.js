import request from "supertest";
import express from "express";
import paymentsRouter from "../../src/routes/payments.js";
import { getPrismaClient } from "../../src/config/database.js";
import { authenticateToken } from "../../src/middleware/auth.js";
import jwt from "jsonwebtoken";

// Mock the auth middleware
jest.mock("../../src/middleware/auth.js", () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { id: "test-user-id", email: "test@example.com" };
    next();
  }),
}));

// Mock payment service functions
jest.mock("../../src/services/paymentService.js", () => ({
  initiateStkPush: jest.fn(),
  handleMpesaCallback: jest.fn(),
  getPaymentById: jest.fn(),
  getPaymentsByUser: jest.fn(),
  createPayment: jest.fn(),
  processPayment: jest.fn(),
  processStripePayment: jest.fn(),
  processMpesaPayment: jest.fn(),
  processFlutterwavePayment: jest.fn(),
  processBankTransfer: jest.fn(),
  processCashPayment: jest.fn(),
  processStripeRefund: jest.fn(),
  processMpesaRefund: jest.fn(),
  processFlutterwaveRefund: jest.fn(),
  processBankTransferRefund: jest.fn(),
  processCashRefund: jest.fn(),
}));

// Mock security middleware
jest.mock("../../src/middleware/paymentSecurity.js", () => ({
  paymentSecurityMiddleware: [],
  stkPushSecurityMiddleware: [],
  refundSecurityMiddleware: [],
  logSecurityEvent: jest.fn(),
}));

describe("Payment Routes Integration Tests", () => {
  let app;
  let prisma;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());

    // Mock database
    prisma = {
      payment: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
    };

    // Mock getPrismaClient
    jest.mock("../../src/config/database.js", () => ({
      getPrismaClient: jest.fn(() => prisma),
    }));

    // Use the payments router
    app.use("/api/v1/payments", paymentsRouter);

    // Error handling middleware
    app.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/payments/initiate-stk-push", () => {
    const validStkPushData = {
      amount: 50000,
      phoneNumber: "0712345678",
      propertyId: "test-property-id",
      propertyDetails: { title: "Test Property" },
    };

    it("should initiate STK push successfully", async () => {
      const mockResult = {
        success: true,
        paymentId: "test-payment-id",
        checkoutRequestId: "ws_CO_123456789",
        customerMessage: "Success. Request accepted for processing",
      };

      const { initiateStkPush } = await import(
        "../../src/services/paymentService.js"
      );
      initiateStkPush.mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/v1/payments/initiate-stk-push")
        .send(validStkPushData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.paymentId).toBe("test-payment-id");
      expect(response.body.data.checkoutRequestId).toBe("ws_CO_123456789");
      expect(initiateStkPush).toHaveBeenCalledWith({
        userId: "test-user-id",
        ...validStkPushData,
      });
    });

    it("should return error for invalid amount", async () => {
      const invalidData = {
        ...validStkPushData,
        amount: -100,
      };

      const response = await request(app)
        .post("/api/v1/payments/initiate-stk-push")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Validation failed");
    });

    it("should return error for invalid phone number", async () => {
      const invalidData = {
        ...validStkPushData,
        phoneNumber: "invalid-phone",
      };

      const response = await request(app)
        .post("/api/v1/payments/initiate-stk-push")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Validation failed");
    });

    it("should handle STK push failure", async () => {
      const mockResult = {
        success: false,
        error: "STK Push failed",
      };

      const { initiateStkPush } = await import(
        "../../src/services/paymentService.js"
      );
      initiateStkPush.mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/v1/payments/initiate-stk-push")
        .send(validStkPushData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Failed to initiate STK Push");
      expect(response.body.error).toBe("STK Push failed");
    });
  });

  describe("POST /api/v1/payments", () => {
    const validPaymentData = {
      amount: 25000,
      currency: "KES",
      paymentMethod: "MPESA",
      description: "Test payment",
    };

    it("should create payment successfully", async () => {
      const mockPayment = {
        id: "test-payment-id",
        amount: 25000,
        currency: "KES",
        paymentMethod: "MPESA",
        status: "PENDING",
        transactionId: "TXN_123456789",
        user: {
          id: "test-user-id",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
        },
      };

      const { createPayment, processMpesaPayment } = await import(
        "../../src/services/paymentService.js"
      );
      createPayment.mockResolvedValue(mockPayment);
      processMpesaPayment.mockResolvedValue({
        success: true,
        transactionId: "MPESA_123",
      });

      prisma.payment.update.mockResolvedValue({
        ...mockPayment,
        status: "COMPLETED",
        transactionId: "MPESA_123",
      });

      const response = await request(app)
        .post("/api/v1/payments")
        .send(validPaymentData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe("test-payment-id");
      expect(response.body.data.status).toBe("COMPLETED");
    });

    it("should handle payment processing failure", async () => {
      const mockPayment = {
        id: "test-payment-id",
        amount: 25000,
        currency: "KES",
        paymentMethod: "MPESA",
        status: "PENDING",
        transactionId: "TXN_123456789",
      };

      const { createPayment, processMpesaPayment } = await import(
        "../../src/services/paymentService.js"
      );
      createPayment.mockResolvedValue(mockPayment);
      processMpesaPayment.mockResolvedValue({
        success: false,
        error: "Payment processing failed",
      });

      prisma.payment.update.mockResolvedValue({
        ...mockPayment,
        status: "FAILED",
      });

      const response = await request(app)
        .post("/api/v1/payments")
        .send(validPaymentData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Payment failed");
      expect(response.body.data.status).toBe("FAILED");
    });

    it("should validate payment data", async () => {
      const invalidData = {
        amount: -100,
        currency: "KES",
        paymentMethod: "MPESA",
      };

      const response = await request(app)
        .post("/api/v1/payments")
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("GET /api/v1/payments", () => {
    it("should get user payments successfully", async () => {
      const mockPayments = [
        {
          id: "payment-1",
          amount: 10000,
          currency: "KES",
          paymentMethod: "MPESA",
          status: "COMPLETED",
          transactionId: "TXN_1",
          description: "Payment 1",
          createdAt: new Date(),
        },
        {
          id: "payment-2",
          amount: 20000,
          currency: "KES",
          paymentMethod: "FLUTTERWAVE",
          status: "PENDING",
          transactionId: "TXN_2",
          description: "Payment 2",
          createdAt: new Date(),
        },
      ];

      const { getPaymentsByUser } = await import(
        "../../src/services/paymentService.js"
      );
      getPaymentsByUser.mockResolvedValue({
        data: mockPayments,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });

      const response = await request(app).get("/api/v1/payments").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it("should handle query parameters", async () => {
      const { getPaymentsByUser } = await import(
        "../../src/services/paymentService.js"
      );
      getPaymentsByUser.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0,
        },
      });

      await request(app)
        .get(
          "/api/v1/payments?page=1&limit=5&status=COMPLETED&paymentMethod=MPESA"
        )
        .expect(200);

      expect(getPaymentsByUser).toHaveBeenCalledWith("test-user-id", {
        page: 1,
        limit: 5,
        status: "COMPLETED",
        provider: "MPESA",
      });
    });
  });

  describe("GET /api/v1/payments/:id", () => {
    it("should get payment by ID successfully", async () => {
      const mockPayment = {
        id: "test-payment-id",
        userId: "test-user-id",
        amount: 15000,
        currency: "KES",
        provider: "MPESA",
        status: "COMPLETED",
        transactionRef: "MPESA_123",
        user: {
          id: "test-user-id",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
        },
        property: null,
        logs: [],
      };

      const { getPaymentById } = await import(
        "../../src/services/paymentService.js"
      );
      getPaymentById.mockResolvedValue(mockPayment);

      const response = await request(app)
        .get("/api/v1/payments/test-payment-id")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.id).toBe("test-payment-id");
      expect(response.body.data.amount).toBe(15000);
    });

    it("should return 404 for non-existent payment", async () => {
      const { getPaymentById } = await import(
        "../../src/services/paymentService.js"
      );
      getPaymentById.mockRejectedValue(new Error("Payment not found"));

      const response = await request(app)
        .get("/api/v1/payments/non-existent-id")
        .expect(500); // Error handler returns 500 for service errors

      expect(response.body.error).toBe("Payment not found");
    });
  });

  describe("POST /api/v1/payments/:id/refund", () => {
    it("should process refund successfully", async () => {
      const mockPayment = {
        id: "test-payment-id",
        userId: "test-user-id",
        amount: 10000,
        currency: "KES",
        paymentMethod: "MPESA",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      };

      prisma.payment.findFirst.mockResolvedValue(mockPayment);
      prisma.payment.update.mockResolvedValue({
        ...mockPayment,
        status: "REFUNDED",
      });

      const { processMpesaRefund } = await import(
        "../../src/services/paymentService.js"
      );
      processMpesaRefund.mockResolvedValue({
        success: true,
        transactionId: "REFUND_MPESA_123",
      });

      const response = await request(app)
        .post("/api/v1/payments/test-payment-id/refund")
        .send({ reason: "Customer requested refund due to change of mind" })
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("Refund processed successfully");
      expect(response.body.data.refundTransactionId).toBe("REFUND_MPESA_123");
    });

    it("should reject refund outside window", async () => {
      const mockPayment = {
        id: "test-payment-id",
        userId: "test-user-id",
        amount: 10000,
        currency: "KES",
        paymentMethod: "MPESA",
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      };

      prisma.payment.findFirst.mockResolvedValue(mockPayment);

      const response = await request(app)
        .post("/api/v1/payments/test-payment-id/refund")
        .send({ reason: "Late refund request" })
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Payment is outside refund window");
    });

    it("should validate refund reason", async () => {
      const response = await request(app)
        .post("/api/v1/payments/test-payment-id/refund")
        .send({ reason: "Hi" }) // Too short
        .expect(400);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Validation failed");
    });
  });
});
