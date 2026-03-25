import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { menuItemSchema } from "@/lib/validations/menu";
import { resolveEffectivePlan, getLimit } from "@/lib/feature-gate";

/**
 * GET /api/restaurants/[id]/items
 * List menu items for a restaurant with filters
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
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");

    // Build where clause
    const where: any = {
      restaurantId: params.id,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        modifiers: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("[MENU_ITEMS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants/[id]/items
 * Create a new menu item
 */
export async function POST(
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

    // Check plan limits using feature gate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    const effectivePlan = resolveEffectivePlan(user?.subscription ?? null);
    const maxItems = getLimit(effectivePlan, "maxItems");

    const menuItemsCount = await prisma.menuItem.count({
      where: { restaurantId: params.id },
    });

    if (menuItemsCount >= maxItems) {
      return NextResponse.json(
        { error: `Planınızdaki maksimum yemek sayısına (${maxItems}) ulaştınız` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = menuItemSchema.parse(body);

    const menuItem = await prisma.menuItem.create({
      data: {
        ...JSON.parse(JSON.stringify(validatedData)),
        restaurantId: params.id,
      },
      include: {
        category: true,
        variants: true,
        modifiers: true,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("[MENU_ITEMS_POST]", error);

    if (error instanceof Error && error.name === "ZodError") {
      console.error("[MENU_ITEMS_POST] Validation details:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: "Geçersiz veri", details: (error as any).issues || error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
