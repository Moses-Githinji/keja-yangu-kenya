import axios from "axios";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log("Testing authentication flow...");

    // Test 1: Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: "agent@example.com" },
    });

    if (!user) {
      console.log("❌ User not found in database");
      return;
    }

    console.log("✅ User found in database:", {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
    });

    // Test 2: Test password verification
    const passwordMatch = await bcrypt.compare("Agent@123", user.password);
    console.log(
      "✅ Password verification:",
      passwordMatch ? "PASSED" : "FAILED"
    );

    // Test 3: Test API call
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/auth/login",
        {
          email: "agent@example.com",
          password: "Agent@123",
        }
      );

      console.log("✅ Login successful:", response.data);

      // Test 4: Test profile endpoint with token
      if (response.data.data.accessToken) {
        const profileResponse = await axios.get(
          "http://localhost:5000/api/v1/users/profile",
          {
            headers: {
              Authorization: `Bearer ${response.data.data.accessToken}`,
            },
          }
        );

        console.log("✅ Profile fetch successful:", profileResponse.data);
      }
    } catch (apiError) {
      console.log("❌ API Error:", apiError.response?.data || apiError.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
