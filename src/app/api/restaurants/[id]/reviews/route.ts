import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/restaurants/[id]/reviews
 * List reviews for a restaurant with average rating
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const isPublished = searchParams.get("isPublished");

    // Build where clause
    const where: any = {
      restaurantId: params.id,
    };

    if (isPublished !== null && isPublished !== undefined) {
      where.isPublished = isPublished === "true";
    }

    // Get total count for pagination
    const totalCount = await prisma.review.count({ where });

    // Get reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        restaurantId: params.id,
        isPublished: true,
      },
      _avg: {
        rating: true,
      },
    });

    // Calculate rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        restaurantId: params.id,
        isPublished: true,
      },
      _count: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: totalCount,
        ratingDistribution: ratingDistribution.reduce((acc, curr) => {
          acc[curr.rating] = curr._count.rating;
          return acc;
        }, {} as Record<number, number>),
      },
    });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
