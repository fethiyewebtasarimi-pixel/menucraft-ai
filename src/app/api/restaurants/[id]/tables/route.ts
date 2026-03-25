import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tableSchema } from "@/lib/validations/table";

/**
 * GET /api/restaurants/[id]/tables
 * List all tables for a restaurant
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

    const tables = await prisma.table.findMany({
      where: {
        restaurantId: params.id,
      },
      include: {
        _count: {
          select: {
            qrCodes: true,
          },
        },
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("[TABLES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants/[id]/tables
 * Create a new table for a restaurant
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

    const body = await req.json();
    const validatedData = tableSchema.parse(body);

    const table = await prisma.table.create({
      data: {
        ...validatedData,
        number: parseInt(validatedData.number),
        restaurantId: params.id,
      },
      include: {
        _count: {
          select: {
            qrCodes: true,
          },
        },
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("[TABLES_POST]", error);

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
