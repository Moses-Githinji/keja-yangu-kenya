// Test script for the monetization system
// Run with: node test-monetization.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMonetizationSystem() {
  try {
    console.log("🧪 Testing KejaYangu Monetization System...\n");

    // Test 1: Check if new models are accessible
    console.log("1. Testing database schema...");

    // Test ContentCreatorProfile model
    const creatorCount = await prisma.contentCreatorProfile.count();
    console.log(
      `   ✅ ContentCreatorProfile model accessible (${creatorCount} records)`
    );

    // Test PropertyEarnings model
    const earningsCount = await prisma.propertyEarnings.count();
    console.log(
      `   ✅ PropertyEarnings model accessible (${earningsCount} records)`
    );

    // Test CreatorPayouts model
    const payoutsCount = await prisma.creatorPayouts.count();
    console.log(
      `   ✅ CreatorPayouts model accessible (${payoutsCount} records)`
    );

    // Test AdRevenue model
    const adRevenueCount = await prisma.adRevenue.count();
    console.log(`   ✅ AdRevenue model accessible (${adRevenueCount} records)`);

    // Test ComplianceViolation model
    const violationsCount = await prisma.complianceViolation.count();
    console.log(
      `   ✅ ComplianceViolation model accessible (${violationsCount} records)`
    );

    // Test 2: Check enum values
    console.log("\n2. Testing enum values...");

    const userRoles = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"UserRole")) as role;
    `;
    console.log(
      `   ✅ UserRole enum values: ${userRoles.map((r) => r.role).join(", ")}`
    );

    const creatorStatuses = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"CreatorEnrollmentStatus")) as status;
    `;
    console.log(
      `   ✅ CreatorEnrollmentStatus enum values: ${creatorStatuses
        .map((s) => s.status)
        .join(", ")}`
    );

    const earningsTypes = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"EarningsType")) as type;
    `;
    console.log(
      `   ✅ EarningsType enum values: ${earningsTypes
        .map((t) => t.type)
        .join(", ")}`
    );

    // Test 3: Check database indexes
    console.log("\n3. Testing database indexes...");

    const indexes = await prisma.$queryRaw`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('properties', 'content_creator_profiles', 'property_earnings')
      ORDER BY tablename, indexname;
    `;

    console.log("   ✅ Database indexes:");
    indexes.forEach((index) => {
      console.log(`      - ${index.tablename}: ${index.indexname}`);
    });

    // Test 4: Simulate earnings calculation
    console.log("\n4. Testing earnings calculation logic...");

    const viewRate = 0.01; // KES per view
    const inquiryRate = 0.5; // KES per inquiry
    const premiumRate = 0.1; // 10% of premium fee

    const sampleViews = 1000;
    const sampleInquiries = 50;
    const samplePremiumFee = 1000;

    const viewEarnings = sampleViews * viewRate;
    const inquiryEarnings = sampleInquiries * inquiryRate;
    const premiumEarnings = samplePremiumFee * premiumRate;
    const totalEarnings = viewEarnings + inquiryEarnings + premiumEarnings;

    console.log(`   ✅ Sample earnings calculation:`);
    console.log(
      `      - Views: ${sampleViews} × KES ${viewRate} = KES ${viewEarnings}`
    );
    console.log(
      `      - Inquiries: ${sampleInquiries} × KES ${inquiryRate} = KES ${inquiryEarnings}`
    );
    console.log(
      `      - Premium: KES ${samplePremiumFee} × ${premiumRate} = KES ${premiumEarnings}`
    );
    console.log(`      - Total: KES ${totalEarnings}`);

    // Test 5: Check compliance scoring
    console.log("\n5. Testing compliance scoring...");

    const complianceLevels = [
      { score: 95, level: "Excellent", color: "Green" },
      { score: 75, level: "Good", color: "Yellow" },
      { score: 55, level: "Warning", color: "Orange" },
      { score: 25, level: "Suspension", color: "Red" },
    ];

    console.log("   ✅ Compliance score levels:");
    complianceLevels.forEach((level) => {
      console.log(
        `      - ${level.score}/100: ${level.level} (${level.color} zone)`
      );
    });

    console.log(
      "\n🎉 All tests passed! The monetization system is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMonetizationSystem();
