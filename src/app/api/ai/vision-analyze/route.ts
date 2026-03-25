import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiLimiter } from "@/lib/rate-limit";
import { visionAnalyzeSchema } from "@/lib/validations/ai";
import { getVisionModel, toGeminiImage } from "@/lib/gemini";

/**
 * POST /api/ai/vision-analyze
 * Yemek fotoğrafından Gemini Vision ile tam analiz
 * Returns: name, description, ingredients, calories, allergens, etc.
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
    const parsed = visionAnalyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { image, mimeType } = parsed.data;

    const model = getVisionModel();

    const prompt = `Sen bir profesyonel gıda uzmanısın. Bu yemek fotoğrafını analiz et ve aşağıdaki bilgileri çıkar.

ÖNEMLI: Sadece JSON formatında yanıt ver, başka hiçbir metin ekleme.

{
  "name": "<yemeğin adı, Türkçe>",
  "description": "<yemeğin kısa ve iştah açıcı açıklaması, Türkçe, max 200 karakter>",
  "ingredients": ["<tahmini malzeme listesi>"],
  "calories": <tahmini kalori, kcal, sayı>,
  "protein": <tahmini protein, gram, sayı>,
  "carbs": <tahmini karbonhidrat, gram, sayı>,
  "fat": <tahmini yağ, gram, sayı>,
  "fiber": <tahmini lif, gram, sayı>,
  "sugar": <tahmini şeker, gram, sayı>,
  "sodium": <tahmini sodyum, mg, sayı>,
  "servingSize": "<porsiyon bilgisi, örn: 1 porsiyon (250g)>",
  "allergens": [<tespit edilen alerjenler, şu listeden: "Gluten", "Süt Ürünleri", "Yumurta", "Fıstık", "Kabuklu Deniz Ürünleri", "Balık", "Soya", "Kereviz", "Hardal", "Susam", "Kükürt Dioksit", "Lupin", "Yumuşakçalar", "Kuruyemiş">],
  "isVegan": <boolean>,
  "isVegetarian": <boolean>,
  "isGlutenFree": <boolean>,
  "isSpicy": <boolean>,
  "category": "<tahmini kategori: Ana Yemek, Başlangıç, Salata, Çorba, Tatlı, İçecek, Aperatif, Kahvaltı>"
}

Değerler gerçekçi ve ortalama bir Türk restoran porsiyonuna uygun olsun. Emin olmadığın değerlerde en mantıklı tahmini yap.`;

    const result = await model.generateContent([
      prompt,
      toGeminiImage(image, mimeType),
    ]);

    const responseText = result.response.text().trim();

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = responseText;
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    let analysisData;
    try {
      analysisData = JSON.parse(jsonStr);
    } catch {
      console.error("[VISION_PARSE_ERROR]", responseText);
      return NextResponse.json(
        { error: "AI yanıtı işlenemedi. Lütfen tekrar deneyin." },
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

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("[VISION_ANALYZE_ERROR]", error);
    return NextResponse.json(
      { error: "Fotoğraf analizi yapılamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
