const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAgent() {
  try {
    console.log('Creating agent user...');
    
    const hashedPassword = await bcrypt.hash('Agent@123', 10);
    
    const agentData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'agent@example.com',
      password: hashedPassword,
      phone: '+254700000000',
      role: 'AGENT',
      isVerified: true,
      isActive: true,
      agentProfile: {
        create: {
          company: 'Dummy Real Estate',
          licenseNumber: 'AGENT-001',
          experience: 5,
          specializations: 'Residential,Commercial',
          bio: 'Professional real estate agent with 5+ years of experience',
          website: 'https://dummyrealestate.com',
          isVerified: true,
          verificationDate: new Date()
        }
      },
      preferences: {
        create: {
          propertyTypes: 'Apartment,House',
          locations: 'Nairobi,Mombasa',
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true
        }
      }
    };

    // Check if agent already exists
    const existingAgent = await prisma.user.findUnique({
      where: { email: agentData.email },
    });

    if (existingAgent) {
      console.log('Agent already exists:', existingAgent.email);
      return;
    }

    // Create the agent
    const agent = await prisma.user.create({
      data: agentData,
      include: {
        agentProfile: true,
        preferences: true
      }
    });

    console.log('Successfully created agent user:');
    console.log({
      id: agent.id,
      email: agent.email,
      role: agent.role,
      isActive: agent.isActive,
      isVerified: agent.isVerified,
      agentProfile: agent.agentProfile
    });
    
  } catch (error) {
    console.error('Error creating agent user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAgent();
