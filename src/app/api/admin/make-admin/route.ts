import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

/**
 * POST /api/admin/make-admin
 * Makes the currently logged-in user an ADMIN.
 * Only works when there are no existing ADMIN users (first-time setup).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin kullanıcı zaten mevcut. Bu endpoint sadece ilk admin oluşturmak içindir." },
        { status: 403 }
      );
    }

    // Make current user admin
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({
      success: true,
      message: "Artik adminsiniz! /admin adresine gidin.",
      user,
    });
  } catch (error) {
    console.error("[MAKE_ADMIN]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
