import dotenv from "dotenv";
import { connectDB } from "./src/config/database.js";
import { connectRedis } from "./src/config/redis.js";

// Load environment variables
dotenv.config();

console.log("🧪 Testing KejaYangu API Configuration...\n");

// Test database connection
console.log("📊 Testing MongoDB connection...");
try {
  await connectDB();
  console.log("✅ MongoDB connection successful\n");
} catch (error) {
  console.log("❌ MongoDB connection failed:", error.message, "\n");
}

// Test Redis connection
console.log("🔴 Testing Redis connection...");
try {
  await connectRedis();
  console.log("✅ Redis connection successful\n");
} catch (error) {
  console.log("❌ Redis connection failed:", error.message, "\n");
}

console.log("🎯 Configuration test completed!");
console.log("\n📝 Next steps:");
console.log("1. Set up your .env file with proper credentials");
console.log("2. Start MongoDB and Redis services");
console.log("3. Run: npm run dev");
console.log("4. Test the API at: http://localhost:5000/health");

process.exit(0);
