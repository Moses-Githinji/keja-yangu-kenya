import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@kejayangu.com";
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin user already exists:", email);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      email,
      password: hashedPassword,
      phone: "+254700000001",
      role: "ADMIN",
      isVerified: true,
      isActive: true,
      preferences: {
        create: {
          propertyTypes: "All",
          locations: "All",
        },
      },
    },
  });

  console.log("Admin user created successfully:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
