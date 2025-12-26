import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import { getPrismaClient } from "../config/database.js";
import { sendEmail } from "../utils/email.js";
import { sendSMS } from "../utils/sms.js";

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// Validation middleware
const validateRegistration = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .matches(/^(\+254|0)[17]\d{8}$/)
    .withMessage("Please provide a valid Kenyan phone number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(["USER"])
    .withMessage("Invalid role. Only USER registration is allowed"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// @route   POST /api/v1/auth/send-test-email
// @desc    Send a test email to verify email service
// @access  Public
router.post("/send-test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email address is required",
      });
    }

    const { sendEmail } = await import("../utils/email.js");

    const result = await sendEmail({
      to: email,
      template: "email-verification",
      data: {
        name: "Test User",
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=test-token-123`,
      },
    });

    res.json({
      status: "success",
      message: "Test email sent successfully",
      data: {
        email,
        result,
        message:
          result.messageId === "disabled"
            ? "Email service is disabled - check SMTP configuration"
            : "Test email sent successfully",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

// @route   GET /api/v1/auth/email-test
// @desc    Test email service configuration
// @access  Public
router.get("/email-test", async (req, res) => {
  try {
    const { verifyEmailConfig } = await import("../utils/email.js");
    const isConfigured = await verifyEmailConfig();

    res.json({
      status: "success",
      data: {
        emailService: isConfigured ? "configured" : "disabled",
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        smtpUser: process.env.SMTP_USER ? "configured" : "not configured",
        smtpPass: process.env.SMTP_PASS ? "configured" : "not configured",
        smtpFrom: process.env.SMTP_FROM,
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION,
        message: isConfigured
          ? "Email service is properly configured"
          : "Email service is disabled - check SMTP credentials in .env",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to test email configuration",
      error: error.message,
    });
  }
});

// @route   GET /api/v1/auth/phone-format
// @desc    Get the expected phone number format
// @access  Public
router.get("/phone-format", (req, res) => {
  res.json({
    status: "success",
    data: {
      format: "Kenyan phone number",
      examples: ["+254700123456", "0700123456"],
      regex: "Must start with +254 or 0, followed by 7 or 1, then 8 digits",
      twilioNumber: process.env.TWILIO_PHONE_NUMBER || "+254700000000",
    },
  });
});

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validateRegistration, async (req, res) => {
  try {
    // Debug: Log the received data
    console.log("Registration request body:", req.body);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role = "USER", // Only USER role is allowed for registration
    } = req.body;

    const prisma = getPrismaClient();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message:
          existingUser.email === email.toLowerCase()
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification code (6 digits)
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate phone verification code
    const phoneVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with verification code
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role,
        emailVerificationCode,
        emailVerificationExpires,
        phoneVerificationCode,
        phoneVerificationExpires,
        // No agent profile creation for USER registration
        preferences: {
          create: {
            propertyTypes: [],
            locations: [],
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
          },
        },
      },
      include: {
        agentProfile: true,
        preferences: true,
      },
    });

    // Send email verification code
    const emailResult = await sendEmail({
      to: newUser.email,
      subject: "Verify Your Email - KejaYangu",
      template: "email-verification-code",
      data: {
        name: newUser.firstName,
        verificationCode: emailVerificationCode,
      },
    });

    // Send SMS verification code
    const smsResult = await sendSMS({
      to: newUser.phone,
      message: `Your KejaYangu verification code is: ${phoneVerificationCode}. Valid for 10 minutes.`,
    });

    res.status(201).json({
      status: "success",
      message:
        "Registration successful! Please check your email and phone for verification codes.",
      data: {
        userId: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        verification: {
          email: {
            code: emailVerificationCode,
            expires: emailVerificationExpires,
          },
          phone: {
            code: phoneVerificationCode,
            expires: phoneVerificationExpires,
          },
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    console.log("🔍 Login attempt for email:", email);
    console.log("🔍 Email after toLowerCase():", email.toLowerCase());

    const prisma = getPrismaClient();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        agentProfile: true,
        preferences: true,
      },
    });

    console.log("🔍 User found:", !!user);
    if (user) {
      console.log("🔍 User details:", {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        passwordHashLength: user.password.length,
      });
    }

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        status: "error",
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Check password
    console.log("🔍 Checking password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔍 Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      // Increment login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockUntil:
            user.loginAttempts + 1 >= 5
              ? new Date(Date.now() + 2 * 60 * 60 * 1000)
              : null,
        },
      });

      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    console.log("✅ Password valid, proceeding with login");

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
        },
      });
    }

    // Generate tokens
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove sensitive data from response
    const { password: _, ...userResponse } = user;

    console.log(
      "✅ Login successful for user:",
      user.email,
      "Role:",
      user.role
    );

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed",
    });
  }
});

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token type",
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Refresh token expired",
      });
    }

    console.error("Token refresh error:", error);
    res.status(500).json({
      status: "error",
      message: "Token refresh failed",
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", async (req, res) => {
  try {
    // Simply return success - client should discard tokens
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: "error",
      message: "Logout failed",
    });
  }
});

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email/SMS
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        status: "error",
        message: "Email or phone number is required",
      });
    }

    const prisma = getPrismaClient();
    let user;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { phone },
      });
    }

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email/SMS
    try {
      if (email && process.env.ENABLE_EMAIL_VERIFICATION === "true") {
        await sendEmail({
          to: user.email,
          subject: "Password Reset - KejaYangu",
          template: "password-reset",
          data: {
            name: user.firstName,
            resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
          },
        });
      }

      if (phone && process.env.ENABLE_SMS_VERIFICATION === "true") {
        const resetCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        await prisma.user.update({
          where: { id: user.id },
          data: {
            phoneVerificationCode: resetCode,
            phoneVerificationExpires: resetExpires,
          },
        });

        await sendSMS({
          to: phone,
          message: `Your KejaYangu password reset code is: ${resetCode}. Valid for 10 minutes.`,
        });
      }
    } catch (error) {
      console.error("Failed to send reset instructions:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to send reset instructions",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Password reset instructions sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Password reset failed",
    });
  }
});

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, phone, resetCode } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "New password must be at least 8 characters long",
      });
    }

    const prisma = getPrismaClient();
    let user;

    if (token) {
      // Reset with email token
      user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
    } else if (phone && resetCode) {
      // Reset with SMS code
      user = await prisma.user.findFirst({
        where: {
          phone,
          phoneVerificationCode: resetCode,
          phoneVerificationExpires: { gt: new Date() },
        },
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Valid reset token or phone code is required",
      });
    }

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired reset token/code",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      status: "error",
      message: "Password reset failed",
    });
  }
});

// @route   POST /api/v1/auth/verify-email
// @desc    Verify email with code
// @access  Public
router.post("/verify-email", async (req, res) => {
  try {
    console.log("🔍 Email verification request received:", {
      email: req.body.email,
      code: req.body.code,
      body: req.body,
      headers: req.headers,
    });

    const { email, code } = req.body;

    if (!email || !code) {
      console.log("❌ Missing required fields:", {
        email: !!email,
        code: !!code,
      });
      return res.status(400).json({
        status: "error",
        message: "Email and verification code are required",
      });
    }

    const prisma = getPrismaClient();

    console.log("🔍 Searching for user with email:", email.toLowerCase());

    // First, check if user exists at all
    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        emailVerificationCode: true,
        emailVerificationExpires: true,
        isVerified: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("🔍 User exists check:", {
      exists: !!userExists,
      details: userExists
        ? {
            id: userExists.id,
            email: userExists.email,
            role: userExists.role,
            isVerified: userExists.isVerified,
            emailVerificationCode: userExists.emailVerificationCode,
            emailVerificationExpires: userExists.emailVerificationExpires,
            createdAt: userExists.createdAt,
            currentTime: new Date().toISOString(),
            isExpired: userExists.emailVerificationExpires
              ? userExists.emailVerificationExpires <= new Date()
              : true,
          }
        : null,
    });

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        emailVerificationCode: code,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    console.log("🔍 Verification query result:", {
      userFound: !!user,
      codeMatches: userExists?.emailVerificationCode === code,
      isExpired: userExists?.emailVerificationExpires
        ? userExists.emailVerificationExpires <= new Date()
        : true,
    });

    if (user) {
      console.log("🔍 User details:", {
        id: user.id,
        email: user.email,
        emailVerificationCode: user.emailVerificationCode,
        emailVerificationExpires: user.emailVerificationExpires,
        isVerified: user.isVerified,
      });
    }

    if (!user) {
      console.log(
        "❌ No user found with matching email and valid verification code"
      );
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code",
      });
    }

    console.log("✅ Verification successful, updating user...");

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    console.log("✅ Email verification completed successfully");

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Email verification failed",
    });
  }
});

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend verification codes
// @access  Public
router.post("/resend-verification", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        status: "error",
        message: "Email or phone number is required",
      });
    }

    const prisma = getPrismaClient();

    let user;
    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { phone },
      });
    }

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: "error",
        message: "User is already verified",
      });
    }

    let emailResult = null;
    let smsResult = null;

    // Resend email verification code
    if (email && !user.isVerified) {
      const emailVerificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationCode,
          emailVerificationExpires,
        },
      });

      emailResult = await sendEmail({
        to: user.email,
        subject: "Verify Your Email - KejaYangu",
        template: "email-verification-code",
        data: {
          name: user.firstName,
          verificationCode: emailVerificationCode,
        },
      });
    }

    // Resend phone verification code
    if (phone && !user.isVerified) {
      const phoneVerificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerificationCode,
          phoneVerificationExpires,
        },
      });

      smsResult = await sendSMS({
        to: user.phone,
        message: `Your KejaYangu verification code is: ${phoneVerificationCode}. Valid for 10 minutes.`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Verification codes sent successfully",
      data: {
        email: emailResult ? "sent" : "skipped",
        sms: smsResult ? "sent" : "skipped",
      },
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to resend verification codes",
    });
  }
});

// @route   POST /api/v1/auth/verify-phone
// @desc    Verify phone with code
// @access  Public
router.post("/verify-phone", async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        status: "error",
        message: "Phone number and verification code are required",
      });
    }

    const prisma = getPrismaClient();

    const user = await prisma.user.findFirst({
      where: {
        phone,
        phoneVerificationCode: code,
        phoneVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired verification code",
      });
    }

    // Mark phone as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true, // Use isVerified instead of isPhoneVerified
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Phone verified successfully",
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    res.status(500).json({
      status: "error",
      message: "Phone verification failed",
    });
  }
});

export default router;
