import express from "express";
import { body, param, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import { getPrismaClient } from "../config/database.js";

const router = express.Router();

// Validation for payment creation
const validatePayment = [
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("currency")
    .isIn(["KES", "USD"])
    .withMessage("Currency must be KES or USD"),
  body("paymentMethod")
    .isIn(["STRIPE", "MPESA", "BANK_TRANSFER", "CASH"])
    .withMessage("Invalid payment method"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

// Helper to clear payment cache
const clearPaymentCache = async (paymentId = null) => {
  try {
    const redisClient = getRedisClient();
    await redisClient.del("user_payments");
    if (paymentId) {
      await redisClient.del(`payment:${paymentId}`);
    }
    console.log("Payment cache cleared.");
  } catch (error) {
    console.warn("Failed to clear payment cache:", error.message);
  }
};

// @route   POST /api/v1/payments
// @desc    Create a new payment
// @access  Private
router.post("/", authenticateToken, validatePayment, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { amount, currency, paymentMethod, description } = req.body;
    const prisma = getPrismaClient();

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency,
        paymentMethod,
        description,
        transactionId,
        userId: req.user.id,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Process payment based on method
    let paymentResult;
    try {
      switch (paymentMethod) {
        case "STRIPE":
          paymentResult = await processStripePayment(payment);
          break;
        case "MPESA":
          paymentResult = await processMpesaPayment(payment);
          break;
        case "BANK_TRANSFER":
          paymentResult = await processBankTransfer(payment);
          break;
        case "CASH":
          paymentResult = await processCashPayment(payment);
          break;
        default:
          throw new Error("Unsupported payment method");
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentResult.success ? "COMPLETED" : "FAILED",
          transactionId: paymentResult.transactionId || payment.transactionId,
        },
      });

      await clearPaymentCache(payment.id);

      if (paymentResult.success) {
        res.status(200).json({
          status: "success",
          message: "Payment processed successfully",
          data: {
            ...payment,
            status: "COMPLETED",
            transactionId: paymentResult.transactionId || payment.transactionId,
          },
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Payment failed",
          data: {
            ...payment,
            status: "FAILED",
            error: paymentResult.error,
          },
        });
      }
    } catch (paymentError) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
        },
      });

      throw paymentError;
    }
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/payments
// @desc    Get user's payment history
// @access  Private
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod } = req.query;
    const prisma = getPrismaClient();

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          currency: true,
          paymentMethod: true,
          status: true,
          transactionId: true,
          description: true,
          createdAt: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      status: "success",
      data: payments,
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

// @route   GET /api/v1/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const prisma = getPrismaClient();

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    res.status(200).json({
      status: "success",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/payments/:id/refund
// @desc    Request refund for a payment
// @access  Private
router.post(
  "/:id/refund",
  authenticateToken,
  [
    body("reason")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Refund reason must be between 10 and 500 characters"),
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

      const { id } = req.params;
      const { reason } = req.body;
      const prisma = getPrismaClient();

      const payment = await prisma.payment.findFirst({
        where: {
          id,
          userId: req.user.id,
          status: "COMPLETED",
        },
      });

      if (!payment) {
        return res.status(404).json({
          status: "error",
          message: "Payment not found or not eligible for refund",
        });
      }

      // Check if payment is within refund window (e.g., 30 days)
      const refundWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      if (Date.now() - payment.createdAt.getTime() > refundWindow) {
        return res.status(400).json({
          status: "error",
          message: "Payment is outside refund window",
        });
      }

      // Process refund based on payment method
      let refundResult;
      try {
        switch (payment.paymentMethod) {
          case "STRIPE":
            refundResult = await processStripeRefund(payment);
            break;
          case "MPESA":
            refundResult = await processMpesaRefund(payment);
            break;
          case "BANK_TRANSFER":
            refundResult = await processBankTransferRefund(payment);
            break;
          case "CASH":
            refundResult = await processCashRefund(payment);
            break;
          default:
            throw new Error("Unsupported payment method for refund");
        }

        if (refundResult.success) {
          // Update payment status
          await prisma.payment.update({
            where: { id },
            data: { status: "REFUNDED" },
          });

          await clearPaymentCache(id);

          res.status(200).json({
            status: "success",
            message: "Refund processed successfully",
            data: {
              paymentId: id,
              refundAmount: payment.amount,
              refundTransactionId: refundResult.transactionId,
            },
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Refund failed",
            error: refundResult.error,
          });
        }
      } catch (refundError) {
        res.status(500).json({
          status: "error",
          message: "Refund processing failed",
          error: refundError.message,
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/v1/payments/stats/overview
// @desc    Get payment statistics for user
// @access  Private
router.get("/stats/overview", authenticateToken, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    const [totalPayments, totalAmount, successfulPayments, failedPayments] =
      await Promise.all([
        prisma.payment.count({ where: { userId: req.user.id } }),
        prisma.payment.aggregate({
          where: { userId: req.user.id, status: "COMPLETED" },
          _sum: { amount: true },
        }),
        prisma.payment.count({
          where: { userId: req.user.id, status: "COMPLETED" },
        }),
        prisma.payment.count({
          where: { userId: req.user.id, status: "FAILED" },
        }),
      ]);

    const stats = {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      successfulPayments,
      failedPayments,
      successRate:
        totalPayments > 0
          ? ((successfulPayments / totalPayments) * 100).toFixed(1)
          : 0,
    };

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Payment processing functions (implementations would depend on specific payment providers)
async function processStripePayment(payment) {
  // Implement Stripe payment processing
  // This is a placeholder - actual implementation would use Stripe SDK
  return { success: true, transactionId: `STRIPE_${Date.now()}` };
}

async function processMpesaPayment(payment) {
  // Implement M-Pesa payment processing
  // This is a placeholder - actual implementation would use M-Pesa API
  return { success: true, transactionId: `MPESA_${Date.now()}` };
}

async function processBankTransfer(payment) {
  // Implement bank transfer processing
  return { success: true, transactionId: `BANK_${Date.now()}` };
}

async function processCashPayment(payment) {
  // Process cash payment (usually manual verification)
  return { success: true, transactionId: `CASH_${Date.now()}` };
}

async function processStripeRefund(payment) {
  // Implement Stripe refund processing
  return { success: true, transactionId: `REFUND_STRIPE_${Date.now()}` };
}

async function processMpesaRefund(payment) {
  // Implement M-Pesa refund processing
  return { success: true, transactionId: `REFUND_MPESA_${Date.now()}` };
}

async function processBankTransferRefund(payment) {
  // Implement bank transfer refund processing
  return { success: true, transactionId: `REFUND_BANK_${Date.now()}` };
}

async function processCashRefund(payment) {
  // Process cash refund (usually manual verification)
  return { success: true, transactionId: `REFUND_CASH_${Date.now()}` };
}

export default router;
