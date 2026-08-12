import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/api/api-function/supabase.admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Amounts are verified server-side against the stored order total before an
// order is marked paid. This prevents a tampered client amount from being
// accepted — the Stripe charge is the source of truth, never the frontend.
const MATCH_TOLERANCE_MINOR = 1;

// Terminal paid states — once reached, an order must never be downgraded to
// Pending/Failed, and stock must not be restored for a fulfilled order.
const TERMINAL_PAID = new Set(["Processing", "Shipping", "Delivered", "Completed", "Refund"]);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const { data: order } = await supabase
        .from("orders")
        .select("id, status, total_amount")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!order) {
        console.warn(
          `payment_intent.succeeded: no order linked to intent ${paymentIntent.id}`
        );
        return NextResponse.json({ received: true });
      }

      // Idempotency: skip duplicate/out-of-order deliveries — never downgrade
      // an order that has already progressed past Pending/Failed.
      if (order.status !== "Pending" && order.status !== "Failed") {
        return NextResponse.json({ received: true });
      }

      const expectedMinor = Math.round(Number(order.total_amount) * 100);
      const chargedMinor = paymentIntent.amount_received ?? paymentIntent.amount;

      if (Math.abs(expectedMinor - chargedMinor) > MATCH_TOLERANCE_MINOR) {
        console.warn(
          `payment_intent.succeeded: amount mismatch for intent ${paymentIntent.id} — ` +
            `expected ${expectedMinor} minor units, charged ${chargedMinor}. Order NOT marked paid.`
        );
        return NextResponse.json({ received: true });
      }

      const { error: rpcError } = await supabase.rpc("update_order_status_by_payment_intent", {
        p_payment_intent_id: paymentIntent.id,
        p_status: "Processing",
      });
      if (rpcError) throw rpcError;
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const { data: order } = await supabase
        .from("orders")
        .select("id, status")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!order) return NextResponse.json({ received: true });

      // Never overwrite a paid/progressing order with a late failure event.
      if (TERMINAL_PAID.has(order.status)) {
        return NextResponse.json({ received: true });
      }

      const { error: rpcError } = await supabase.rpc("update_order_status_by_payment_intent", {
        p_payment_intent_id: paymentIntent.id,
        p_status: "Failed",
      });
      if (rpcError) throw rpcError;
    }

    if (event.type === "payment_intent.canceled") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const { data: order } = await supabase
        .from("orders")
        .select("id, status, order_items(product_id, quantity)")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!order) {
        return NextResponse.json({ received: true });
      }

      // Idempotency: only restore stock once — skip if already cancelled or
      // the order was actually paid/fulfilled.
      if (order.status === "Cancelled" || TERMINAL_PAID.has(order.status)) {
        return NextResponse.json({ received: true });
      }

      for (const item of order.order_items ?? []) {
        if (item.product_id) {
          const { error } = await supabase.rpc("increment_stock", {
            row_id: item.product_id,
            quantity: item.quantity,
          });
          if (error) {
            console.error(
              `Failed to restore stock for product ${item.product_id}:`,
              error.message
            );
          }
        }
      }

      const { error: rpcError } = await supabase.rpc("update_order_status_by_payment_intent", {
        p_payment_intent_id: paymentIntent.id,
        p_status: "Cancelled",
      });
      if (rpcError) throw rpcError;
    }
  } catch (err: any) {
    // Return non-2xx so Stripe retries the delivery. A 200 here would
    // silently drop the event and leave the order stuck.
    console.error("Webhook handler error:", err.message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}