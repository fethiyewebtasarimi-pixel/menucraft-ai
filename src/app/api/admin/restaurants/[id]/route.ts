import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        branding: true,
        workingHours: true,
        socialLinks: true,
        _count: {
          select: {
            orders: true,
            menuItems: true,
            reviews: true,
            tables: true,
            qrCodes: true,
            menus: true,
            categories: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get revenue for this restaurant
    const revenue = await prisma.order.aggregate({
      where: { restaurantId: params.id, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      ...restaurant,
      totalRevenue: Number(revenue._sum.totalAmount || 0),
    });
  } catch (error) {
    console.error("[ADMIN_RESTAURANT_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { isActive } = body;

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("[ADMIN_RESTAURANT_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    await prisma.restaurant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_RESTAURANT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
