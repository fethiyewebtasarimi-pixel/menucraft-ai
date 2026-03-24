import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiLimiter } from "@/lib/rate-limit";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/analyze-menu
 * Analyze menu image using GPT-4 Vision and extract menu items
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

    const formData = await req.formData();
    const image = formData.get("image") as File;
    const restaurantId = formData.get("restaurantId") as string;

    if (!image) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Restaurant not found or access denied" },
        { status: 403 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = image.type || "image/jpeg";

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this menu image and extract all menu items. For each item, provide:
- name: The name of the dish/item
- description: A brief description if available
- price: The price (as a number, extract just the numeric value)
- category: The category it belongs to (e.g., Appetizers, Main Course, Desserts, Drinks, etc.)

Return the result as a JSON array of objects with these exact fields: name, description, price, category.
If a field is not available, use an empty string for text fields or 0 for price.
Make sure the response is valid JSON that can be parsed.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to analyze menu image" },
        { status: 500 }
      );
    }

    // Parse the response
    let menuItems;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        menuItems = JSON.parse(jsonMatch[0]);
      } else {
        menuItems = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      return NextResponse.json(
        { error: "Failed to parse menu data from image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      menuItems,
      creditsRemaining: aiCreditsRemaining - 1,
    });
  } catch (error) {
    console.error("[AI_ANALYZE_MENU]", error);

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
