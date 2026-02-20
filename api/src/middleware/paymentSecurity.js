import { getPrismaClient } from "../config/database.js";

/**
 * Payment Security Middleware
 * Handles rate limiting, fraud detection, and security checks for payment endpoints
 */

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiting middleware for payment endpoints
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate rate limit key
 * @returns {Function} Express middleware function
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 10,
    keyGenerator = (req) =>
      `${req.user?.id || req.ip}_${req.route?.path || req.path}`,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Get or create rate limit data for this key
      let rateLimitData = rateLimitStore.get(key);
      if (!rateLimitData) {
        rateLimitData = { requests: [], lastReset: now };
        rateLimitStore.set(key, rateLimitData);
      }

      // Clean old requests outside the window
      rateLimitData.requests = rateLimitData.requests.filter(
        (timestamp) => timestamp > windowStart
      );

      // Check if limit exceeded
      if (rateLimitData.requests.length >= maxRequests) {
        // Log rate limit violation
        await logSecurityEvent({
          type: "RATE_LIMIT_EXCEEDED",
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.path,
          method: req.method,
          details: {
            key,
            requestCount: rateLimitData.requests.length,
            maxRequests,
            windowMs,
          },
        });

        return res.status(429).json({
          status: "error",
          message: "Too many payment requests. Please try again later.",
          retryAfter: Math.ceil(
            (rateLimitData.requests[0] + windowMs - now) / 1000
          ),
        });
      }

      // Add current request timestamp
      rateLimitData.requests.push(now);

      // Set rate limit headers
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": Math.max(
          0,
          maxRequests - rateLimitData.requests.length
        ),
        "X-RateLimit-Reset": new Date(
          rateLimitData.requests[0] + windowMs
        ).toISOString(),
      });

      next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      next(); // Don't block requests due to rate limiting errors
    }
  };
};

/**
 * Payment-specific rate limiter
 * Stricter limits for payment operations
 */
export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 payment attempts per 15 minutes
  keyGenerator: (req) => `payment_${req.user?.id || req.ip}`,
});

/**
 * STK Push rate limiter
 * More restrictive for STK push operations
 */
export const stkPushRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 STK push attempts per hour
  keyGenerator: (req) => `stk_push_${req.user?.id || req.ip}`,
});

/**
 * Refund rate limiter
 * Conservative limits for refund operations
 */
export const refundRateLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 2, // 2 refund requests per day
  keyGenerator: (req) => `refund_${req.user?.id || req.ip}`,
});

/**
 * Enhanced input validation for payment data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validatePaymentData = async (req, res, next) => {
  try {
    const { amount, currency, paymentMethod } = req.body;

    // Amount validation
    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid amount. Must be a positive number.",
        });
      }

      // Check for suspicious amounts
      if (amount > 10000000) {
        // 10 million KES
        await logSecurityEvent({
          type: "SUSPICIOUS_AMOUNT",
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.path,
          method: req.method,
          details: { amount, currency },
        });

        return res.status(400).json({
          status: "error",
          message: "Payment amount exceeds maximum allowed limit.",
        });
      }

      // Check for amounts that are too small (potential test attacks)
      if (amount < 1) {
        await logSecurityEvent({
          type: "SUSPICIOUS_SMALL_AMOUNT",
          userId: req.user?.id,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          endpoint: req.path,
          method: req.method,
          details: { amount, currency },
        });
      }
    }

    // Currency validation
    if (currency && !["KES", "USD"].includes(currency)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid currency. Only KES and USD are supported.",
      });
    }

    // Payment method validation
    if (
      paymentMethod &&
      !["STRIPE", "MPESA", "BANK_TRANSFER", "CASH", "FLUTTERWAVE"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment method.",
      });
    }

    next();
  } catch (error) {
    console.error("Payment validation error:", error);
    next(error);
  }
};

/**
 * Fraud detection middleware
 * Checks for suspicious payment patterns
 */
