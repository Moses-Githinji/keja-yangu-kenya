import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../src/config/database.js";

// Set test environment
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

// Global test database instance
let prisma;

beforeAll(async () => {
  // Create test database connection
  prisma = new PrismaClient({
    datasourceUrl: "file:./test.db",
  });

  // Run migrations
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

  // Clean up any existing data
  await prisma.$executeRaw`DELETE FROM payments;`;
  await prisma.$executeRaw`DELETE FROM payment_logs;`;
  await prisma.$executeRaw`DELETE FROM users;`;
  await prisma.$executeRaw`DELETE FROM properties;`;
  await prisma.$executeRaw`DELETE FROM security_logs;`;
  await prisma.$executeRaw`DELETE FROM blocked_ips;`;

  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
});

afterAll(async () => {
  // Clean up test database
  if (prisma) {
    await prisma.$disconnect();
  }

  // Remove test database file
  const fs = await import("fs");
  const path = await import("path");
  const testDbPath = path.join(process.cwd(), "test.db");

  try {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  } catch (error) {
    console.warn("Failed to clean up test database:", error.message);
  }
});

afterEach(async () => {
  // Clean up data between tests
  if (prisma) {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
    await prisma.$executeRaw`DELETE FROM payments;`;
    await prisma.$executeRaw`DELETE FROM payment_logs;`;
    await prisma.$executeRaw`DELETE FROM users;`;
    await prisma.$executeRaw`DELETE FROM properties;`;
    await prisma.$executeRaw`DELETE FROM security_logs;`;
    await prisma.$executeRaw`DELETE FROM blocked_ips;`;
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  }
});

// Mock external API calls
jest.mock("fetch", () => jest.fn());

// Mock environment variables for tests
process.env.MPESA_SANDBOX_CONSUMER_KEY = "test_consumer_key";
process.env.MPESA_SANDBOX_CONSUMER_SECRET = "test_consumer_secret";
process.env.MPESA_SANDBOX_SHORTCODE = "174379";
process.env.MPESA_SANDBOX_PASSKEY = "test_passkey";
process.env.MPESA_SANDBOX_CALLBACK_URL = "https://test.example.com/callback";

process.env.FLUTTERWAVE_PUBLIC_KEY = "test_public_key";
process.env.FLUTTERWAVE_SECRET_KEY = "test_secret_key";

process.env.STRIPE_SECRET_KEY = "sk_test_1234567890";

// Export prisma for use in tests
global.prisma = prisma;
