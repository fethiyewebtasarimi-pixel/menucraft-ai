import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const nutritionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
});

/**
 * POST /api/ai/nutrition
 * Analyze nutrition and allergens for a menu item using GPT-4
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Check AI credits
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id as string },
    });

    if (subscription) {
      if (subscription.aiCreditsUsed >= subscription.aiCredits) {
        return NextResponse.json(
          { error: "AI kredi limitiniz doldu. Planınızı yükseltin." },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = nutritionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, ingredients } = parsed.data;

    const ingredientText = ingredients.length > 0
      ? `Malzemeler: ${ingredients.join(", ")}`
      : "";

    const prompt = `Sen bir besin uzmanısın. Aşağıdaki Türk/dünya mutfağı yemeği için besin değerlerini ve alerjen bilgilerini tahmin et.

Yemek: ${name}
${description ? `Açıklama: ${description}` : ""}
${ingredientText}

Lütfen 1 porsiyon için aşağıdaki formatta JSON döndür (sadece JSON, başka metin ekleme):
{
  "calories": <sayı, kcal>,
  "protein": <sayı, gram>,
  "carbs": <sayı, gram>,
  "fat": <sayı, gram>,
  "fiber": <sayı, gram>,
  "sugar": <sayı, gram>,
  "sodium": <sayı, miligram>,
  "servingSize": "<porsiyon bilgisi, örn: 1 porsiyon (250g)>",
  "allergens": [<varsa alerjen listesi, şu seçeneklerden: "Gluten", "Süt Ürünleri", "Yumurta", "Fıstık", "Kabuklu Deniz Ürünleri", "Balık", "Soya", "Kereviz", "Hardal", "Susam", "Kükürt Dioksit", "Lupin", "Yumuşakçalar", "Kuruyemiş">]
}

Değerler gerçekçi ve ortalama bir Türk restoran porsiyonuna uygun olsun.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir besin değeri ve alerjen analiz uzmanısın. Sadece JSON formatında yanıt ver.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    let nutritionData;
    try {
      nutritionData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    // Increment AI credits used
    if (subscription) {
      await prisma.subscription.update({
        where: { userId: session.user.id as string },
        data: { aiCreditsUsed: { increment: 1 } },
      });
    }

    return NextResponse.json(nutritionData);
  } catch (error) {
    console.error("[AI_NUTRITION_ERROR]", error);
    return NextResponse.json(
      { error: "Besin analizi yapılamadı" },
      { status: 500 }
    );
  }
}
