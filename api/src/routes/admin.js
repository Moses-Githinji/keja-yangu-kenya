import express from "express";
import { getPrismaClient } from "../config/database.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get system-wide statistics for admin dashboard
 * @access  Private (Admin only)
 */
router.get("/stats", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    const [
      totalProperties,
      totalUsers,
      totalAgents,
      unreadMessages,
      totalRevenue,
      agentApplications
    ] = await Promise.all([
      prisma.property.count(),
      prisma.user.count(),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.message.count({ where: { isRead: false } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" }
      }),
      prisma.agentProfile.count({ where: { isVerified: false } })
    ]);

    res.status(200).json({
      status: "success",
      data: {
        properties: totalProperties,
        users: totalUsers,
        agents: totalAgents,
        unreadMessages,
        revenue: totalRevenue._sum.amount || 0,
        pendingAgents: agentApplications,
        systemHealth: "98.5%", // Placeholder for actual health monitoring
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    next(error);
  }
});

/**
 * @route   GET /api/v1/admin/recent-activity
 * @desc    Get recent system activities
 * @access  Private (Admin only)
 */
router.get("/recent-activity", authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const prisma = getPrismaClient();

    // Fetching actual recent database records to simulate activity
    const [recentUsers, recentProperties, recentInquiries] = await Promise.all([
      prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { firstName: true, lastName: true, createdAt: true, role: true } }),
      prisma.property.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { title: true, createdAt: true } }),
      prisma.propertyInquiry.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true } } } })
    ]);

    // Format into a unified activity list
    const activities = [
      ...recentUsers.map(u => ({
        type: "USER_REGISTRATION",
        title: "New user registration",
        description: `${u.firstName} ${u.lastName} joined as ${u.role}`,
        timestamp: u.createdAt
      })),
      ...recentProperties.map(p => ({
        type: "PROPERTY_LISTED",
        title: "New property listing",
        description: `"${p.title}" was added`,
        timestamp: p.createdAt
      })),
      ...recentInquiries.map(i => ({
        type: "PROPERTY_INQUIRY",
        title: "New property inquiry",
        description: `${i.user.firstName} inquired about a property`,
        timestamp: i.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.status(200).json({
      status: "success",
      data: activities
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    next(error);
  }
});

export default router;
