import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

/**
 * POST /api/payment/paytr/callback
 * PayTR payment callback (server-to-server)
 * PayTR sends payment result to this URL
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const merchantOid = params.get("merchant_oid") || "";
    const status = params.get("status") || "";
    const totalAmount = params.get("total_amount") || "";
    const hash = params.get("hash") || "";
    const failedReasonCode = params.get("failed_reason_code") || "";
    const failedReasonMsg = params.get("failed_reason_msg") || "";
    const _testMode = params.get("test_mode") || "";
    const _paymentType = params.get("payment_type") || "";

    // Verify hash
    const merchantKey = process.env.PAYTR_MERCHANT_KEY!;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT!;

    const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
    const expectedHash = createHmac("sha256", merchantKey)
      .update(hashStr)
      .digest("base64");

    if (hash !== expectedHash) {
      console.error("[PAYTR_CALLBACK] Hash verification failed");
      return new NextResponse("PAYTR notification failed: bad hash", { status: 400 });
    }

    // Find the subscription with this merchant OID
    const subscription = await prisma.subscription.findFirst({
      where: { paytrMerchantOid: merchantOid },
      include: { user: true },
    });

    if (!subscription) {
      console.error("[PAYTR_CALLBACK] Subscription not found for OID:", merchantOid);
      return new NextResponse("OK", { status: 200 });
    }

    if (status === "success") {
      // Determine plan from amount (kuruş)
      const amount = parseInt(totalAmount);
      let plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE" = "STARTER";
      if (amount >= 99900) plan = "ENTERPRISE";
      else if (amount >= 59900) plan = "PROFESSIONAL";
      else plan = "STARTER";

      // Plan AI credits
      const planCredits: Record<string, number> = {
        STARTER: 50,
        PROFESSIONAL: 200,
        ENTERPRISE: 999999,
      };

      // Update subscription
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          plan,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          aiCredits: planCredits[plan] || 50,
          aiCreditsUsed: 0,
          cancelAtPeriodEnd: false,
        },
      });

      console.log(`[PAYTR_CALLBACK] Payment success for ${subscription.user.email}, plan: ${plan}`);
    } else {
      console.log(
        `[PAYTR_CALLBACK] Payment failed for ${subscription.user.email}. Reason: ${failedReasonMsg} (${failedReasonCode})`
      );

      // Optionally mark subscription as past due
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          paytrMerchantOid: null,
        },
      });
    }

    // PayTR expects "OK" response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PAYTR_CALLBACK]", error);
    return new NextResponse("OK", { status: 200 }); // Always return OK to PayTR
  }
}
