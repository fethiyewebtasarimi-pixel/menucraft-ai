import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validations/menu";

/**
 * PATCH /api/menus/[id]
 * Update menu details
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

    // Get menu with restaurant to verify ownership
    const existingMenu = await prisma.menu.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    if (existingMenu.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = menuSchema.partial().parse(body);

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            categories: true,
          },
        },
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("[MENU_PATCH]", error);

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
 * DELETE /api/menus/[id]
 * Delete menu
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

    // Get menu with restaurant to verify ownership
    const menu = await prisma.menu.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found" },
        { status: 404 }
      );
    }

    if (menu.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.menu.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Menu deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MENU_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
