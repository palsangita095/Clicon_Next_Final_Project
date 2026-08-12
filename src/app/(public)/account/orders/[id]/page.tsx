"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, FileDown, Package, Truck, Home, Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

const STATUS_STEPS = [
  { label: "Order Placed", icon: Package, statuses: ["Pending"] },
  { label: "Packaging", icon: Package, statuses: ["Processing"] },
  { label: "On The Road", icon: Truck, statuses: ["Shipping"] },
  { label: "Delivered", icon: Home, statuses: ["Delivered", "Completed"] },
];

function getStatusStep(status?: string) {
  if (!status) return 0;
  const index = STATUS_STEPS.findIndex((step) => step.statuses.includes(status));
  return index === -1 ? 0 : index;
}

function formatAddress(address: any) {
  if (!address || typeof address !== "object") return "No address saved for this order.";
  const name = [address.firstName, address.lastName].filter(Boolean).join(" ") || "N/A";
  const addr = [address.address, address.city, address.region, address.country, address.zipCode].filter(Boolean).join(", ") || "N/A";
  const phone = address.phone || "N/A";
  const email = address.email || "N/A";
  return (
    <>
      <p>{name}</p>
      <p>{addr}</p>
      <p>{phone}</p>
      <p>{email}</p>
    </>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = String(params.id);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const downloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to generate invoice");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed:", err);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total_amount,
          created_at,
          billing_address,
          shipping_address,
          payment_method,
          notes,
          order_items(
            id,
            product_id,
            product_name,
            quantity,
            price_at_time,
            products(image_urls, category:categories!products_category_id_fkey(name))
          )
        `)
        .eq("id", orderId)
        .maybeSingle();

      setOrder(data);
      const firstProductId = data?.order_items?.find((item: any) => item.product_id)?.product_id;
      if (firstProductId) setSelectedProductId(firstProductId);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const activeStep = getStatusStep(order?.status);

  const orderActivity = useMemo(() => {
    if (!order) return [];

    const createdAt = new Date(order.created_at).toLocaleString();
    const items = [
      { text: "Your order has been confirmed.", date: createdAt },
      { text: "Your order is ready for packaging.", date: createdAt },
    ];

    if (activeStep >= 2) items.unshift({ text: "Your order is on the road.", date: createdAt });
    if (activeStep >= 3) items.unshift({ text: "Your order has been delivered. Thank you for shopping at Clicon!", date: createdAt });
    if (order.status === "Cancelled") items.unshift({ text: "Your order was cancelled.", date: createdAt });

    return items;
  }, [activeStep, order]);

  const submitReview = async () => {
    if (!selectedProductId || !reviewText.trim()) return;

    setSubmittingReview(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setSubmittingReview(false);
      return;
    }

    
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("product_id", selectedProductId)
      .maybeSingle();

    const payload = {
      rating: reviewRating,
      comment: reviewText,
      is_approved: false,
      moderation_status: "pending",
    };

    const { error } = existingReview
      ? await supabase.from("reviews").update(payload).eq("id", existingReview.id)
      : await supabase.from("reviews").insert({ ...payload, product_id: selectedProductId, user_id: auth.user.id });

    setSubmittingReview(false);

    if (!error) {
      setReviewText("");
      setReviewRating(5);
      setShowReviewModal(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order...</div>;

  if (!order) {
    return (
      <div className="bg-white rounded-md border border-gray-100 p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-sm text-gray-500 mb-6">This order may not exist or may not belong to your account.</p>
        <Button asChild className="bg-brand-orange hover:bg-orange-600">
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Link href="/account/orders" className="flex items-center gap-2 text-gray-700 hover:text-brand-orange font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> ORDER DETAILS
          </Link>
          <div className="flex items-center gap-4">
            {order.order_items?.some((item: any) => item.product_id) && (
              <button onClick={() => setShowReviewModal(true)} className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
                Leave a Rating <span className="text-lg">+</span>
              </button>
            )}
            <button
              onClick={downloadInvoice}
              disabled={downloadingInvoice}
              className="text-brand-orange text-sm font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {downloadingInvoice ? "Generating…" : "Download Invoice"}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">#{order.id.split("-")[0].toUpperCase()}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.order_items?.length ?? 0} Products · Order Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <p className="text-3xl font-bold text-green-500">${Number(order.total_amount).toFixed(2)}</p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Current status <span className="font-bold text-gray-900">{order.status}</span>
        </p>

        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 mx-16" />
          <div className="absolute top-6 left-0 h-0.5 bg-brand-orange mx-16" style={{ width: `${Math.max(8, activeStep * 31)}%` }} />

          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const completed = index <= activeStep;

            return (
              <div key={step.label} className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${completed ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-400"}`}>
                  {completed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium ${completed ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Order Activity</h3>
        <div className="space-y-6 relative">
          <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-100" />

          {orderActivity.map((activity, index) => (
            <div key={index} className="flex gap-5 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${index === 0 ? "bg-green-50 text-green-500" : "bg-gray-50 text-gray-400"}`}>
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">{activity.text}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Product ({String(order.order_items?.length ?? 0).padStart(2, "0")})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-xs tracking-wider border-b border-gray-100">
                <th className="pb-3 font-medium">PRODUCTS</th>
                <th className="pb-3 font-medium">PRICE</th>
                <th className="pb-3 font-medium">QUANTITY</th>
                <th className="pb-3 font-medium">SUB-TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items?.map((item: any) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                const image = fixImageUrl(product?.image_urls?.[0], product?.name);

                return (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-md relative flex-shrink-0">
                          <Image src={image} alt={item.product_name} fill sizes="64px" className="object-contain p-1" />
                        </div>
                        <div>
                          <span className="text-brand-orange text-xs font-bold uppercase tracking-wider">{product?.category?.name ?? "PRODUCT"}</span>
                          <p className="text-sm text-gray-700 mt-1 max-w-xs truncate">{item.product_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 text-gray-700">₹{Number(item.price_at_time).toFixed(2)}</td>
                    <td className="py-5 text-gray-700">x{item.quantity}</td>
                    <td className="py-5 font-medium text-gray-900">₹{(Number(item.price_at_time) * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Billing Address</h4>
          <div className="text-sm text-gray-500 leading-relaxed">{formatAddress(order.billing_address)}</div>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Shipping Address</h4>
          <div className="text-sm text-gray-500 leading-relaxed">{formatAddress(order.shipping_address ?? order.billing_address)}</div>
        </div>
        <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Order Notes</h4>
          <p className="text-sm text-gray-500 leading-relaxed">{order.notes || "No notes were added to this order."}</p>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-8 shadow-2xl relative" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-6">Leave a Rating</h3>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Product</label>
                <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="w-full rounded-md border border-gray-200 p-3 text-sm">
                  {order.order_items
                    ?.filter((item: any) => item.product_id)
                    .map((item: any) => (
                      <option key={item.id} value={item.product_id}>{item.product_name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} type="button" onClick={() => setReviewRating(rating)}>
                      <Star className={`w-6 h-6 ${rating <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Feedback</label>
                <textarea
                  className="w-full min-h-[120px] border border-gray-200 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
                  placeholder="Write down your feedback about this product"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                />
              </div>

              <Button onClick={submitReview} disabled={submittingReview || !reviewText.trim() || !["Delivered", "Completed"].includes(order.status)} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 w-full uppercase tracking-wide">
                {submittingReview ? "Publishing..." : ["Delivered", "Completed"].includes(order.status) ? "Publish Review" : "Deliver Order to Review"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
