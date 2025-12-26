import { PrismaClient } from "@prisma/client";

let prisma = null;

const connectDB = async () => {
  try {
    if (!prisma) {
      prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["error"],
      });
    }

    await prisma.$connect();
    console.log("✅ Prisma connected to PostgreSQL");
    console.log(
      `📊 Database: ${
        process.env.DATABASE_URL?.split("/").pop() || "keja_yangu_db"
      }`
    );

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await prisma.$disconnect();
        console.log("PostgreSQL connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing PostgreSQL connection:", err);
        process.exit(1);
      }
    });

    process.on("SIGTERM", async () => {
      try {
        await prisma.$disconnect();
        console.log("PostgreSQL connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing PostgreSQL connection:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Prisma connection error:", error.message);
    process.exit(1);
  }
};

export const getPrismaClient = () => {
  if (!prisma) {
    throw new Error("Prisma client not initialized. Call connectDB() first.");
  }
  return prisma;
};

export const closeDB = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log("Prisma connection closed");
    } catch (error) {
      console.error("Error closing Prisma connection:", error);
    }
  }
};

export default connectDB;
