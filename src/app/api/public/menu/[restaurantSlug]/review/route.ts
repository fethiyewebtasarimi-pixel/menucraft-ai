import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicLimiter, getClientIp } from "@/lib/rate-limit";
import { notifyNewReview } from "@/lib/notifications";
import { createReviewSchema } from "@/lib/validations/review";

/**
 * POST /api/public/menu/[restaurantSlug]/review
 * Submit review for a restaurant (NO AUTH REQUIRED)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantSlug: string } }
) {
  try {
    const ip = getClientIp(req);
    const { success } = await publicLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug: params.restaurantSlug,
        isActive: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = createReviewSchema.parse(body);

    const review = await prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        rating: validatedData.rating,
        comment: validatedData.comment,
        isPublished: false, // Requires restaurant owner approval
      },
    });

    // Send notification to restaurant owner (non-blocking)
    notifyNewReview(
      restaurant.userId,
      restaurant.name,
      validatedData.rating,
      validatedData.customerName
    );

    return NextResponse.json(
      {
        message: "Review submitted successfully. It will be visible after approval.",
        review: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[PUBLIC_REVIEW_POST]", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
