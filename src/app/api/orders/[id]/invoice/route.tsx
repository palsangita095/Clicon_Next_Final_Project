import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/api/api-function/supabase.admin";
import { OrderInvoice, InvoiceOrder } from "@/components/pdf/OrderInvoice";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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

  
  const admin = getSupabaseAdmin();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select(
      "id, user_id, status, total_amount, created_at, billing_address, payment_method, notes, order_items(product_id, product_name, quantity, price_at_time)"
    )
    .eq("id", id)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isOwner = order.user_id === user.id;
  const isAdmin = profile?.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: settingsRow } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", "storefront")
    .maybeSingle();

  const store = (settingsRow?.value ?? {}) as Record<string, unknown>;
  const storeName = String(store.storeName ?? "Clicon");
  const invoiceNumber = `INV-${String(order.id).slice(0, 8).toUpperCase()}`;

  const buffer = await renderToBuffer(
    <OrderInvoice
      invoiceNumber={invoiceNumber}
      storeName={storeName}
      storeContact={String(store.contactEmail ?? "")}
      order={order as unknown as InvoiceOrder}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceNumber}.pdf"`,
    },
  });
}