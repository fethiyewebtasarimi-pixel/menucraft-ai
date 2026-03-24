import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // active, expired, all

    const where: Record<string, unknown> = {};
    if (status === "active") {
      where.isActive = true;
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: new Date() } },
      ];
    } else if (status === "expired") {
      where.OR = [
        { isActive: false },
        { validUntil: { lt: new Date() } },
      ];
    }

    let coupons: unknown[] = [];
    let total = 0;

    try {
      [coupons, total] = await Promise.all([
        prisma.coupon.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.coupon.count({ where }),
      ]);
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[ADMIN_COUPONS_GET]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      maxUses,
      minPurchase,
      validFrom,
      validUntil,
      applicablePlans,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Kupon kodu ve indirim değeri gerekli" }, { status: 400 });
    }

    // Check for duplicate code
    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: "Bu kupon kodu zaten mevcut" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType: discountType || "PERCENTAGE",
        discountValue,
        maxUses: maxUses || null,
        minPurchase: minPurchase || null,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        applicablePlans: applicablePlans || [],
        isActive: true,
      },
    });

    await createAuditLog({
      userId: session!.user.id as string,
      userName: session!.user.name || "Admin",
      action: "kupon_olustur",
      target: "coupon",
      targetId: coupon.id,
      details: { kod: coupon.code, indirim: `${discountValue}${discountType === "PERCENTAGE" ? "%" : "₺"}` },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_COUPONS_POST]", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
