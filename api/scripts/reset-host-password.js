import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetHostPassword() {
  try {
    const hostEmail = 'host@example.com';
    const newPassword = 'host123';
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // First, check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: hostEmail }
    });

    if (!user) {
      console.log('Host user not found. Creating a new host user...');
      // Create the host user if it doesn't exist
      const updatedUser = await prisma.user.create({
        data: {
          firstName: 'Demo',
          lastName: 'Host',
          email: hostEmail,
          password: hashedPassword,
          phone: '+254711000001',
          role: 'HOST',
          isVerified: true,
          isActive: true,
          preferences: {
            create: {
              propertyTypes: 'Apartment,House,Villa',
              locations: 'Nairobi',
              emailNotifications: true,
              smsNotifications: true,
              pushNotifications: true
            }
          }
        },
      });
      console.log('Created new host user:', updatedUser.email);
      return;
    }

    // Update the existing user's password
    const updatedUser = await prisma.user.update({
      where: { email: hostEmail },
      data: {
        password: hashedPassword,
        isActive: true,
        isVerified: true
      },
    });
    
    console.log('Password reset successful for host user:');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`New Password: ${newPassword}`);
    console.log('Please use these credentials to log in.');
    
  } catch (error) {
    console.error('Error resetting host password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetHostPassword();