export const fraudDetection = async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const userId = req.user?.id;
    const ipAddress = req.ip;
    const { amount, paymentMethod } = req.body;

    if (!userId) {
      return next(); // Skip fraud detection for unauthenticated requests
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Check for repeated failed payments
    const recentFailedPayments = await prisma.payment.count({
      where: {
        userId,
        status: "FAILED",
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentFailedPayments >= 3) {
      await logSecurityEvent({
        type: "REPEATED_FAILED_PAYMENTS",
        userId,
        ipAddress,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
        details: { failedCount: recentFailedPayments },
      });

      return res.status(429).json({
        status: "error",
        message: "Too many failed payment attempts. Please contact support.",
      });
    }

    // Check for suspicious amount patterns
    const recentPayments = await prisma.payment.findMany({
      where: {
        userId,
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    // Check for round number amounts (often used in fraud)
    if (amount && amount % 1000 === 0 && amount >= 10000) {
      await logSecurityEvent({
        type: "ROUND_NUMBER_AMOUNT",
        userId,
        ipAddress,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
        details: { amount },
      });
    }

    // Check for rapid successive payments
    const recentSuccessfulPayments = recentPayments.filter(
      (p) => p.status === "COMPLETED"
    );
    if (recentSuccessfulPayments.length >= 5) {
      await logSecurityEvent({
        type: "RAPID_SUCCESSIVE_PAYMENTS",
        userId,
        ipAddress,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
        details: { recentCount: recentSuccessfulPayments.length },
      });
    }

    next();
  } catch (error) {
    console.error("Fraud detection error:", error);
    next(); // Don't block requests due to fraud detection errors
  }
};

/**
 * IP-based restrictions
 * Blocks requests from suspicious IP addresses
 */
export const ipRestrictions = async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const prisma = getPrismaClient();

    // Check if IP is in blocklist
    const blockedIP = await prisma.blockedIP.findUnique({
      where: { ipAddress },
    });

    if (blockedIP) {
      await logSecurityEvent({
        type: "BLOCKED_IP_ACCESS",
        userId: req.user?.id,
        ipAddress,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
        details: { blockedSince: blockedIP.createdAt },
      });

      return res.status(403).json({
        status: "error",
        message: "Access denied from this IP address.",
      });
    }

    // Check for suspicious IP patterns (VPN, proxy, etc.)
    // This is a basic check - in production, use a proper IP reputation service
    if (isSuspiciousIP(ipAddress)) {
      await logSecurityEvent({
        type: "SUSPICIOUS_IP",
        userId: req.user?.id,
        ipAddress,
        userAgent: req.get("User-Agent"),
        endpoint: req.path,
        method: req.method,
        details: { reason: "Potential VPN/Proxy" },
      });
    }

    next();
  } catch (error) {
    console.error("IP restriction error:", error);
    next();
  }
};

/**
 * Payment amount limits
 * Enforces minimum and maximum payment amounts
 */
export const paymentAmountLimits = (req, res, next) => {
  const { amount, currency } = req.body;

  if (!amount) return next();

  const limits = {
    KES: { min: 10, max: 5000000 }, // 10 KES to 5M KES
    USD: { min: 1, max: 50000 }, // 1 USD to 50K USD
  };

  const currencyLimits = limits[currency] || limits.KES;

  if (amount < currencyLimits.min) {
    return res.status(400).json({
      status: "error",
      message: `Minimum payment amount is ${currencyLimits.min} ${currency}.`,
    });
  }

  if (amount > currencyLimits.max) {
    return res.status(400).json({
      status: "error",
      message: `Maximum payment amount is ${currencyLimits.max} ${currency}.`,
    });
  }

  next();
};

/**
 * Comprehensive security logging for payment events
 * @param {Object} eventData - Security event data
 */
export const logSecurityEvent = async (eventData) => {
  try {
    const prisma = getPrismaClient();

    await prisma.securityLog.create({
      data: {
        type: eventData.type,
        userId: eventData.userId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        endpoint: eventData.endpoint,
        method: eventData.method,
        details: JSON.stringify(eventData.details || {}),
        severity: getSeverityLevel(eventData.type),
      },
    });

    console.log(`Security event logged: ${eventData.type}`, {
      userId: eventData.userId,
      ipAddress: eventData.ipAddress,
      endpoint: eventData.endpoint,
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

/**
 * Get severity level for security event type
 * @param {string} eventType - Type of security event
 * @returns {string} Severity level
 */
const getSeverityLevel = (eventType) => {
  const severityMap = {
    RATE_LIMIT_EXCEEDED: "MEDIUM",
    SUSPICIOUS_AMOUNT: "HIGH",
    REPEATED_FAILED_PAYMENTS: "HIGH",
    BLOCKED_IP_ACCESS: "CRITICAL",
    SUSPICIOUS_IP: "MEDIUM",
    ROUND_NUMBER_AMOUNT: "LOW",
    RAPID_SUCCESSIVE_PAYMENTS: "MEDIUM",
    SUSPICIOUS_SMALL_AMOUNT: "LOW",
  };

  return severityMap[eventType] || "LOW";
};

/**
 * Check if IP address is suspicious
 * Basic implementation - in production, use IP reputation services
 * @param {string} ipAddress - IP address to check
 * @returns {boolean} True if suspicious
 */
const isSuspiciousIP = (ipAddress) => {
  // This is a very basic check
  // In production, integrate with services like MaxMind, IPQualityScore, etc.

  // Check for private IPs (shouldn't be in production logs)
  if (
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("172.") ||
    ipAddress.startsWith("192.168.")
  ) {
    return true;
  }

  // Check for known VPN/proxy ranges (example)
  // This is not comprehensive - use proper IP reputation service
  const suspiciousRanges = [
    "185.156.172.", // Example VPN range
    "185.156.173.", // Example VPN range
  ];

  return suspiciousRanges.some((range) => ipAddress.startsWith(range));
};

/**
 * Combined payment security middleware
 * Applies all security checks in the correct order
 */
export const paymentSecurityMiddleware = [
  ipRestrictions,
  paymentRateLimiter,
  validatePaymentData,
  paymentAmountLimits,
  fraudDetection,
];

/**
 * STK Push security middleware
 */
export const stkPushSecurityMiddleware = [
  ipRestrictions,
  stkPushRateLimiter,
  validatePaymentData,
  paymentAmountLimits,
  fraudDetection,
];

/**
 * Refund security middleware
 */
export const refundSecurityMiddleware = [
  ipRestrictions,
  refundRateLimiter,
  fraudDetection,
];
