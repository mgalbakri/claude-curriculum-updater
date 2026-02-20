import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { STRIPE_PRICE_AMOUNT } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, userId } = body as { email?: string; userId?: string };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: STRIPE_PRICE_AMOUNT,
            product_data: {
              name: "Agent Code Academy Pro",
              description:
                "Lifetime access to all 12 weeks of the AI coding course",
            },
          },
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      metadata: {
        product: "aca-pro-lifetime",
        ...(userId ? { userId } : {}),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
