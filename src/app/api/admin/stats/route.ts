import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalUsers,
      usersLast30,
      usersPrev30,
      totalRestaurants,
      restaurantsLast30,
      restaurantsPrev30,
      totalOrders,
      ordersLast30,
      ordersPrev30,
      totalRevenue,
      revenueLast30,
      revenuePrev30,
      totalReviews,
      planDistribution,
      recentUsers,
      recentOrders,
      topRestaurants,
      orderStatusDistribution,
      dailySignups,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),

      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.restaurant.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),

      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),

      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),

      prisma.review.count(),

      // Plan distribution
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),

      // Recent users
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { restaurants: true } },
        },
      }),

      // Recent orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          type: true,
          createdAt: true,
          restaurant: { select: { name: true } },
          customerName: true,
        },
      }),

      // Top restaurants by order count
      prisma.restaurant.findMany({
        take: 10,
        orderBy: { orders: { _count: "desc" } },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          isActive: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          _count: { select: { orders: true, menuItems: true, reviews: true } },
        },
      }),

      // Order status distribution
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Daily signups last 30 days
      prisma.$queryRaw`
        SELECT DATE(\"createdAt\") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    // Calculate trends
    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const revLast = Number(revenueLast30._sum.totalAmount || 0);
    const revPrev = Number(revenuePrev30._sum.totalAmount || 0);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue: revenue,
        totalReviews,
        trends: {
          users: calcTrend(usersLast30, usersPrev30),
          restaurants: calcTrend(restaurantsLast30, restaurantsPrev30),
          orders: calcTrend(ordersLast30, ordersPrev30),
          revenue: calcTrend(revLast, revPrev),
        },
        last30Days: {
          users: usersLast30,
          restaurants: restaurantsLast30,
          orders: ordersLast30,
          revenue: revLast,
        },
      },
      planDistribution,
      recentUsers,
      recentOrders,
      topRestaurants,
      orderStatusDistribution,
      dailySignups,
    });
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
