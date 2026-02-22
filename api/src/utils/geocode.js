import axios from "axios";
import dotenv from "dotenv";
import { getPrismaClient } from "./prismaClient.js";

dotenv.config();

const API_TOKEN = process.env.LOCATIONIQ_TOKEN;
const REVERSE_GEOCODE_URL = "https://us1.locationiq.com/v1/reverse";

/**
 * Convert latitude and longitude into a human-readable address.
 * Implements database caching to reduce API costs.
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} [propertyId] - Optional property ID to enable caching
 * @returns {Promise<string>} - Formatted address string
 */
export async function reverseGeocode(lat, lon, propertyId = null) {
  if (!lat || !lon) {
    return "Location unavailable";
  }

  const prisma = getPrismaClient();

  // 1. Check Cache (if propertyId is provided)
  if (propertyId) {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { geocodedAddress: true }
      });

      if (property?.geocodedAddress) {
        console.log(`[Cache Hit] Using stored address for property ${propertyId}`);
        return property.geocodedAddress;
      }
    } catch (dbError) {
      console.error("[Cache Error] Failed to read from DB:", dbError.message);
    }
  }

  // 2. Fetch from External API
  if (!API_TOKEN) {
    console.warn("⚠️ LOCATIONIQ_TOKEN missing - skipping reverse geocoding");
    return `Lat: ${lat}, Lon: ${lon}`;
  }

  try {
    console.log(`[API Call] Fetching address from LocationIQ for ${lat}, ${lon}`);
    const response = await axios.get(REVERSE_GEOCODE_URL, {
      params: {
        key: API_TOKEN,
        lat,
        lon,
        format: "json",
        addressdetails: 1,
        normalizeaddress: 1
      },
      timeout: 5000
    });

    const data = response.data;

    if (data.error) {
      throw new Error(data.error.message || "Geocoding failed");
    }

    const address = data.address;
    let placeDesc = "";

    // Build a concise address for SMS
    if (address.road || address.pedestrian) {
      placeDesc += `${address.road || address.pedestrian}`;
    }
    if (address.neighbourhood) {
      placeDesc += placeDesc ? `, ${address.neighbourhood}` : address.neighbourhood;
    }
    if (address.suburb || address.city) {
      placeDesc += placeDesc ? `, ${address.suburb || address.city}` : address.suburb || address.city;
    }

    // Fallback if sparse
    if (!placeDesc.trim()) {
      placeDesc = data.display_name || "Unknown location";
    }

    const finalAddress = placeDesc.trim();

    // 3. Save to Cache (if propertyId is provided)
    if (propertyId && finalAddress) {
      try {
        await prisma.property.update({
          where: { id: propertyId },
          data: { geocodedAddress: finalAddress }
        });
        console.log(`[Cache Update] Saved address for property ${propertyId}`);
      } catch (updateError) {
        console.error("[Cache Update Error] Failed to update DB:", updateError.message);
      }
    }

    return finalAddress;
  } catch (error) {
    console.error("Reverse geocoding error:", error.message);
    return `Lat: ${lat}, Lon: ${lon}`;
  }
}
