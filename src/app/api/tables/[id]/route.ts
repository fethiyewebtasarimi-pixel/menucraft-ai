import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tableSchema } from "@/lib/validations/table";

/**
 * PATCH /api/tables/[id]
 * Update table details
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

    // Get table with restaurant to verify ownership
    const existingTable = await prisma.table.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!existingTable) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    if (existingTable.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = tableSchema.partial().parse(body);

    const updateData: any = { ...validatedData };
    if (validatedData.number) {
      updateData.number = parseInt(validatedData.number);
    }

    const table = await prisma.table.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: {
            qrCodes: true,
          },
        },
      },
    });

    return NextResponse.json(table);
  } catch (error) {
    console.error("[TABLE_PATCH]", error);

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
 * DELETE /api/tables/[id]
 * Delete table
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

    // Get table with restaurant to verify ownership
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found" },
        { status: 404 }
      );
    }

    if (table.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.table.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Table deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[TABLE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
