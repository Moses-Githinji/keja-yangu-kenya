import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create transporter
const createTransporter = () => {
  // Use Gmail SMTP configuration
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Check if email credentials are configured
  if (!user || !pass || !host || !port) {
    console.warn(
      "⚠️ Email credentials not configured. Email service will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for other ports
    auth: { user, pass },
  });
};

// Email templates
const emailTemplates = {
  "email-verification": (data) => ({
    subject: "Verify Your Email - KejaYangu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to KejaYangu!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering with KejaYangu. Please click the link below to verify your email address:</p>
        <a href="${data.verificationLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${data.verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The KejaYangu Team</p>
      </div>
    `,
  }),
  "email-verification-code": (data) => ({
    subject: "Verify Your Email - KejaYangu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to KejaYangu!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering with KejaYangu. Please use the verification code below to verify your email address:</p>
        <div style="background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 4px; margin: 0;">${data.verificationCode}</h1>
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 14px;">Enter this code in the verification form</p>
        <p>This code will expire in 10 minutes.</p>
        <p>Best regards,<br>The KejaYangu Team</p>
      </div>
    `,
  }),
  "password-reset": (data) => ({
    subject: "Reset Your Password - KejaYangu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${data.resetLink}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${data.resetLink}</p>
        <p>This link will expire in 30 seconds.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The KejaYangu Team</p>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async ({ to, subject, template, data = {} }) => {
  try {
    const transporter = createTransporter();

    // Check if transporter was created successfully
    if (!transporter) {
      console.warn("⚠️ Email service disabled - skipping email send");
      return {
        messageId: "disabled",
        status: "Email service disabled - credentials not configured",
      };
    }

    // Get template
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    // Process template with data
    const processedTemplate = emailTemplate(data);
    let html = processedTemplate.html;
    let finalSubject = processedTemplate.subject;

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || "KejaYangu <noreply@kejayangu.co.ke>",
      to,
      subject: finalSubject,
      html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully:", {
      to,
      subject: finalSubject,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

// Send bulk email function
export const sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const emailData of emails) {
      try {
        const result = await sendEmail(emailData);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error("Bulk email sending failed:", error);
    throw error;
  }
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Email configuration verification failed:", error);
    return false;
  }
};

// Test email function
export const sendTestEmail = async (to) => {
  try {
    await sendEmail({
      to,
      template: "welcome",
      data: {
        name: "Test User",
        dashboardLink: "https://kejayangu.co.ke/dashboard",
      },
    });

    console.log("✅ Test email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Test email failed:", error);
    return false;
  }
};
