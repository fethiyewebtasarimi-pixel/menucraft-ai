import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses;
    if (body.minPurchase !== undefined) updateData.minPurchase = body.minPurchase;
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (body.applicablePlans !== undefined) updateData.applicablePlans = body.applicablePlans;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: session!.user.id as string,
      userName: session!.user.name || "Admin",
      action: "kupon_guncelle",
      target: "coupon",
      targetId: id,
      details: { kod: coupon.code, degisiklikler: Object.keys(updateData) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADMIN_COUPON_PATCH]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    await createAuditLog({
      userId: session!.user.id as string,
      userName: session!.user.name || "Admin",
      action: "kupon_sil",
      target: "coupon",
      targetId: id,
      details: { kod: coupon.code },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_COUPON_DELETE]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
