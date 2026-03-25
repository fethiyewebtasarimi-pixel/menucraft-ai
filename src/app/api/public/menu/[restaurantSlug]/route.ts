import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicLimiter, getClientIp } from "@/lib/rate-limit";
import { resolveEffectivePlan, hasFeature, getAllowedOrderTypes } from "@/lib/feature-gate";

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

    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get("qr");

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug: params.restaurantSlug,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
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

    // Get restaurant owner's subscription for feature gating
    const owner = await prisma.user.findUnique({
      where: { id: restaurant.userId },
      include: { subscription: true },
    });

    const effectivePlan = resolveEffectivePlan(owner?.subscription ?? null);
    const features = {
      orderingEnabled: hasFeature(effectivePlan, "ordering"),
      allowedOrderTypes: getAllowedOrderTypes(effectivePlan),
      waiterCallEnabled: hasFeature(effectivePlan, "waiterCall"),
      watermark: hasFeature(effectivePlan, "watermark"),
    };

    // Resolve table from QR code if provided
    let tableInfo: { id: string; number: number; name: string | null } | null = null;
    if (qrCode) {
      const qr = await prisma.qRCode.findUnique({
        where: { code: qrCode },
        include: { table: true },
      });
      if (qr?.table) {
        tableInfo = {
          id: qr.table.id,
          number: qr.table.number,
          name: qr.table.name,
        };
      }
      // Increment QR scans
      await prisma.qRCode.update({
        where: { code: qrCode },
        data: { scans: { increment: 1 } },
      }).catch(() => {});
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
        menuViews: { increment: 1 },
        ...(qrCode ? { qrScans: { increment: 1 } } : {}),
      },
      create: {
        restaurantId: restaurant.id,
        date: today,
        menuViews: 1,
        qrScans: qrCode ? 1 : 0,
        uniqueVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0,
      },
    });

    // Remove userId from response
    const { userId, ...restaurantData } = restaurant;

    return NextResponse.json({
      ...restaurantData,
      features,
      table: tableInfo,
    });
  } catch (error) {
    console.error("[PUBLIC_MENU_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
