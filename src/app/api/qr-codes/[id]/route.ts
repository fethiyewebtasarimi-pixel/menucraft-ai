import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateQRCodeSchema } from "@/lib/validations/qr-code";

/**
 * PATCH /api/qr-codes/[id]
 * Update QR code styling and details
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

    // Get QR code with restaurant to verify ownership
    const existingQRCode = await prisma.qRCode.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!existingQRCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (existingQRCode.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateQRCodeSchema.parse(body);

    // Verify table belongs to restaurant if tableId provided
    if (validatedData.tableId) {
      const table = await prisma.table.findUnique({
        where: { id: validatedData.tableId },
      });

      if (!table || table.restaurantId !== existingQRCode.restaurantId) {
        return NextResponse.json(
          { error: "Invalid table ID" },
          { status: 400 }
        );
      }
    }

    const qrCode = await prisma.qRCode.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        table: true,
      },
    });

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error("[QR_CODE_PATCH]", error);

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
 * DELETE /api/qr-codes/[id]
 * Delete QR code
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

    // Get QR code with restaurant to verify ownership
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (qrCode.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.qRCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "QR code deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[QR_CODE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
