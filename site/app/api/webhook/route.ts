import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventName: string = payload.meta?.event_name;

  if (eventName === "order_created") {
    const attrs = payload.data?.attributes;
    const orderId: string = payload.data?.id;
    const email: string = attrs?.user_email;
    const status: string = attrs?.status;
    const userId: string | undefined = attrs?.custom_data?.user_id;

    console.log(
      `Payment received: ${email} (user: ${userId || "anonymous"}, order: ${orderId}, status: ${status})`
    );

    // If we have a userId, mark them as premium in Supabase
    if (userId && status === "paid") {
      const { error } = await getSupabaseAdmin()
        .from("profiles")
        .update({
          is_premium: true,
          order_id: orderId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Failed to update profile:", error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
