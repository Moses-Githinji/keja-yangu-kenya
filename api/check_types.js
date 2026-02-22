import { getPrismaClient } from "./src/utils/prismaClient.js";

async function checkListingTypes() {
    const prisma = getPrismaClient();
    const types = await prisma.property.groupBy({
        by: ['listingType'],
        _count: {
            listingType: true
        }
    });

    console.log("Found Listing Types in DB:");
    console.table(types);
    process.exit(0);
}

checkListingTypes();
