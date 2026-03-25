import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { z } from "zod";

/**
 * POST /api/auth/forgot-password
 * Generate a password reset token and send reset email
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { success } = await authLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Bu e-posta adresine kayıtlı bir hesap varsa, sıfırlama bağlantısı gönderildi.",
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Store hashed token (expires in 1 hour)
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashedToken,
        expires: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
    });

    // Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Send reset email
    await sendEmail({
      to: email,
      subject: "Şifre Sıfırlama Talebi",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Şifre Sıfırlama</h2>
          <p>Merhaba ${user.name},</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
            Şifremi Sıfırla
          </a>
          <p>Bu bağlantı 1 saat içinde geçerliliğini yitirecektir.</p>
          <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">MenuCraft AI</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Bu e-posta adresine kayıtlı bir hesap varsa, sıfırlama bağlantısı gönderildi.",
    });
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);

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
