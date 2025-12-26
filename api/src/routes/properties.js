import express from 'express';
import { getPrismaClient } from '../utils/prismaClient.js';

const router = express.Router();

// @desc    Get featured properties
// @route   GET /api/v1/properties/featured
// @access  Public
router.get("/featured", async (req, res, next) => {
  try {
    const prisma = getPrismaClient();
    const featuredProperties = await prisma.property.findMany({
      where: {
        isFeatured: true,
        status: "ACTIVE",
      },
      take: parseInt(req.query.limit) || 5,
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          where: { isPrimary: true },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        agent: {
          select: {
            firstName: true,
            lastName: true,
            agentProfile: {
              select: {
                company: true,
              },
            },
          },
        },
      },
    });

    const result = {
      status: "success",
      results: featuredProperties.length,
      data: featuredProperties,
    };

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
