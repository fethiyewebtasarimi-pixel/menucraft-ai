import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restaurantSchema } from "@/lib/validations/restaurant";

/**
 * GET /api/restaurants/[id]
 * Get single restaurant with full details
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

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: params.id,
      },
      include: {
        branding: true,
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        socialLinks: true,
        _count: {
          select: {
            menuItems: true,
            categories: true,
            orders: true,
            reviews: true,
            tables: true,
            qrCodes: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("[RESTAURANT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/restaurants/[id]
 * Update restaurant details
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

    // Verify ownership
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (existingRestaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = restaurantSchema.partial().parse(body);

    const restaurant = await prisma.restaurant.update({
      where: {
        id: params.id,
      },
      data: validatedData,
      include: {
        branding: true,
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        socialLinks: true,
        _count: {
          select: {
            menuItems: true,
            categories: true,
            orders: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("[RESTAURANT_PATCH]", error);

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

/**
 * DELETE /api/restaurants/[id]
 * Delete restaurant and all related data
 */
export async function DELETE(
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

    // Verify ownership
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

    // Delete restaurant (cascade will handle related records)
    await prisma.restaurant.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Restaurant deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESTAURANT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
