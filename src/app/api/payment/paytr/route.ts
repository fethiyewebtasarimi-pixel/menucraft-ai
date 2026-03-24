import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

/**
 * POST /api/payment/paytr
 * Create a PayTR iframe token for subscription payment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planSlug } = body;

    if (!planSlug || !["STARTER", "PROFESSIONAL", "ENTERPRISE"].includes(planSlug)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Plan prices in kuruş (1 TL = 100 kuruş)
    const planPrices: Record<string, number> = {
      STARTER: 29900,
      PROFESSIONAL: 59900,
      ENTERPRISE: 99900,
    };

    const paymentAmount = planPrices[planSlug];
    if (!paymentAmount) {
      return NextResponse.json({ error: "Invalid plan price" }, { status: 400 });
    }

    // PayTR credentials
    const merchantId = process.env.PAYTR_MERCHANT_ID!;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json(
        { error: "PayTR credentials not configured" },
        { status: 500 }
      );
    }

    // Generate unique merchant OID
    const merchantOid = `MC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // User info
    const userIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const emailAddr = user.email;
    const userName = user.name;
    const userPhone = user.phone || "05000000000";
    const userAddress = "Turkiye";

    // Payment details
    const currency = "TL";
    const noInstallment = "1";
    const maxInstallment = "0";
    const testMode = process.env.NODE_ENV === "production" ? "0" : "1";

    // Basket items (base64 encoded JSON)
    const basketItems = [
      [`MenuCraft AI ${planSlug} Plan`, paymentAmount.toString(), "1"],
    ];
    const userBasket = Buffer.from(JSON.stringify(basketItems)).toString("base64");

    // Callback URLs
    const merchantOkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?payment=success`;
    const merchantFailUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?payment=failed`;

    // Generate PayTR hash
    const hashStr = `${merchantId}${userIp}${merchantOid}${emailAddr}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrToken = createHmac("sha256", merchantKey)
      .update(hashStr + merchantSalt)
      .digest("base64");

    // Send request to PayTR API
    const formData = new URLSearchParams({
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email: emailAddr,
      payment_amount: paymentAmount.toString(),
      paytr_token: paytrToken,
      user_basket: userBasket,
      debug_on: testMode === "1" ? "1" : "0",
      no_installment: noInstallment,
      max_installment: maxInstallment,
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      merchant_ok_url: merchantOkUrl,
      merchant_fail_url: merchantFailUrl,
      timeout_limit: "30",
      currency: currency,
      test_mode: testMode,
      lang: "tr",
    });

    const paytrResponse = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const paytrData = await paytrResponse.json();

    if (paytrData.status !== "success") {
      console.error("[PAYTR] Token error:", paytrData);
      return NextResponse.json(
        { error: "Payment initialization failed", details: paytrData.reason },
        { status: 400 }
      );
    }

    // Store pending payment info
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        paytrMerchantOid: merchantOid,
      },
    });

    return NextResponse.json({
      success: true,
      token: paytrData.token,
      merchantOid,
    });
  } catch (error) {
    console.error("[PAYTR_CREATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
