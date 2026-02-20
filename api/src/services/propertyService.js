import { getPrismaClient } from "../config/database.js";

const DEFAULT_PAGE_SIZE = 10;

/**
 * Get properties with pagination and filtering
 * @param {Object} filters - Filter criteria
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} Paginated properties and metadata
 */
export const getProperties = async (filters = {}, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const prisma = getPrismaClient();
  const skip = (page - 1) * pageSize;
  
  const where = buildWhereClause(filters);
  
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        images: true,
        features: true,
        agent: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            company: true
          }
        }
      },
      orderBy: {
        isFeatured: 'desc',
        createdAt: 'desc'
      }
    }),
    prisma.property.count({ where })
  ]);

  return {
    data: properties,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

/**
 * Get a single property by ID
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Property details
 */
export const getPropertyById = async (id) => {
  const prisma = getPrismaClient();
  
  return prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      features: true,
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          avatar: true,
          company: true,
          bio: true,
          licenseNumber: true
        }
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
};

/**
 * Create a new property
 * @param {Object} propertyData - Property data
 * @param {string} userId - ID of the user creating the property
 * @returns {Promise<Object>} Created property
 */
export const createProperty = async (propertyData, userId) => {
  const prisma = getPrismaClient();
  
  const { features, images, ...property } = propertyData;
  
  return prisma.property.create({
    data: {
      ...property,
      agentId: userId,
      features: features ? { create: features } : undefined,
      images: images ? { create: images } : undefined
    },
    include: {
      images: true,
      features: true,
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      }
    }
  });
};

/**
 * Update an existing property
 * @param {string} id - Property ID
 * @param {Object} updates - Property updates
 * @returns {Promise<Object>} Updated property
 */
export const updateProperty = async (id, updates) => {
  const prisma = getPrismaClient();
  const { features, images, ...propertyUpdates } = updates;
  
  // Handle features and images updates if provided
  const data = { ...propertyUpdates };
  
  if (features) {
    // Delete existing features and create new ones
    await prisma.propertyFeature.deleteMany({ where: { propertyId: id } });
    data.features = { create: features };
  }
  
  if (images) {
    // Delete existing images and create new ones
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    data.images = { create: images };
  }
  
  return prisma.property.update({
    where: { id },
    data,
    include: {
      images: true,
      features: true,
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true
        }
      }
    }
  });
};

/**
 * Delete a property
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Deleted property
 */
export const deleteProperty = async (id) => {
  const prisma = getPrismaClient();
  
  // First delete related records
  await prisma.propertyFeature.deleteMany({ where: { propertyId: id } });
  await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
  
  // Then delete the property
  return prisma.property.delete({
    where: { id }
  });
};

/**
 * Get featured properties
 * @param {number} limit - Maximum number of properties to return
 * @returns {Promise<Array>} List of featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  const prisma = getPrismaClient();
  
  return prisma.property.findMany({
    where: { isFeatured: true },
    take: limit,
    include: {
      images: { take: 1 },
      agent: {
        select: {
          id: true,
          name: true,
          company: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};

/**
 * Get similar properties
 * @param {string} propertyId - Property ID to find similar properties for
 * @param {Object} filters - Filter criteria (propertyType, location, bedrooms, priceRange)
 * @param {number} limit - Maximum number of properties to return
 * @returns {Promise<Array>} List of similar properties
 */
export const getSimilarProperties = async (propertyId, filters = {}, limit = 4) => {
  const prisma = getPrismaClient();
  
  // Get the current property to compare against
  const currentProperty = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      propertyType: true,
      city: true,
      county: true,
      bedrooms: true,
      price: true,
      areaSize: true
    }
  });

  if (!currentProperty) {
    throw new Error('Property not found');
  }

  // Build the where clause for similar properties
  const where = {
    id: { not: propertyId },
    status: 'ACTIVE',
    propertyType: filters.propertyType || currentProperty.propertyType,
    OR: [
      { city: filters.location || currentProperty.city },
      { county: filters.location || currentProperty.county }
    ]
  };

  // Add bedroom filter if specified or if current property has bedrooms
  if (filters.bedrooms || currentProperty.bedrooms) {
    const targetBedrooms = filters.bedrooms || currentProperty.bedrooms;
    where.bedrooms = {
      gte: Math.max(1, targetBedrooms - 1),
      lte: targetBedrooms + 1
    };
  }

  // Add price range filter (within 20% of current price)
  if (currentProperty.price) {
    const priceVariance = currentProperty.price * 0.2;
    where.price = {
      gte: currentProperty.price - priceVariance,
      lte: currentProperty.price + priceVariance
    };
  }

  // Add area size filter (within 20% of current area)
  if (currentProperty.areaSize) {
    const areaVariance = currentProperty.areaSize * 0.2;
    where.areaSize = {
      gte: currentProperty.areaSize - areaVariance,
      lte: currentProperty.areaSize + areaVariance
    };
  }

  return prisma.property.findMany({
    where,
    take: limit,
    include: {
      images: { 
        take: 1,
        where: { isPrimary: true }
      },
      agent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          agentProfile: {
            select: {
              company: true,
              avatar: true
            }
          }
        }
      }
    },
    orderBy: [
      { isFeatured: 'desc' },
      { updatedAt: 'desc' }
    ]
  });
};

/**
 * Get properties by agent
 * @param {string} agentId - Agent ID
 * @param {number} limit - Maximum number of properties to return
 * @returns {Promise<Array>} List of properties by agent
 */
export const getPropertiesByAgent = async (agentId, limit = 6) => {
  const prisma = getPrismaClient();
  
  return prisma.property.findMany({
    where: { agentId, status: 'ACTIVE' },
    take: limit,
    include: {
      images: { take: 1 },
      features: true
    },
    orderBy: {
      isFeatured: 'desc',
      updatedAt: 'desc'
    }
  });
};

/**
 * Build WHERE clause for property queries
 * @private
 */
const buildWhereClause = (filters) => {
  const { 
    minPrice, 
    maxPrice, 
    propertyType, 
    listingType,
    bedrooms,
    bathrooms,
    location,
    search,
    agentId,
    status = 'ACTIVE',
    isFeatured
  } = filters;

  const where = { status };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  if (propertyType) where.propertyType = propertyType;
  if (listingType) where.listingType = listingType;
  if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
  if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };
  if (agentId) where.agentId = agentId;
  if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured;

  if (location) {
    where.OR = [
      { city: { contains: location, mode: 'insensitive' } },
      { county: { contains: location, mode: 'insensitive' } },
      { address: { contains: location, mode: 'insensitive' } },
      { neighborhood: { contains: location, mode: 'insensitive' } }
    ];
  }

  if (search) {
    where.OR = [
      ...(where.OR || []),
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  return where;
};
