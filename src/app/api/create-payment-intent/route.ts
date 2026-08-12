import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(req: Request) {
  try {
  
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency, order_id, paymentIntentId, description, receipt_email, customer_name, customer_phone } = await req.json();

    const stripe = getStripe();
    const metadata: Record<string, string> = {};
    if (order_id) metadata.order_id = String(order_id);
    if (customer_name) metadata.customer_name = customer_name;
    if (customer_phone) metadata.customer_phone = customer_phone;

    if (paymentIntentId) {
      const updateData: Record<string, any> = {};
      if (amount && amount > 0) updateData.amount = Math.round(amount * 100);
      if (currency) updateData.currency = currency;
      if (description) updateData.description = description;
      if (receipt_email) updateData.receipt_email = receipt_email;
      if (Object.keys(metadata).length > 0) updateData.metadata = metadata;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
      }

      const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || "inr",
      automatic_payment_methods: { enabled: true },
      description: description || undefined,
      receipt_email: receipt_email || undefined,
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
