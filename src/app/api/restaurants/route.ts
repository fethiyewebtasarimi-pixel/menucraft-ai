import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { restaurantSchema } from "@/lib/validations/restaurant";
import { slugify, generateOrderNumber } from "@/lib/utils";
import { resolveEffectivePlan, getLimit } from "@/lib/feature-gate";

/**
 * GET /api/restaurants
 * List all restaurants for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            menuItems: true,
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("[RESTAURANTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants
 * Create new restaurant with default settings
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = restaurantSchema.parse(body);

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check plan limits using feature gate
    const effectivePlan = resolveEffectivePlan(user.subscription);
    const maxRestaurants = getLimit(effectivePlan, "maxRestaurants");

    const restaurantCount = await prisma.restaurant.count({
      where: { userId: session.user.id },
    });

    if (restaurantCount >= maxRestaurants) {
      return NextResponse.json(
        { error: `Planınızdaki maksimum restoran sayısına (${maxRestaurants}) ulaştınız` },
        { status: 403 }
      );
    }

    // Generate unique slug
    let slug = slugify(validatedData.name);
    let slugExists = await prisma.restaurant.findUnique({
      where: { slug },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${slugify(validatedData.name)}-${counter}`;
      slugExists = await prisma.restaurant.findUnique({
        where: { slug },
      });
      counter++;
    }

    // Create restaurant with default branding and working hours
    const restaurant = await prisma.restaurant.create({
      data: {
        ...validatedData,
        slug,
        userId: session.user.id,
        branding: {
          create: {
            primaryColor: "#000000",
            secondaryColor: "#FFFFFF",
            accentColor: "#8b5cf6",
            fontFamily: "Inter",
            menuLayout: "GRID",
            headerStyle: "MODERN",
            showLogo: true,
            showCover: true,
          },
        },
        workingHours: {
          createMany: {
            data: [
              { dayOfWeek: 0, isClosed: true, openTime: "09:00", closeTime: "23:00" }, // Sunday
              { dayOfWeek: 1, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Monday
              { dayOfWeek: 2, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Tuesday
              { dayOfWeek: 3, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Wednesday
              { dayOfWeek: 4, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Thursday
              { dayOfWeek: 5, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Friday
              { dayOfWeek: 6, isClosed: false, openTime: "09:00", closeTime: "23:00" },  // Saturday
            ],
          },
        },
      },
      include: {
        branding: true,
        workingHours: true,
        _count: {
          select: {
            menuItems: true,
            orders: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error("[RESTAURANTS_POST]", error);

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
