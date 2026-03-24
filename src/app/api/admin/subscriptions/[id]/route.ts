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
    const { action, plan, periodDays } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } } },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Abonelik bulunamadı" }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    let auditAction = "";
    let auditDetails: Record<string, unknown> = {};

    switch (action) {
      case "change_plan":
        if (!plan || !["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(plan)) {
          return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
        }
        const creditMap: Record<string, number> = {
          FREE: 5,
          STARTER: 50,
          PROFESSIONAL: 200,
          ENTERPRISE: 999,
        };
        updateData = {
          plan,
          aiCredits: creditMap[plan],
          aiCreditsUsed: 0,
        };
        auditAction = "plan_degistir";
        auditDetails = { onceki: subscription.plan, yeni: plan };
        break;

      case "cancel":
        updateData = { status: "CANCELLED", cancelAtPeriodEnd: true };
        auditAction = "abonelik_iptal";
        auditDetails = { plan: subscription.plan };
        break;

      case "reactivate":
        updateData = { status: "ACTIVE", cancelAtPeriodEnd: false };
        auditAction = "abonelik_aktif";
        auditDetails = { plan: subscription.plan };
        break;

      case "reset_credits":
        const defaultCredits: Record<string, number> = {
          FREE: 5,
          STARTER: 50,
          PROFESSIONAL: 200,
          ENTERPRISE: 999,
        };
        updateData = {
          aiCreditsUsed: 0,
          aiCredits: defaultCredits[subscription.plan] || 25,
        };
        auditAction = "kredi_sifirla";
        auditDetails = { plan: subscription.plan, oncekiKullanim: subscription.aiCreditsUsed };
        break;

      case "extend_period":
        const days = periodDays || 30;
        const currentEnd = subscription.currentPeriodEnd || new Date();
        const newEnd = new Date(currentEnd);
        newEnd.setDate(newEnd.getDate() + days);
        updateData = {
          currentPeriodEnd: newEnd,
          status: "ACTIVE",
        };
        auditAction = "sure_uzat";
        auditDetails = { gun: days, yeniBitis: newEnd.toISOString() };
        break;

      default:
        return NextResponse.json({ error: "Geçersiz aksiyon" }, { status: 400 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: { user: { select: { name: true, email: true } } },
    });

    await createAuditLog({
      userId: session!.user.id as string,
      userName: session!.user.name || "Admin",
      action: auditAction,
      target: "subscription",
      targetId: id,
      details: {
        ...auditDetails,
        kullanici: subscription.user.email,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADMIN_SUBSCRIPTION_PATCH]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
