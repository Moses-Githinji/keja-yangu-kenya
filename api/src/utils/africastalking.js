import AfricasTalking from "africastalking";
import dotenv from "dotenv";
import { reverseGeocode } from "./geocode.js";

dotenv.config();

// Initialize Africa's Talking
const credentials = {
  apiKey: process.env.AT_API_KEY || "",
  username: process.env.AT_USERNAME || "sandbox",
};

let atService = null;
let sms = null;

try {
  if (credentials.apiKey && credentials.username) {
    atService = AfricasTalking(credentials);
    sms = atService.SMS;
    console.log(`✅ Africa's Talking initialized (${credentials.username})`);
  } else {
    console.warn("⚠️ Africa's Talking credentials missing - SMS service disabled");
  }
} catch (error) {
  console.error("❌ Failed to initialize Africa's Talking:", error.message);
}

/**
 * Send an SMS using Africa's Talking
 * @param {string} to - Phone number in E.164 format (+254...)
 * @param {string} message - Content of the SMS
 * @returns {Promise<Object>}
 */
export const sendSMS = async (to, message) => {
  if (!sms) {
    return { success: false, error: "SMS service not initialized" };
  }

  try {
    const response = await sms.send({
      to: [to],
      message: message,
      from: process.env.AT_SENDER_ID || "KEJAYANGU"
    });
    console.log("SMS sent successfully:", JSON.stringify(response, null, 2));
    return { success: true, response };
  } catch (error) {
    console.error("Failed to send SMS via AT:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Specialized function to send property details via SMS
 * @param {string} to - Recipient phone
 * @param {Object} property - Property object from DB
 */
export const sendPropertyDetailsSMS = async (to, property) => {
  // Get human-readable address from coordinates (with caching)
  const detailedAddress = await reverseGeocode(property.latitude, property.longitude, property.id);
  
  const message = `
🏠 ${property.title}
💰 Price: ${property.currency} ${property.price.toLocaleString()}
📍 Location: ${detailedAddress}
📞 Agent: ${property.agent?.firstName || property.owner?.firstName} (${property.agent?.phone || property.owner?.phone})
Thank you for using KejaYangu!
  `.trim();

  return await sendSMS(to, message);
};
