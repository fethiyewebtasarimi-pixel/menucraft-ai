import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const rating = searchParams.get("rating") || "";
    const published = searchParams.get("published") || "";
    const restaurantId = searchParams.get("restaurantId") || "";

    const where: Record<string, unknown> = {};
    if (rating) where.rating = parseInt(rating);
    if (published === "true") where.isPublished = true;
    if (published === "false") where.isPublished = false;
    if (restaurantId) where.restaurantId = restaurantId;

    const [reviews, total, avgRating] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          rating: true,
          comment: true,
          isPublished: true,
          createdAt: true,
          restaurant: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      averageRating: avgRating._avg.rating || 0,
    });
  } catch (error) {
    console.error("[ADMIN_REVIEWS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
