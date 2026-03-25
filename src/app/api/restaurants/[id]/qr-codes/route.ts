import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeDataURL } from "@/lib/qrcode";
import { qrCodeSchema } from "@/lib/validations/qr-code";
import { randomBytes } from "crypto";

/**
 * Generate unique QR code string
 */
function generateQRCode(): string {
  return randomBytes(16).toString("hex");
}

/**
 * GET /api/restaurants/[id]/qr-codes
 * List all QR codes for a restaurant
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

    const qrCodes = await prisma.qRCode.findMany({
      where: {
        restaurantId: params.id,
      },
      include: {
        table: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("[QR_CODES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/restaurants/[id]/qr-codes
 * Create a new QR code for a restaurant
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
    const validatedData = qrCodeSchema.parse(body);

    // Generate unique code
    let code = generateQRCode();
    let codeExists = await prisma.qRCode.findUnique({
      where: { code },
    });

    while (codeExists) {
      code = generateQRCode();
      codeExists = await prisma.qRCode.findUnique({
        where: { code },
      });
    }

    // Verify table belongs to restaurant if tableId provided
    if (validatedData.tableId) {
      const table = await prisma.table.findUnique({
        where: { id: validatedData.tableId },
      });

      if (!table || table.restaurantId !== params.id) {
        return NextResponse.json(
          { error: "Invalid table ID" },
          { status: 400 }
        );
      }
    }

    const qrCode = await prisma.qRCode.create({
      data: {
        ...validatedData,
        code,
        restaurantId: params.id,
      },
      include: {
        table: true,
      },
    });

    // Generate actual QR code image
    const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/menu/${restaurant.slug}?qr=${code}`;
    const qrDataUrl = await generateQRCodeDataURL(menuUrl, {
      width: 400,
      color: {
        dark: validatedData.colorPrimary || "#000000",
        light: validatedData.colorBackground || "#FFFFFF",
      },
    });

    return NextResponse.json({ ...qrCode, qrDataUrl, menuUrl }, { status: 201 });
  } catch (error) {
    console.error("[QR_CODES_POST]", error);

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
