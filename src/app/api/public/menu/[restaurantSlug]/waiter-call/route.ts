import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicLimiter, getClientIp } from "@/lib/rate-limit";
import { resolveEffectivePlan, hasFeature } from "@/lib/feature-gate";
import { notifyWaiterCall } from "@/lib/notifications";
import { z } from "zod";

const waiterCallSchema = z.object({
  tableId: z.string().min(1, "Table ID is required"),
});

/**
 * POST /api/public/menu/[restaurantSlug]/waiter-call
 * Call waiter from customer's phone (NO AUTH REQUIRED)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { restaurantSlug: string } }
) {
  try {
    const ip = getClientIp(req);
    const { success } = await publicLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        slug: params.restaurantSlug,
        isActive: true,
      },
      include: {
        user: {
          include: { subscription: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran bulunamadı" },
        { status: 404 }
      );
    }

    // Check if restaurant owner's plan supports waiter call
    const effectivePlan = resolveEffectivePlan(restaurant.user.subscription);
    if (!hasFeature(effectivePlan, "waiterCall")) {
      return NextResponse.json(
        { error: "Bu özellik mevcut planda desteklenmiyor" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = waiterCallSchema.parse(body);

    // Validate table belongs to restaurant
    const table = await prisma.table.findUnique({
      where: { id: validatedData.tableId },
    });

    if (!table || table.restaurantId !== restaurant.id) {
      return NextResponse.json(
        { error: "Geçersiz masa" },
        { status: 400 }
      );
    }

    // Rate limit: max 1 call per 2 minutes per table
    const recentCall = await prisma.waiterCall.findFirst({
      where: {
        tableId: validatedData.tableId,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentCall) {
      return NextResponse.json(
        { error: "Lütfen 2 dakika bekleyin" },
        { status: 429 }
      );
    }

    // Create waiter call
    const waiterCall = await prisma.waiterCall.create({
      data: {
        restaurantId: restaurant.id,
        tableId: validatedData.tableId,
        tableNumber: table.number,
      },
    });

    // Send notification to restaurant owner (non-blocking)
    notifyWaiterCall(
      restaurant.userId,
      restaurant.name,
      table.number
    );

    return NextResponse.json(
      {
        message: "Garson çağrıldı! Birazdan masanıza gelecek.",
        waiterCall: {
          id: waiterCall.id,
          tableNumber: waiterCall.tableNumber,
          createdAt: waiterCall.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[WAITER_CALL_POST]", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Geçersiz veri" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
