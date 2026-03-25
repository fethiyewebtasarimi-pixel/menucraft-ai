import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const brandingSchema = z.object({
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  fontFamily: z.string().max(100).optional(),
  menuLayout: z.enum(["GRID", "LIST", "COMPACT", "MAGAZINE"]).optional(),
  headerStyle: z.enum(["MODERN", "CLASSIC", "MINIMAL", "HERO"]).optional(),
  showLogo: z.boolean().optional(),
  showCover: z.boolean().optional(),
  customCSS: z.string().max(5000).nullable().optional(),
});

/**
 * PATCH /api/restaurants/[id]/branding
 * Update branding settings for a restaurant
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
    const validatedData = brandingSchema.parse(body);

    const branding = await prisma.branding.upsert({
      where: { restaurantId: params.id },
      update: validatedData,
      create: {
        restaurantId: params.id,
        ...validatedData,
      },
    });

    return NextResponse.json(branding);
  } catch (error) {
    console.error("[BRANDING_PATCH]", error);

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
