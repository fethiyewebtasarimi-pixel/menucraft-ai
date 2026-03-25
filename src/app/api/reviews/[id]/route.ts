import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateReviewSchema } from "@/lib/validations/review";

/**
 * PATCH /api/reviews/[id]
 * Toggle review publication status
 */
export async function PATCH(
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

    // Get review with restaurant to verify ownership
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (existingReview.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateReviewSchema.parse(body);

    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        isPublished: validatedData.isPublished,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("[REVIEW_PATCH]", error);

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
