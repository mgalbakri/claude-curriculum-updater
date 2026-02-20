import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Payment verification not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/vnd.api+json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const order = await res.json();
    const attrs = order.data?.attributes;

    if (attrs?.status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    const email = attrs.user_email || "";

    // Generate a simple token for localStorage
    const tokenData = {
      email,
      orderId: order.data.id,
      ts: new Date().toISOString(),
    };
    const token = btoa(JSON.stringify(tokenData));

    return NextResponse.json({ token, email });
  } catch (error) {
    console.error("Order verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify order" },
      { status: 500 }
    );
  }
}
