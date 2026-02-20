import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@kejayangu.com";
  const newPassword = "123456";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log(`Resetting password for ${email}...`);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        lockUntil: null
      },
    });

    console.log(`✅ Password reset successfully for ${user.email}`);
    console.log(`New Password: ${newPassword}`);
    
    // Verify immediate comparison to be sure
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`Self-verification match: ${isValid}`);

  } catch (error) {
    console.error("❌ Error resetting password:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
