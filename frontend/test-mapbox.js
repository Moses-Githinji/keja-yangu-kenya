#!/usr/bin/env node

/**
 * Test script to verify Mapbox access token configuration
 * Run this script to check if your Mapbox token is properly configured
 */

console.log("🗺️  Mapbox Configuration Test");
console.log("=============================\n");

// Check if we're in the right directory
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, ".env");
const envExampleFile = path.join(__dirname, ".env.example");

console.log("📁 Checking environment files...\n");

// Check for .env file
if (fs.existsSync(envFile)) {
  console.log("✅ .env file found");

  const envContent = fs.readFileSync(envFile, "utf8");
  const mapboxToken = envContent.match(/VITE_MAPBOX_ACCESS_TOKEN=(.+)/);

  if (mapboxToken) {
    const token = mapboxToken[1].trim();
    if (token && token !== "YOUR_MAPBOX_ACCESS_TOKEN_HERE") {
      console.log("✅ VITE_MAPBOX_ACCESS_TOKEN is configured");
      console.log(
        `   Token: ${token.substring(0, 10)}...${token.substring(
          token.length - 4
        )}`
      );

      // Validate token format
      if (token.startsWith("pk.")) {
        console.log("✅ Token format is correct (starts with pk.)");
      } else {
        console.log(
          "⚠️  Token format may be incorrect (should start with pk.)"
        );
      }
    } else {
      console.log("❌ VITE_MAPBOX_ACCESS_TOKEN is not properly configured");
      console.log("   Please update your .env file with a valid token");
    }
  } else {
    console.log("❌ VITE_MAPBOX_ACCESS_TOKEN not found in .env file");
  }
} else {
  console.log("❌ .env file not found");
  console.log("   Please create a .env file in the frontend directory");
}

console.log("\n📋 Environment Configuration:");
console.log("============================");

// Check for .env.example
if (fs.existsSync(envExampleFile)) {
  console.log("✅ .env.example file exists");
} else {
  console.log("❌ .env.example file not found");
}

console.log("\n🔧 Setup Instructions:");
console.log("=====================");
console.log("1. Create a .env file in the frontend directory");
console.log("2. Add your Mapbox access token:");
console.log("   VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here");
console.log("3. Restart your development server");
console.log("4. Test the map on /buy, /rent, or /property pages");

console.log("\n🌐 Get your Mapbox token from: https://account.mapbox.com/");
console.log("📖 Full setup guide: MAPBOX_SETUP.md");

console.log("\n✨ Test completed!");
