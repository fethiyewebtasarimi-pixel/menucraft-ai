import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { PLANS } from "@/constants";

const PLAN_CONFIG_KEY = "plan_configs";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const config = await prisma.systemConfig.findUnique({
      where: { key: PLAN_CONFIG_KEY },
    });

    if (config) {
      return NextResponse.json({ plans: config.value });
    }

    // Return defaults from constants
    return NextResponse.json({ plans: PLANS });
  } catch (error) {
    console.error("[ADMIN_PLANS_GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const { plans } = body;

    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json({ error: "Geçersiz plan verisi" }, { status: 400 });
    }

    // Validate each plan has required fields
    for (const plan of plans) {
      if (!plan.name || !plan.slug || plan.price === undefined) {
        return NextResponse.json(
          { error: `Plan "${plan.name || 'Bilinmeyen'}" için eksik alan var` },
          { status: 400 }
        );
      }
    }

    const config = await prisma.systemConfig.upsert({
      where: { key: PLAN_CONFIG_KEY },
      update: { value: plans as any },
      create: { key: PLAN_CONFIG_KEY, value: plans as any },
    });

    await createAuditLog({
      userId: session!.user.id as string,
      userName: session!.user.name || "Admin",
      action: "plan_guncelle",
      target: "system_config",
      targetId: PLAN_CONFIG_KEY,
      details: { planSayisi: plans.length },
    });

    return NextResponse.json({ plans: config.value });
  } catch (error) {
    console.error("[ADMIN_PLANS_PUT]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
