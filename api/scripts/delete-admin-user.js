import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteUserByEmail(email) {
  console.log(`🔍 Searching for user with email: ${email}...`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        properties: true,
      }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName} (ID: ${user.id}, Role: ${user.role})`);

    // Check for properties
    if (user.properties.length > 0) {
      console.log(`⚠️ User owns ${user.properties.length} properties. Deleting them first...`);
      
      // Delete property images first
      for (const property of user.properties) {
        await prisma.propertyImage.deleteMany({
          where: { propertyId: property.id }
        });
      }
      
      // Delete properties
      await prisma.property.deleteMany({
        where: { ownerId: user.id }
      });
      console.log(`✅ Deleted dependent properties.`);
    }

    // Delete the user
    await prisma.user.delete({
      where: { email }
    });

    console.log(`✅ Successfully deleted user: ${email}`);

  } catch (error) {
    console.error("❌ Error during user deletion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

const targetEmail = "admin@kejayangukenya.com";
deleteUserByEmail(targetEmail);
