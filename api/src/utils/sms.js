import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client only if credentials are available
let twilioClient = null;
let isTwilioConfigured = false;

try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    isTwilioConfigured = true;
    console.log("✅ Twilio SMS service configured");
  } else {
    console.warn("⚠️ Twilio credentials not found - SMS service disabled");
  }
} catch (error) {
  console.warn(
    "⚠️ Failed to initialize Twilio client - SMS service disabled:",
    error.message
  );
}

// Helper function to check if Twilio is available
const isTwilioAvailable = () => {
  return isTwilioConfigured && twilioClient;
};

// Send SMS with fallback
export const sendSMS = async (to, message, options = {}) => {
  if (!isTwilioAvailable()) {
    console.warn("SMS not sent - Twilio not configured");
    return {
      success: false,
      message: "SMS service not available",
      fallback: true,
    };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formatPhoneNumber(to),
      ...options,
    });

    console.log("SMS sent successfully:", result.sid);
    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error("Failed to send SMS:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send verification code SMS
export const sendVerificationCode = async (phone, code) => {
  try {
    const message = `Your KejaYangu verification code is: ${code}. Valid for 10 minutes. Do not share this code with anyone.`;

    return await sendSMS(phone, message);
  } catch (error) {
    console.error("Verification code SMS failed:", error);
    throw error;
  }
};

// Send password reset SMS
export const sendPasswordResetSMS = async (phone, code) => {
  try {
    const message = `Your KejaYangu password reset code is: ${code}. Valid for 10 minutes. If you didn't request this, please ignore.`;

    return await sendSMS(phone, message);
  } catch (error) {
    console.error("Password reset SMS failed:", error);
    throw error;
  }
};

// Send property inquiry notification
export const sendPropertyInquiryNotification = async (
  agentPhone,
  propertyTitle,
  inquirerName
) => {
  try {
    const message = `New inquiry for ${propertyTitle} from ${inquirerName}. Check your KejaYangu dashboard for details.`;

    return await sendSMS(agentPhone, message);
  } catch (error) {
    console.error("Property inquiry notification SMS failed:", error);
    throw error;
  }
};

// Send appointment reminder
export const sendAppointmentReminder = async (
  phone,
  propertyTitle,
  appointmentTime
) => {
  try {
    const message = `Reminder: You have a property viewing appointment for ${propertyTitle} at ${appointmentTime}. Please confirm your attendance.`;

    return await sendSMS(phone, message);
  } catch (error) {
    console.error("Appointment reminder SMS failed:", error);
    throw error;
  }
};

// Send market update notification
export const sendMarketUpdate = async (phone, updateType, location) => {
  try {
    const message = `Market Update: ${updateType} in ${location}. Check KejaYangu for the latest property trends and opportunities.`;

    return await sendSMS(phone, message);
  } catch (error) {
    console.error("Market update SMS failed:", error);
    throw error;
  }
};

// Send bulk SMS
export const sendBulkSMS = async (phoneNumbers, message) => {
  try {
    const results = [];

    for (const phone of phoneNumbers) {
      try {
        const result = await sendSMS(phone, message);
        results.push({ success: true, phone, data: result });
      } catch (error) {
        results.push({ success: false, phone, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error("Bulk SMS sending failed:", error);
    throw error;
  }
};

// Format phone number to E.164 format
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle Kenyan phone numbers
  if (cleaned.startsWith("0")) {
    // Convert 07xxxxxxxx to +2547xxxxxxxx
    cleaned = "+254" + cleaned.substring(1);
  } else if (cleaned.startsWith("254")) {
    // Convert 254xxxxxxxx to +254xxxxxxxx
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    // Add + if not present
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

// Verify SMS configuration
export const verifySMSConfig = async () => {
  if (!isTwilioAvailable()) {
    console.warn(
      "SMS configuration verification skipped - Twilio not configured"
    );
    return false;
  }

  try {
    // Test Twilio credentials by getting account info
    const account = await twilioClient.api
      .accounts(process.env.TWILIO_ACCOUNT_SID)
      .fetch();

    console.log("✅ SMS configuration verified successfully");
    console.log(`📱 Twilio Account: ${account.friendlyName}`);
    console.log(`💰 Account Status: ${account.status}`);

    return true;
  } catch (error) {
    console.error("❌ SMS configuration verification failed:", error);
    return false;
  }
};

// Get SMS delivery status
export const getSMSStatus = async (messageId) => {
  if (!isTwilioAvailable()) {
    console.warn("SMS status retrieval skipped - Twilio not configured");
    return null;
  }

  try {
    const message = await twilioClient.messages(messageId).fetch();

    return {
      sid: message.sid,
      status: message.status,
      direction: message.direction,
      from: message.from,
      to: message.to,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    };
  } catch (error) {
    console.error("Failed to get SMS status:", error);
    throw error;
  }
};

// Get SMS history
export const getSMSHistory = async (phone, limit = 50) => {
  if (!isTwilioAvailable()) {
    console.warn("SMS history retrieval skipped - Twilio not configured");
    return [];
  }

  try {
    const messages = await twilioClient.messages.list({
      to: formatPhoneNumber(phone),
      limit,
    });

    return messages.map((message) => ({
      sid: message.sid,
      status: message.status,
      direction: message.direction,
      body: message.body,
      dateCreated: message.dateCreated,
      dateSent: message.dateSent,
    }));
  } catch (error) {
    console.error("Failed to get SMS history:", error);
    throw error;
  }
};

// Test SMS function
export const sendTestSMS = async (phone) => {
  if (!isTwilioAvailable()) {
    console.warn("Test SMS skipped - Twilio not configured");
    return {
      success: false,
      message: "SMS service not available",
    };
  }

  try {
    const message =
      "This is a test SMS from KejaYangu. If you receive this, your SMS configuration is working correctly.";

    const result = await sendSMS(phone, message);

    console.log("✅ Test SMS sent successfully");
    return result;
  } catch (error) {
    console.error("❌ Test SMS failed:", error);
    throw error;
  }
};
