const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Kenyan cities and counties with realistic coordinates
const kenyaLocations = [
  // Nairobi County
  {
    city: "Nairobi",
    county: "Nairobi",
    areas: [
      { name: "Westlands", lat: -1.2681, lng: 36.8094 },
      { name: "Karen", lat: -1.3197, lng: 36.6855 },
      { name: "Kilimani", lat: -1.2589, lng: 36.7989 },
      { name: "Lavington", lat: -1.2707, lng: 36.7519 },
      { name: "Runda", lat: -1.2176, lng: 36.7626 },
      { name: "Upper Hill", lat: -1.2864, lng: 36.8219 },
      { name: "Kileleshwa", lat: -1.2921, lng: 36.7878 },
      { name: "Spring Valley", lat: -1.25, lng: 36.7833 },
      { name: "Muthaiga", lat: -1.2333, lng: 36.8167 },
      { name: "Parklands", lat: -1.25, lng: 36.8333 },
    ],
  },
  // Mombasa County
  {
    city: "Mombasa",
    county: "Mombasa",
    areas: [
      { name: "Nyali", lat: -4.0333, lng: 39.7167 },
      { name: "Bamburi", lat: -4.0167, lng: 39.7333 },
      { name: "Diani", lat: -4.2833, lng: 39.5667 },
      { name: "Likoni", lat: -4.0833, lng: 39.65 },
      { name: "Tudor", lat: -4.05, lng: 39.6833 },
    ],
  },
  // Kiambu County
  {
    city: "Kiambu",
    county: "Kiambu",
    areas: [
      { name: "Ruiru", lat: -1.15, lng: 36.9667 },
      { name: "Thika", lat: -1.0333, lng: 37.0833 },
      { name: "Limuru", lat: -1.1167, lng: 36.65 },
      { name: "Kikuyu", lat: -1.2667, lng: 36.6667 },
      { name: "Juja", lat: -1.1, lng: 37.0167 },
    ],
  },
  // Nakuru County
  {
    city: "Nakuru",
    county: "Nakuru",
    areas: [
      { name: "Nakuru Town", lat: -0.3031, lng: 36.08 },
      { name: "Naivasha", lat: -0.7167, lng: 36.4333 },
      { name: "Gilgil", lat: -0.5, lng: 36.3167 },
      { name: "Molo", lat: -0.25, lng: 35.7333 },
    ],
  },
  // Kisumu County
  {
    city: "Kisumu",
    county: "Kisumu",
    areas: [
      { name: "Kisumu Central", lat: -0.1022, lng: 34.7617 },
      { name: "Mamboleo", lat: -0.0833, lng: 34.75 },
      { name: "Milimani", lat: -0.0833, lng: 34.7667 },
    ],
  },
  // Uasin Gishu County
  {
    city: "Eldoret",
    county: "Uasin Gishu",
    areas: [
      { name: "Eldoret Town", lat: 0.5143, lng: 35.2698 },
      { name: "Pioneer", lat: 0.5, lng: 35.2833 },
      { name: "Langas", lat: 0.5333, lng: 35.2667 },
    ],
  },
];

// Property features/amenities
const propertyFeatures = [
  "Swimming Pool",
  "Gym",
  "Garden",
  "Balcony",
  "Parking",
  "Security",
  "CCTV",
  "Borehole",
  "Generator",
  "Solar Power",
  "Wifi",
  "Cable TV",
  "Elevator",
  "Intercom",
  "Laundry",
  "Playground",
  "Tennis Court",
  "Backup Water",
  "Electric Fence",
  "Gate House",
  "Servant Quarter",
  "Study Room",
  "Family Room",
  "Dining Room",
  "Kitchen Pantry",
  "Walk-in Closet",
  "En-suite Bathroom",
  "Guest Toilet",
  "Store Room",
];

