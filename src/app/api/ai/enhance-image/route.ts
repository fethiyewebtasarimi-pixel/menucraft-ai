import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiLimiter } from "@/lib/rate-limit";
import { enhanceImageSchema } from "@/lib/validations/ai";
import { getImageModel, toGeminiImage } from "@/lib/gemini";

/**
 * POST /api/ai/enhance-image
 * Yemek fotoğrafını Gemini ile profesyonel stüdyo kalitesine çevir
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { success } = await aiLimiter.limit(session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });
    }

    // Check AI credits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription && subscription.aiCreditsUsed >= subscription.aiCredits) {
      return NextResponse.json(
        { error: "AI kredi limitiniz doldu. Planınızı yükseltin." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = enhanceImageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { image, mimeType, dishName, description } = parsed.data;

    const model = getImageModel();

    const prompt = `Bu "${dishName}" yemek fotoğrafını profesyonel bir food photography stüdyosunda çekilmiş gibi iyileştir.

${description ? `Yemek açıklaması: ${description}` : ""}

Yapılacaklar:
- Işığı düzelt, soft stüdyo aydınlatması ekle
- Renkleri canlı ve iştah açıcı hale getir
- Arka planı temiz ve profesyonel yap
- Yemeğin dokusunu ve detaylarını ön plana çıkar
- Profesyonel food photography standartlarında bir görsel oluştur

Orijinal yemeğin aynısını koru, sadece görsel kalitesini artır. Görüntüyü oluştur.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            toGeminiImage(image, mimeType),
          ],
        },
      ],
      generationConfig: {
        // @ts-expect-error - responseModalities is supported but not in type definitions yet
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    // Extract image from response
    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    let enhancedImageBase64: string | null = null;
    let enhancedMimeType = "image/png";

    for (const part of parts) {
      if (part.inlineData) {
        enhancedImageBase64 = part.inlineData.data;
        enhancedMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!enhancedImageBase64) {
      return NextResponse.json(
        { error: "Görsel iyileştirme yapılamadı. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Increment AI credits
    if (subscription) {
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: { aiCreditsUsed: { increment: 1 } },
      });
    }

    return NextResponse.json({
      enhancedImage: `data:${enhancedMimeType};base64,${enhancedImageBase64}`,
      mimeType: enhancedMimeType,
    });
  } catch (error) {
    console.error("[ENHANCE_IMAGE_ERROR]", error);
    return NextResponse.json(
      { error: "Görsel iyileştirme yapılamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
