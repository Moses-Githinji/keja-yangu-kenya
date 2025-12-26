import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdminUser() {
  console.log("🌱 Seeding system admin user...");

  try {
    console.log("🔍 Checking Prisma client connection...");
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection successful");

    // Create a strong password with letters, numbers, and special characters
    const strongPassword = "KejaYangu@2024!Admin#123";
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(strongPassword, 12);
    console.log("✅ Password hashed successfully");

    console.log("👤 Creating/updating admin user...");
    // Create or update admin user with specific credentials
    // Use a different phone number to avoid conflict
    const admin = await prisma.user.upsert({
      where: {
        email: "ndirangugithinji23@gmail.com",
      },
      update: {
        password: hashedPassword,
        firstName: "Moses",
        lastName: "Githinji",
        phone: "+254746365678", // Changed to avoid conflict
        role: "ADMIN",
        isVerified: true,
        isActive: true,
      },
      create: {
        email: "ndirangugithinji23@gmail.com",
        password: hashedPassword,
        firstName: "Moses",
        lastName: "Githinji",
        phone: "+254746365678", // Changed to avoid conflict
        role: "ADMIN",
        isVerified: true,
        isActive: true,
      },
    });
    console.log("✅ Admin user upsert successful");

    console.log("✅ System admin user seeded successfully!");
    console.log(`📊 Admin Details:`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Password: ${strongPassword}`);
    console.log(`   - First Name: ${admin.firstName}`);
    console.log(`   - Last Name: ${admin.lastName}`);
    console.log(`   - Phone: ${admin.phone}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Verified: ${admin.isVerified}`);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    throw error;
  } finally {
    console.log("🔌 Disconnecting from database...");
    await prisma.$disconnect();
    console.log("✅ Disconnected from database");
  }
}

seedAdminUser().catch((e) => {
  console.error(e);
  process.exit(1);
});