// Property titles and descriptions
const propertyTitles = {
  HOUSE: [
    "Modern Family Home",
    "Spacious Bungalow",
    "Contemporary Residence",
    "Executive Mansion",
    "Luxury Villa",
    "Cozy Family House",
    "Elegant Home",
    "Stunning Property",
    "Beautiful Residence",
  ],
  APARTMENT: [
    "Luxury Apartment",
    "Modern Flat",
    "Executive Suite",
    "Penthouse Unit",
    "Studio Apartment",
    "Contemporary Apartment",
    "Serviced Apartment",
    "High-rise Unit",
    "Garden Apartment",
  ],
  VILLA: [
    "Luxury Villa",
    "Executive Villa",
    "Modern Villa",
    "Mediterranean Villa",
    "Contemporary Villa",
    "Stunning Villa",
    "Private Villa",
    "Garden Villa",
    "Exclusive Villa",
  ],
  TOWNHOUSE: [
    "Modern Townhouse",
    "Executive Townhouse",
    "Luxury Townhouse",
    "Contemporary Townhouse",
    "Spacious Townhouse",
    "Designer Townhouse",
  ],
  LAND: [
    "Prime Plot",
    "Development Land",
    "Residential Plot",
    "Commercial Plot",
    "Investment Land",
    "Beachfront Plot",
    "Agricultural Land",
    "Raw Land",
    "Building Plot",
  ],
  DUPLEX: [
    "Modern Duplex",
    "Executive Duplex",
    "Luxury Duplex",
    "Contemporary Duplex",
    "Spacious Duplex",
    "Designer Duplex",
  ],
  FARMHOUSE: [
    "Rural Farmhouse",
    "Country Home",
    "Farm Property",
    "Agricultural Estate",
    "Ranch House",
    "Countryside Villa",
  ],
  PENTHOUSE: [
    "Luxury Penthouse",
    "Executive Penthouse",
    "Sky Penthouse",
    "Premium Penthouse",
    "Exclusive Penthouse",
    "Designer Penthouse",
  ],
  COMMERCIAL: [
    "Office Building",
    "Commercial Space",
    "Retail Building",
    "Business Center",
    "Corporate Office",
    "Shopping Complex",
  ],
  STUDENT_HOSTEL: [
    "Student Accommodation",
    "Campus Hostel",
    "University Housing",
    "Student Residence",
    "College Hostel",
    "Academic Housing",
  ],
  INDUSTRIAL: [
    "Warehouse Facility",
    "Industrial Complex",
    "Manufacturing Plant",
    "Storage Facility",
    "Distribution Center",
    "Factory Building",
  ],
};

// Price ranges by property type and location tier
const priceRanges = {
  tier1: {
    // Nairobi premium areas
    HOUSE: { min: 15000000, max: 80000000 },
    APARTMENT: { min: 8000000, max: 45000000 },
    VILLA: { min: 25000000, max: 120000000 },
    TOWNHOUSE: { min: 18000000, max: 65000000 },
    LAND: { min: 5000000, max: 50000000 },
    DUPLEX: { min: 12000000, max: 55000000 },
    FARMHOUSE: { min: 8000000, max: 35000000 },
    PENTHOUSE: { min: 35000000, max: 150000000 },
    COMMERCIAL: { min: 40000000, max: 200000000 },
    STUDENT_HOSTEL: { min: 25000000, max: 80000000 },
    INDUSTRIAL: { min: 30000000, max: 120000000 },
  },
  tier2: {
    // Other major cities
    HOUSE: { min: 8000000, max: 35000000 },
    APARTMENT: { min: 4000000, max: 20000000 },
    VILLA: { min: 12000000, max: 50000000 },
    TOWNHOUSE: { min: 8000000, max: 28000000 },
    LAND: { min: 2000000, max: 20000000 },
    DUPLEX: { min: 6000000, max: 25000000 },
    FARMHOUSE: { min: 4000000, max: 15000000 },
    PENTHOUSE: { min: 15000000, max: 60000000 },
    COMMERCIAL: { min: 15000000, max: 75000000 },
    STUDENT_HOSTEL: { min: 10000000, max: 35000000 },
    INDUSTRIAL: { min: 12000000, max: 45000000 },
  },
  tier3: {
    // Smaller towns
    HOUSE: { min: 3000000, max: 15000000 },
    APARTMENT: { min: 1500000, max: 8000000 },
    VILLA: { min: 5000000, max: 20000000 },
    TOWNHOUSE: { min: 3500000, max: 12000000 },
    LAND: { min: 500000, max: 8000000 },
    DUPLEX: { min: 2500000, max: 10000000 },
    FARMHOUSE: { min: 2000000, max: 8000000 },
    PENTHOUSE: { min: 8000000, max: 25000000 },
    COMMERCIAL: { min: 5000000, max: 25000000 },
    STUDENT_HOSTEL: { min: 4000000, max: 15000000 },
    INDUSTRIAL: { min: 5000000, max: 20000000 },
  },
};

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max, decimals = 4) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generatePhoneNumber() {
  const prefixes = [
    "0701",
    "0702",
    "0703",
    "0704",
    "0705",
    "0706",
    "0707",
    "0708",
    "0709",
    "0710",
    "0711",
    "0712",
    "0713",
    "0714",
    "0715",
    "0716",
    "0717",
    "0718",
    "0719",
    "0720",
    "0721",
    "0722",
    "0723",
    "0724",
    "0725",
    "0726",
    "0727",
    "0728",
    "0729",
    "0730",
    "0731",
    "0732",
    "0733",
    "0734",
    "0735",
    "0736",
    "0737",
    "0738",
    "0739",
    "0740",
    "0741",
    "0742",
    "0743",
    "0744",
    "0745",
    "0746",
    "0747",
    "0748",
    "0749",
    "0750",
  ];
  const prefix = getRandomElement(prefixes);
  const suffix = String(getRandomInt(100000, 999999));
  return prefix + suffix;
}

