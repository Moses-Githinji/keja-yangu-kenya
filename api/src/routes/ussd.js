import express from "express";
import { getPrismaClient } from "../utils/prismaClient.js";
import { sendPropertyDetailsSMS } from "../utils/africastalking.js";
import { reverseGeocode } from "../utils/geocode.js";

const router = express.Router();

/**
 * @route   POST /api/v1/internal/ussd
 * @desc    USSD Callback handler (Tunneled from Vercel Edge)
 * @access  Internal (Vercel Proxy)
 */
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const prisma = getPrismaClient();

    let response = "";
    const userPath = text ? text.split("*") : [];

    // --- USSD State Machine ---
    
    // 0. Handle "Back" navigation globally
    if (text.endsWith("*0")) {
      response = getMainMessage();
    } 
    
    else if (text === "") {
      // 1. Welcome / Main Menu
      response = getMainMessage();
    } 
    
    else if (userPath[0] === "1" || userPath[0] === "2" || userPath[0] === "3") {
      const listingTypeMap = {
        "1": "RENT",
        "2": "SALE",
        "3": "SHORT_TERM_RENT"
      };
      
      const listingType = listingTypeMap[userPath[0]];

      if (userPath.length === 1) {
        // 2. Category Selected -> Fetch Recent Listings
        const properties = await prisma.property.findMany({
          where: { 
            listingType: listingType,
            status: "ACTIVE"
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, price: true }
        });

        if (properties.length === 0) {
          response = "END Sorry, no active listings found in this category.";
        } else {
          response = `CON Latest ${userPath[0] === "1" ? "Rentals" : userPath[0] === "2" ? "Sales" : "Stays"}:\n`;
          properties.forEach((p, i) => {
            response += `${i + 1}. ${p.title} (${p.price.toLocaleString()})\n`;
          });
          response += "0. Back";
        }
      } 
      
      else if (userPath.length === 2) {
        // 3. Property Selected -> Trigger SMS and End
        const selectionIndex = parseInt(userPath[1]) - 1;
        
        const properties = await prisma.property.findMany({
          where: { 
            listingType: listingType,
            status: "ACTIVE"
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { 
            owner: true,
            agent: true
          }
        });

        const selectedProperty = properties[selectionIndex];

        if (selectedProperty) {
          // Trigger the SMS delivery
          await sendPropertyDetailsSMS(phoneNumber, selectedProperty);
          response = `END Thank you! Detailed info for ${selectedProperty.title} has been sent to your phone via SMS.`;
        } else {
          response = "END Invalid selection. Please try again.";
        }
      }
    }

    else if (userPath[0] === "4") {
      // 4. Balance Check
      response = "END Your current balance for service fees is KES 0.00. Recharge via M-Pesa to boost your visibility!";
    }

    else {
      response = "END Invalid option selected. Please try again.";
    }

    // Return plain text as expected by Africa's Talking (via the Vercel Proxy)
    res.set("Content-Type", "text/plain");
    res.send(response);

  } catch (error) {
    console.error("USSD Error:", error);
    res.set("Content-Type", "text/plain");
    res.send("END Sorry, a technical error occurred. Please try again later.");
  }
});

/**
 * Helper to generate public menu
 * @returns {string}
 */
function getMainMessage() {
  let msg = "CON Welcome to KejaYangu Kenya\n";
  msg += "1. Properties for Rent\n";
  msg += "2. Properties for Sale\n";
  msg += "3. Short-Term Stays\n";
  msg += "4. Check Balance";
  
  return msg;
}

export default router;
