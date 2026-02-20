import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create test agent user
  const agentEmail = "agent@example.com";
  const agentPassword = await bcrypt.hash("Agent@123", 10);

  // Check if agent already exists
  const existingAgent = await prisma.user.findUnique({
    where: { email: agentEmail },
  });

  if (!existingAgent) {
    // Create agent user
    const agent = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: agentEmail,
        password: agentPassword,
        phone: "+254700000000",
        role: "AGENT",
        isVerified: true,
        isActive: true,
        agentProfile: {
          create: {
            company: "Dummy Real Estate",
            licenseNumber: "AGENT-001",
            experience: 5,
            specializations: "Residential,Commercial",
            bio: "Professional real estate agent with 5+ years of experience",
            website: "https://dummyrealestate.com",
            isVerified: true,
            verificationDate: new Date(),
          },
        },
        preferences: {
          create: {
            propertyTypes: "Apartment,House",
            locations: "Nairobi,Mombasa",
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
          },
        },
      },
      include: {
        agentProfile: true,
      },
    });

    console.log("Created agent user:", {
      id: agent.id,
      email: agent.email,
      role: agent.role,
    });
  } else {
    console.log("Agent user already exists:", existingAgent.email);
  }

  // Create test host user
  const hostEmail = "host@kejayangu.com";
  const hostPassword = await bcrypt.hash("Host@123", 10);

  // Check if host already exists
  // Check if host already exists by email or phone
  const existingHost = await prisma.user.findFirst({
    where: {
      OR: [
        { email: hostEmail },
        { phone: "+254711000001" }
      ]
    },
  });

  if (!existingHost) {
    // Create host user
    const host = await prisma.user.create({
      data: {
        firstName: "Sarah",
        lastName: "Kimani",
        email: hostEmail,
        password: hostPassword,
        phone: "+254711000001",
        role: "HOST",
        isVerified: true,
        isActive: true,
        preferences: {
          create: {
            propertyTypes: "Apartment,House,Villa",
            locations: "Nairobi,Kiambu",
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
          },
        },
      },
    });

    console.log("Created host user:", {
      id: host.id,
      email: host.email,
      role: host.role,
    });
  } else {
    console.log("Host user already exists:", existingHost.email);
  }

  // Seeding Properties
  const agentUser = await prisma.user.findUnique({ where: { email: agentEmail } });
  
  if (agentUser) {
    const propertyCount = await prisma.property.count();
    
    if (propertyCount === 0) {
      console.log("Seeding properties...");
      
      const properties = [
        {
          title: "Luxury Apartment in Westlands",
          description: "Stunning 3 bedroom apartment with modern amenities and city views.",
          propertyType: "APARTMENT",
          listingType: "SALE",
          status: "AVAILABLE",
          address: "Westlands Road",
          city: "Nairobi",
          county: "Nairobi",
          price: 25000000,
          currency: "KES",
          priceType: "FIXED",
          bedrooms: 3,
          bathrooms: 2,
          areaSize: 150,
          areaUnit: "SQM",
          features: "Gym,pool,Parking,Security",
          amenities: "Elevator,Backup Generator",
          nearbyAmenities: "Sarit Centre,Westgate Mall",
          isFeatured: true,
          isVerified: true,
          slug: "luxury-apartment-westlands",
          ownerId: agentUser.id,
          latitude: -1.2683,
          longitude: 36.8064,
          images: {
            create: [
              { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267", isPrimary: true, order: 1 },
              { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688", isPrimary: false, order: 2 }
            ]
          }
        },
        {
          title: "Modern House in Kilimani",
          description: "Spacious 4 bedroom house with garden in a quiet neighborhood.",
          propertyType: "HOUSE",
          listingType: "RENT",
          status: "AVAILABLE",
          address: "Argwings Kodhek Road",
          city: "Nairobi",
          county: "Nairobi",
          price: 180000,
          currency: "KES",
          priceType: "RENT",
          rentPeriod: "MONTHLY",
          bedrooms: 4,
          bathrooms: 3,
          areaSize: 250,
          areaUnit: "SQM",
          features: "Garden,Garage,Staff Quarters",
          amenities: "Water Tanks,Solar Heater",
          nearbyAmenities: "Yaya Centre,Kilimani Primary",
          isFeatured: true,
          isVerified: true,
          slug: "modern-house-kilimani",
          ownerId: agentUser.id,
          latitude: -1.2921,
          longitude: 36.7871,
          images: {
            create: [
              { url: "https://images.unsplash.com/photo-1600596542815-e32870110018", isPrimary: true, order: 1 },
              { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6", isPrimary: false, order: 2 }
            ]
          }
        }
      ];

      for (const prop of properties) {
        await prisma.property.create({ data: prop });
      }
      console.log(`Seeded ${properties.length} featured properties.`);
    } else {
        console.log("Properties already exist, skipping property seeding.");
    }
  }
}

try {
  await main();
} catch (e) {
  console.error("Error seeding database:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