function getTierByLocation(city, area) {
  if (
    city === "Nairobi" &&
    ["Karen", "Westlands", "Lavington", "Runda", "Muthaiga"].includes(area)
  ) {
    return "tier1";
  } else if (["Nairobi", "Mombasa"].includes(city)) {
    return "tier2";
  } else {
    return "tier3";
  }
}

function generatePropertyFeatures() {
  const numFeatures = getRandomInt(3, 8);
  const selectedFeatures = [];
  for (let i = 0; i < numFeatures; i++) {
    const feature = getRandomElement(propertyFeatures);
    if (!selectedFeatures.includes(feature)) {
      selectedFeatures.push(feature);
    }
  }
  return selectedFeatures;
}

function generateDescription(propertyType, location, features) {
  const descriptions = [
    `Beautiful ${propertyType.toLowerCase()} located in the heart of ${location}. This stunning property offers modern amenities and excellent connectivity.`,
    `Spacious and well-designed ${propertyType.toLowerCase()} in ${location}. Perfect for families looking for comfort and convenience.`,
    `Luxury ${propertyType.toLowerCase()} featuring contemporary design and premium finishes. Located in the prestigious ${location} area.`,
    `Modern ${propertyType.toLowerCase()} with excellent potential for investment. Situated in the rapidly developing ${location} neighborhood.`,
    `Elegant ${propertyType.toLowerCase()} offering the perfect blend of comfort and style. Conveniently located in ${location}.`,
  ];

  let description = getRandomElement(descriptions);

  if (features.length > 0) {
    const featuresText = features.slice(0, 3).join(", ");
    description += ` Features include ${featuresText} and many more amenities.`;
  }

  return description;
}

async function createUsers() {
  console.log("Creating users...");

  const users = [];
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Grace",
    "Peter",
    "Mary",
    "James",
    "Elizabeth",
    "Robert",
    "Jennifer",
    "William",
    "Linda",
    "Richard",
    "Patricia",
    "Joseph",
    "Susan",
    "Thomas",
    "Jessica",
  ];
  const lastNames = [
    "Kamau",
    "Wanjiku",
    "Ochieng",
    "Akinyi",
    "Mwangi",
    "Njeri",
    "Kiprop",
    "Chebet",
    "Omondi",
    "Wanjiru",
    "Mutua",
    "Muthoni",
    "Kimani",
    "Nyong'o",
    "Rotich",
    "Wambui",
    "Macharia",
    "Nyambura",
    "Kiprotich",
    "Wanjiku",
  ];

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@kejayangukenya.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      phone: "+254700000000",
      role: "ADMIN",
      isVerified: true,
    },
  });
  users.push(admin);

  // Create regular users
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const phone = generatePhoneNumber();

    try {
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: Math.random() < 0.1 ? "AGENT" : "USER", // 10% agents
          isVerified: Math.random() < 0.8, // 80% verified
        },
      });
      users.push(user);
    } catch (error) {
      if (error.code !== "P2002") {
        // Ignore unique constraint errors
        console.error(`Error creating user: ${error.message}`);
      }
    }
  }

  console.log(`Created ${users.length} users`);
  return users;
}

