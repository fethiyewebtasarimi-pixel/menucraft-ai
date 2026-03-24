import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/restaurants/[id]/analytics
 * Get analytics data for a restaurant with date range support
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Set time to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get daily analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        restaurantId: params.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate summary statistics
    const summary = {
      totalMenuViews: 0,
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalCustomers: 0,
    };

    analytics.forEach((day) => {
      summary.totalMenuViews += day.menuViews;
      summary.totalOrders += day.totalOrders;
      summary.totalRevenue += Number(day.totalRevenue);
      summary.totalCustomers += day.uniqueVisitors || 0;
    });

    summary.avgOrderValue = summary.totalOrders > 0
      ? summary.totalRevenue / summary.totalOrders
      : 0;

    // Get top selling items in date range
    const topItems = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          restaurantId: params.id,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    // Get menu item details for top items
    const menuItemIds = topItems.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const topItemsWithDetails = topItems.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      return {
        menuItem,
        quantitySold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    });

    // Get order status distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ["status"],
      where: {
        restaurantId: params.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    const statusDistribution = orderStatusDistribution.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get order type distribution
    const orderTypeDistribution = await prisma.order.groupBy({
      by: ["type"],
      where: {
        restaurantId: params.id,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    const typeDistribution = orderTypeDistribution.reduce((acc, curr) => {
      acc[curr.type] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Get reviews summary
    const reviewsData = await prisma.review.aggregate({
      where: {
        restaurantId: params.id,
        createdAt: {
          gte: start,
          lte: end,
        },
        isPublished: true,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      dateRange: {
        start,
        end,
      },
      summary,
      dailyData: analytics,
      topSellingItems: topItemsWithDetails,
      orderStatusDistribution: statusDistribution,
      orderTypeDistribution: typeDistribution,
      reviews: {
        averageRating: reviewsData._avg.rating || 0,
        totalReviews: reviewsData._count.id,
      },
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
