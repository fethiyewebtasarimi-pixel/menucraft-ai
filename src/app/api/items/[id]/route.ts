import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { menuItemSchema } from "@/lib/validations/menu";

/**
 * GET /api/items/[id]
 * Get single menu item with full details
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

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        modifiers: true,
        restaurant: true,
      },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Verify ownership through restaurant
    if (menuItem.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[MENU_ITEM_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/items/[id]
 * Update menu item details
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

    // Get menu item with restaurant to verify ownership
    const existingMenuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!existingMenuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (existingMenuItem.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = menuItemSchema.partial().parse(body);

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: JSON.parse(JSON.stringify(validatedData)),
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        modifiers: true,
      },
    });

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("[MENU_ITEM_PATCH]", error);

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
 * DELETE /api/items/[id]
 * Delete menu item
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

    // Get menu item with restaurant to verify ownership
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    if (menuItem.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Menu item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MENU_ITEM_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
