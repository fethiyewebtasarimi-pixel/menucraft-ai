import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicLimiter, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/public/menu/[restaurantSlug]
 * Get full public menu data for a restaurant (NO AUTH REQUIRED)
 */
export async function GET(
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
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        coverImage: true,
        currency: true,
        phone: true,
        email: true,
        address: true,
        branding: true,
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        socialLinks: true,
        categories: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            sortOrder: true,
            menuItems: {
              where: {
                isActive: true,
                isAvailable: true,
              },
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                image: true,
                prepTime: true,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
                isSpicy: true,
                allergens: true,
                sortOrder: true,
                variants: {
                  orderBy: { sortOrder: "asc" },
                },
                modifiers: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Increment menu views analytics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.analytics.upsert({
      where: {
        restaurantId_date: {
          restaurantId: restaurant.id,
          date: today,
        },
      },
      update: {
        menuViews: {
          increment: 1,
        },
      },
      create: {
        restaurantId: restaurant.id,
        date: today,
        menuViews: 1,
        qrScans: 0,
        uniqueVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("[PUBLIC_MENU_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
