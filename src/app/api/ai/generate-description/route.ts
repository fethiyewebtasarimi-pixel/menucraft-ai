import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiLimiter } from "@/lib/rate-limit";
import { generateDescriptionSchema } from "@/lib/validations/ai";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/generate-description
 * Generate appetizing description for a menu item using GPT-4
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { success } = await aiLimiter.limit(session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Atomically check and decrement AI credits
    if (!user.subscription?.id) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 403 }
      );
    }

    const aiCreditsRemaining = (user.subscription.aiCredits || 0) - (user.subscription.aiCreditsUsed || 0);
    if (aiCreditsRemaining <= 0) {
      return NextResponse.json(
        { error: "No AI credits remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // Atomically decrement credits BEFORE making the API call
    // This prevents race conditions with concurrent requests
    const updatedSub = await prisma.subscription.updateMany({
      where: {
        id: user.subscription.id,
        aiCreditsUsed: { lt: user.subscription.aiCredits },
      },
      data: {
        aiCreditsUsed: { increment: 1 },
      },
    });

    if (updatedSub.count === 0) {
      return NextResponse.json(
        { error: "No AI credits remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = generateDescriptionSchema.parse(body);

    // Prepare prompt based on language
    const prompts = {
      tr: {
        casual: `"${validatedData.menuItemName}" yemeği için gündelik ve samimi bir açıklama yaz. Açıklama 2-3 cümle olsun ve yemeğin lezzetini, malzemelerini kısaca anlatsın.`,
        formal: `"${validatedData.menuItemName}" yemeği için profesyonel ve zarif bir açıklama yaz. Açıklama 2-3 cümle olsun ve yemeğin kalitesini, malzemelerini özenle anlatsın.`,
        appetizing: `"${validatedData.menuItemName}" yemeği için iştah açıcı ve çekici bir açıklama yaz. Açıklama 2-3 cümle olsun ve yemeğin tadını, dokusunu, aromasını hayal ettirsin. Müşterinin sipariş vermek istemesini sağlasın.`,
      },
      en: {
        casual: `Write a casual and friendly description for the dish "${validatedData.menuItemName}". The description should be 2-3 sentences and briefly describe the taste and ingredients.`,
        formal: `Write a professional and elegant description for the dish "${validatedData.menuItemName}". The description should be 2-3 sentences and carefully describe the quality and ingredients.`,
        appetizing: `Write an appetizing and appealing description for the dish "${validatedData.menuItemName}". The description should be 2-3 sentences and make the customer imagine the taste, texture, and aroma. Make them want to order it.`,
      },
    };

    const prompt = prompts[validatedData.language][validatedData.tone];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: validatedData.language === "tr"
            ? "Sen bir restoran menüsü için yemek açıklamaları yazan profesyonel bir içerik yazarısın."
            : "You are a professional content writer who writes menu item descriptions for restaurants.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const description = response.choices[0]?.message?.content?.trim();

    if (!description) {
      return NextResponse.json(
        { error: "Failed to generate description" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      description,
      creditsRemaining: aiCreditsRemaining - 1,
    });
  } catch (error) {
    console.error("[AI_GENERATE_DESCRIPTION]", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "OpenAI API is not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
