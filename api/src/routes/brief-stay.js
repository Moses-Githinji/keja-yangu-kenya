// routes/brief-stay.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  authenticateToken,
  requireHost,
  requireRole,
} from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get host dashboard stats
router.get("/host/stats", authenticateToken, requireHost, async (req, res) => {
  try {
    const hostId = req.user.id;

    const listings = await prisma.property.findMany({
      where: {
        agentId: hostId,
        listingType: "SHORT_TERM_RENT",
        status: "ACTIVE",
      },
    });

    const [
      bookingsCount,
      pendingBookings,
      totalEarnings,
      upcomingCheckIns,
      reviews
    ] = await Promise.all([
      prisma.shortTermBooking.count({ where: { hostId } }),
      prisma.shortTermBooking.count({ where: { hostId, status: "PENDING" } }),
      prisma.shortTermBooking.aggregate({
        _sum: { totalAmount: true },
        where: { hostId, status: "COMPLETED" },
      }),
      prisma.shortTermBooking.count({
        where: {
          hostId,
          status: "CONFIRMED",
          checkIn: { gte: new Date() },
        },
      }),
      prisma.bookingReview.findMany({
        where: { revieweeId: hostId },
        select: { rating: true },
      })
    ]);

    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    const stats = {
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === "ACTIVE").length,
      occupancyRate: listings.length > 0 ? 75 : 0, // Simplified for now
      totalBookings: bookingsCount,
      pendingBookings: pendingBookings,
      totalEarnings: totalEarnings._sum.totalAmount || 0,
      monthlyEarnings: (totalEarnings._sum.totalAmount || 0) / 12, // Simplified
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      upcomingCheckIns: upcomingCheckIns,
      thisMonthViews: listings.reduce((acc, l) => acc + (l.views || 0), 0),
      averagePrice: listings.length > 0
        ? listings.reduce((acc, l) => acc + l.price, 0) / listings.length
        : 0,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching host stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch statistics" });
  }
});

// ... (keep all your other routes exactly the same)

// Change this line at the bottom:
export default router;
