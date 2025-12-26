import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log("🔍 Checking for users with phone +254746365677...");

    const usersWithPhone = await prisma.user.findMany({
      where: {
        phone: "+254746365677",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    console.log(`Found ${usersWithPhone.length} user(s) with this phone:`);
    usersWithPhone.forEach((user) => {
      console.log(
        `- ID: ${user.id}, Email: ${user.email}, Name: ${user.firstName} ${user.lastName}, Role: ${user.role}`
      );
    });

    console.log(
      "\n🔍 Checking for admin email ndirangugithinji23@gmail.com..."
    );

    const adminUser = await prisma.user.findUnique({
      where: {
        email: "ndirangugithinji23@gmail.com",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    if (adminUser) {
      console.log("Admin user found:");
      console.log(
        `- ID: ${adminUser.id}, Email: ${adminUser.email}, Name: ${adminUser.firstName} ${adminUser.lastName}, Phone: ${adminUser.phone}, Role: ${adminUser.role}`
      );
    } else {
      console.log("Admin user not found.");
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers().catch((e) => {
  console.error(e);
  process.exit(1);
});