async function createProperties(users) {
  console.log("Creating properties...");

  const propertyTypes = Object.keys(propertyTitles);
  const listingTypes = ["SALE", "RENT"];
  const properties = [];

  for (const location of kenyaLocations) {
    for (const area of location.areas) {
      const numProperties = getRandomInt(15, 25); // 15-25 properties per area

      for (let i = 0; i < numProperties; i++) {
        const propertyType = getRandomElement(propertyTypes);
        const listingType = getRandomElement(listingTypes);
        const tier = getTierByLocation(location.city, area.name);

        // Generate realistic coordinates around the area
        const lat = area.lat + getRandomFloat(-0.02, 0.02);
        const lng = area.lng + getRandomFloat(-0.02, 0.02);

        // Generate price based on tier and property type
        const priceRange = priceRanges[tier][propertyType];
        const price = getRandomInt(priceRange.min, priceRange.max);

        // Generate property details based on type
        let bedrooms = 0;
        let bathrooms = 0;
        let area_sqm = 0;

        switch (propertyType) {
          case "HOUSE":
          case "VILLA":
            bedrooms = getRandomInt(2, 6);
            bathrooms = getRandomInt(2, Math.min(bedrooms + 1, 5));
            area_sqm = getRandomInt(150, 500);
            break;
          case "APARTMENT":
            bedrooms = getRandomInt(1, 4);
            bathrooms = getRandomInt(1, Math.min(bedrooms + 1, 3));
            area_sqm = getRandomInt(60, 200);
            break;
          case "TOWNHOUSE":
          case "DUPLEX":
            bedrooms = getRandomInt(2, 4);
            bathrooms = getRandomInt(2, 3);
            area_sqm = getRandomInt(120, 300);
            break;
          case "LAND":
            bedrooms = 0;
            bathrooms = 0;
            area_sqm = getRandomInt(500, 5000);
            break;
          case "FARMHOUSE":
            bedrooms = getRandomInt(3, 8);
            bathrooms = getRandomInt(2, 5);
            area_sqm = getRandomInt(200, 800);
            break;
          case "PENTHOUSE":
            bedrooms = getRandomInt(2, 5);
            bathrooms = getRandomInt(2, 4);
            area_sqm = getRandomInt(150, 400);
            break;
          case "COMMERCIAL":
          case "INDUSTRIAL":
            bedrooms = 0;
            bathrooms = getRandomInt(1, 5);
            area_sqm = getRandomInt(200, 2000);
            break;
          case "STUDENT_HOSTEL":
            bedrooms = getRandomInt(10, 50);
            bathrooms = getRandomInt(5, 25);
            area_sqm = getRandomInt(500, 1500);
            break;
        }

        const features = generatePropertyFeatures();
        const title = `${getRandomElement(propertyTitles[propertyType])} in ${
          area.name
        }`;
        const description = generateDescription(
          propertyType,
          `${area.name}, ${location.city}`,
          features
        );

        // Select random owner
        const owner = getRandomElement(users);

        try {
          const property = await prisma.property.create({
            data: {
              title,
              description,
              propertyType,
              listingType,
              price,
              priceType: getRandomElement(["FIXED", "NEGOTIABLE"]),
              bedrooms,
              bathrooms,
              area: area_sqm,
              areaUnit: "SQM",
              address: `${area.name}, ${location.city}`,
              city: location.city,
              county: location.county,
              latitude: lat,
              longitude: lng,
              features,
              status: getRandomElement([
                "ACTIVE",
                "ACTIVE",
                "ACTIVE",
                "PENDING",
              ]), // 75% active
              isPremium: Math.random() < 0.2, // 20% premium
              views: getRandomInt(0, 500),
              ownerId: owner.id,
              createdAt: new Date(
                Date.now() - getRandomInt(0, 90) * 24 * 60 * 60 * 1000
              ), // Random date in last 90 days
            },
          });

          // Create property images
          const numImages = getRandomInt(3, 8);
          for (let j = 0; j < numImages; j++) {
            await prisma.propertyImage.create({
              data: {
                propertyId: property.id,
                url: `/api/placeholder/800/600?property=${property.id}&image=${
                  j + 1
                }`,
                caption: j === 0 ? "Main view" : `Property view ${j + 1}`,
                isPrimary: j === 0,
              },
            });
          }

          properties.push(property);
        } catch (error) {
          console.error(`Error creating property: ${error.message}`);
        }
      }
    }
  }

  console.log(`Created ${properties.length} properties`);
  return properties;
}

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (only properties and images, preserve users)
    console.log("Clearing existing property data...");
    await prisma.propertyImage.deleteMany();
    await prisma.property.deleteMany();
    // Note: Not deleting users to preserve registered users

    // Create new data (no users seeded, only properties if needed)
    // const users = await createUsers(); // Removed: No user seeding
    // const properties = await createProperties(users); // Removed: No property seeding

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Users: Preserved (registered users only)`);
    console.log(`   - Properties: 0 (no seeding)`);
    console.log(`   - Property Images: 0 (no seeding)`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
