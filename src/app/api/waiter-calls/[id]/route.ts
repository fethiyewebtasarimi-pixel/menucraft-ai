import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "DISMISSED"]),
});

/**
 * PATCH /api/waiter-calls/[id]
 * Acknowledge or dismiss a waiter call
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

    const waiterCall = await prisma.waiterCall.findUnique({
      where: { id: params.id },
      include: { restaurant: true },
    });

    if (!waiterCall) {
      return NextResponse.json(
        { error: "Garson çağrısı bulunamadı" },
        { status: 404 }
      );
    }

    if (waiterCall.restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    const updated = await prisma.waiterCall.update({
      where: { id: params.id },
      data: {
        status: validatedData.status,
        acknowledgedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[WAITER_CALL_PATCH]", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
