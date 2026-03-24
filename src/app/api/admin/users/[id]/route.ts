import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        restaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: { orders: true, menuItems: true, reviews: true },
            },
          },
        },
        _count: {
          select: { restaurants: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_USER_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    // Prevent self-modification of role
    if (params.id === session!.user.id) {
      return NextResponse.json(
        { error: "Kendi rolünüzü değiştiremezsiniz" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { role, plan, aiCredits } = body;

    const updateData: Record<string, unknown> = {};

    if (role && ["OWNER", "MANAGER", "STAFF", "ADMIN"].includes(role)) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Update subscription if plan or credits changed
    if (plan || aiCredits !== undefined) {
      const subData: Record<string, unknown> = {};
      if (plan) subData.plan = plan;
      if (aiCredits !== undefined) subData.aiCredits = aiCredits;

      await prisma.subscription.upsert({
        where: { userId: params.id },
        update: subData,
        create: {
          userId: params.id,
          plan: plan || "FREE",
          status: "ACTIVE",
          aiCredits: aiCredits || 25,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ADMIN_USER_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, session } = await requireAdmin();
    if (error) return error;

    if (params.id === session!.user.id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_USER_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
