import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { resetPasswordApiSchema } from "@/lib/validations/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { z } from "zod";

/**
 * POST /api/auth/reset-password
 * Reset password using a valid token
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await authLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { email, token, password } = resetPasswordApiSchema.parse(body);

    // Hash the incoming token to compare with stored hash
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Find valid reset token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token: hashedToken,
        expires: { gt: new Date() },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { email },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
