"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStorefront } from "@/store/useStorefront";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, CreditCard, Loader2, XCircle, LogIn, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useStoreSettings } from "@/hooks/useStoreSettings";

function StripeElementsInner({ onReady }: { onReady: (s: any, e: any) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  useEffect(() => { if (stripe && elements) onReady(stripe, elements); }, [stripe, elements, onReady]);
  return <PaymentElement />;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const NAME_PATTERN = /^[A-Za-zÀ-ÿ\s\-']+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;
const CARD_PATTERN = /^\d{13,19}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVC_PATTERN = /^\d{3,4}$/;
const ZIP_PATTERN = /^\d{5,10}$/;

const COUNTRIES: Record<string, { states: Record<string, string[]> }> = {
  "United States": { states: { "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento"], "New York": ["New York City", "Buffalo", "Rochester", "Albany"], "Texas": ["Houston", "Dallas", "Austin", "San Antonio"], "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"], "Illinois": ["Chicago", "Aurora", "Naperville", "Springfield"] } },
  "Canada": { states: { "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton"], "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau"], "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby"] } },
  "United Kingdom": { states: { "England": ["London", "Manchester", "Birmingham", "Liverpool"], "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"], "Wales": ["Cardiff", "Swansea", "Newport", "Bangor"] } },
  "Australia": { states: { "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast"], "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo"], "Queensland": ["Brisbane", "Gold Coast", "Cairns", "Townsville"] } },
  "Germany": { states: { "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg"], "Berlin": ["Berlin"], "Hamburg": ["Hamburg"], "Hesse": ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel"] } },
  "France": { states: { "Ile-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Versailles"], "Provence-Alpes-Cote d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence"], "Auvergne-Rhone-Alpes": ["Lyon", "Grenoble", "Saint-Etienne", "Clermont-Ferrand"] } },
  "India": { states: { "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"], "Delhi": ["New Delhi", "Delhi"], "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"], "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"] } },
  "Japan": { states: { "Tokyo": ["Tokyo", "Hachioji", "Machida", "Tama"], "Osaka": ["Osaka", "Sakai", "Higashiosaka", "Toyonaka"], "Kanagawa": ["Yokohama", "Kawasaki", "Sagamihara", "Yamato"] } },
  "Brazil": { states: { "Sao Paulo": ["Sao Paulo", "Guarulhos", "Campinas", "Sao Bernardo do Campo"], "Rio de Janeiro": ["Rio de Janeiro", "Niteroi", "Duque de Caxias", "Nova Iguacu"], "Minas Gerais": ["Belo Horizonte", "Uberlandia", "Contagem", "Juiz de Fora"] } },
  "United Arab Emirates": { states: { "Dubai": ["Dubai City", "Jebel Ali", "Deira", "Bur Dubai"], "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Musaffah", "Khalifa City"] } },
};

const COUNTRY_OPTIONS = Object.keys(COUNTRIES);

export default function CheckoutPage() {
  const cart = useStorefront((s) => s.cart);
  const clearCart = useStorefront((s) => s.clearCart);
  const settings = useStoreSettings();
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState<any>(null);
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (key) setStripePromise(loadStripe(key));
  }, []);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [billing, setBilling] = useState({
    firstName: "", lastName: "", company: "", address: "",
    country: "United States", region: "", city: "", zipCode: "",
    email: "", phone: "",
  });
  const [shipDifferentAddress, setShipDifferentAddress] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string | number>>(new Set());
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_percent > 0) {
      discount = subTotal * (appliedCoupon.discount_percent / 100);
    } else if (appliedCoupon.discount_amount > 0) {
      discount = appliedCoupon.discount_amount;
    }
  }
  const tax = subTotal * (settings.taxRate / 100);
  const total = subTotal - discount + tax;

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const creatingPiRef = useRef(false);
  const lastTotalRef = useRef(0);
  const stripeInstanceRef = useRef<any>(null);
  const elementsInstanceRef = useRef<any>(null);

  const [fallbackCard, setFallbackCard] = useState({ nameOnCard: "", cardNumber: "", expiry: "", cvc: "" });
  const [cardTouched, setCardTouched] = useState<Set<string>>(new Set());
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const availableCart = cart.filter((item) => !outOfStockIds.has(item.id));

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    async function checkStock() {
      const supabase = createClient();
      const ids = cart.map((i) => String(i.id));
      const { data } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .in("id", ids);
      if (data) {
        const outIds = new Set<string | number>();
        for (const item of cart) {
          const match = data.find((p) => String(p.id) === String(item.id));
          if (!match || Number(match.stock_quantity) <= 0) {
            outIds.add(item.id);
          }
        }
        setOutOfStockIds(outIds);
      }
    }
    if (cart.length > 0) checkStock();
  }, [cart]);

  useEffect(() => {
    if (paymentMethod === "card" && stripePromise && total > 0 && !clientSecret && !creatingPiRef.current) {
      creatingPiRef.current = true;
      lastTotalRef.current = total;
      stripeInstanceRef.current = null;
      elementsInstanceRef.current = null;
      const createIntent = async () => {
        const headers = await getAuthHeader();
        const r = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ amount: total, currency: "inr" }),
        });
        return r.json();
      };
      createIntent()
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId || null);
          }
          creatingPiRef.current = false;
        })
        .catch(() => { creatingPiRef.current = false; });
    }
  }, [paymentMethod, total]);

  useEffect(() => {
    if (paymentIntentId && paymentMethod === "card" && total > 0 && lastTotalRef.current !== total) {
      lastTotalRef.current = total;
      const updateIntent = async () => {
        const headers = await getAuthHeader();
        await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ paymentIntentId, amount: total, currency: "inr" }),
        });
      };
      updateIntent().catch(() => {});
    }
  }, [total, paymentIntentId, paymentMethod]);

  const markTouched = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  };

  const getError = (field: string, value: string): string | null => {
    if (!touched.has(field)) return null;
    if (!value.trim()) return `${field.replace(/([A-Z])/g, ' $1')} is required`;
    if ((field === "firstName" || field === "lastName") && !NAME_PATTERN.test(value)) return "Only letters, spaces, and hyphens allowed";
    if (field === "email" && !EMAIL_PATTERN.test(value)) return "Invalid email format";
    if (field === "phone" && !PHONE_PATTERN.test(value)) return "Invalid phone number";
    if (field === "zipCode" && !ZIP_PATTERN.test(value)) return "Zip code must be numeric (4-10 digits)";
    return null;
  };

  const updateBilling = (field: keyof typeof billing, value: string) => {
    if ((field === "firstName" || field === "lastName") && /[<>{}\\]/.test(value)) return;
    setBilling((current) => ({ ...current, [field]: value }));
  };

  const validateCardFields = (): boolean => {
    if (paymentMethod !== "card" || stripePromise) return true;
    const errs: Record<string, string> = {};
    if (!fallbackCard.nameOnCard.trim()) errs.nameOnCard = "Name on card is required";
    const digits = fallbackCard.cardNumber.replace(/\s/g, "");
    if (!digits || !CARD_PATTERN.test(digits)) errs.cardNumber = "Enter a valid card number (13-19 digits)";
    if (!EXPIRY_PATTERN.test(fallbackCard.expiry)) errs.expiry = "Use MM/YY format";
    if (!CVC_PATTERN.test(fallbackCard.cvc)) errs.cvc = "CVC must be 3-4 digits";
    setCardErrors(errs);
    setCardTouched(new Set(["nameOnCard", "cardNumber", "expiry", "cvc"]));
    return Object.keys(errs).length === 0;
  };

  const validateAll = (): boolean => {
    const fields: (keyof typeof billing)[] = ["firstName", "lastName", "address", "email", "phone", "zipCode"];
    const allTouched = new Set(touched);
    let valid = true;
    for (const f of fields) {
      allTouched.add(f);
      const err = getError(f, billing[f]);
      if (err) valid = false;
    }
    setTouched(allTouched);
    const cardValid = validateCardFields();
    return valid && cardValid;
  };

  const handlePlaceOrder = async () => {
    if (!validateAll()) return;
    if (availableCart.length === 0) {
      setError("All items in your cart are out of stock.");
      return;
    }

    setIsPlacingOrder(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowLoginPopup(true);
        setIsPlacingOrder(false);
        return;
      }

      const billingWithEmail = {
        ...billing,
        email: billing.email || user.email || "",
      };

      const productIdsToCheck = availableCart
        .filter((item) => UUID_PATTERN.test(String(item.id)))
        .map((item) => String(item.id));

      if (productIdsToCheck.length > 0) {
        const { data: stockData, error: stockError } = await supabase
          .from("products")
          .select("id, name, stock_quantity")
          .in("id", productIdsToCheck);

        if (stockError) throw stockError;

        for (const item of availableCart) {
          const pid = String(item.id);
          if (!UUID_PATTERN.test(pid)) continue;
          const product = stockData?.find((p) => p.id === pid);
          if (!product) {
            const names = (stockData ?? []).map((p) => p.name).join(", ");
            throw new Error(`Product ${item.name} (${pid}) not found in DB. Found: ${names || "none"}`);
          }
          if (product.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}: only ${product.stock_quantity} available, ${item.quantity} requested`);
          }
        }
      }

      for (const item of availableCart) {
        const pid = String(item.id);
        if (!UUID_PATTERN.test(pid)) continue;
        const { data: ok, error: decErr } = await supabase.rpc("decrement_stock", {
          row_id: pid,
          quantity: item.quantity,
        });
        if (decErr) throw new Error(`Failed to decrement stock for ${item.name}`);
        if (ok === false) {
          throw new Error(`Insufficient stock for ${item.name}: requested=${item.quantity}`);
        }
      }

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'Pending',
          payment_method: paymentMethod,
          billing_address: billingWithEmail,
          shipping_address: shipDifferentAddress ? billingWithEmail : billingWithEmail,
          notes: orderNotes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsToInsert = availableCart.map(item => ({
        order_id: orderData.id,
        product_id: UUID_PATTERN.test(String(item.id)) ? String(item.id) : null,
        product_name: item.name,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      if (paymentMethod === "card") {
        if (paymentIntentId) {
          await supabase.from('orders').update({ stripe_payment_intent_id: paymentIntentId }).eq('id', orderData.id);

          const piName = `${billing.firstName} ${billing.lastName}`.trim();
          const piEmail = billing.email || user.email || "";
          await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
            body: JSON.stringify({
              paymentIntentId,
              amount: total,
              currency: "inr",
              order_id: orderData.id,
              description: `Order #${orderData.id.slice(0, 8).toUpperCase()} - ${piName}`,
              receipt_email: piEmail,
              customer_name: piName,
              customer_phone: billing.phone,
            }),
          });
        }
      }

      if (paymentMethod === "card" && stripePromise && stripeInstanceRef.current && clientSecret) {
        await elementsInstanceRef.current.submit();
        const { error: paymentError } = await stripeInstanceRef.current.confirmPayment({
          elements: elementsInstanceRef.current,
          clientSecret,
          redirect: "if_required",
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?orderId=${orderData.id}`,
          },
        });

        if (paymentError) {
          for (const item of availableCart) {
            const pid = String(item.id);
            if (!UUID_PATTERN.test(pid)) continue;
            const { error: incErr } = await supabase.rpc("increment_stock", {
              row_id: pid,
              quantity: item.quantity,
            });
            if (incErr) console.error(`Failed to restore stock for ${item.name}:`, incErr.message);
          }
          await supabase.from('orders').update({ status: 'Failed' }).eq('id', orderData.id);
          throw paymentError;
        }
      }

      if (appliedCoupon) {
        await supabase
          .from("promotions")
          .update({ usage_count: (appliedCoupon.usage_count || 0) + 1 })
          .eq("id", appliedCoupon.id);
      }

      clearCart();
      router.push(`/checkout/success?orderId=${orderData.id}`);

    } catch (err: any) {
      setError(err.message || "Failed to place order.");
      setIsPlacingOrder(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    const supabase = createClient();
    const { data } = await supabase
      .from("promotions")
      .select("*")
      .ilike("code", couponCode.trim())
      .eq("is_active", true)
      .maybeSingle();
    if (!data) {
      setCouponError("Invalid or expired coupon code");
      setApplyingCoupon(false);
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired");
      setApplyingCoupon(false);
      return;
    }
    if (data.usage_limit > 0 && data.usage_count >= data.usage_limit) {
      setCouponError("This coupon has reached its usage limit");
      setApplyingCoupon(false);
      return;
    }
    if (data.min_order_amount > 0 && subTotal < data.min_order_amount) {
      setCouponError(`Minimum order amount of ₹${data.min_order_amount} required`);
      setApplyingCoupon(false);
      return;
    }
    setAppliedCoupon(data);
    setApplyingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const states = billing.country ? Object.keys(COUNTRIES[billing.country]?.states || {}) : [];
  const cities = billing.country && billing.region ? COUNTRIES[billing.country]?.states[billing.region] || [] : [];

  const renderInput = (field: keyof typeof billing, label: string, opts?: { type?: string; placeholder?: string; optional?: boolean }) => {
    const err = getError(field, billing[field]);
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">
          {label} {opts?.optional && <span className="text-gray-400 font-normal">(Optional)</span>}
        </label>
        <div className="relative">
          <Input
            type={opts?.type || "text"}
            value={billing[field]}
            onChange={(e) => updateBilling(field, e.target.value)}
            onBlur={() => markTouched(field)}
            placeholder={opts?.placeholder || ""}
            className={`h-11 border-gray-200 focus-visible:ring-brand-orange ${err ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
          {err && <XCircle className="w-4 h-4 text-red-400 absolute right-3 top-1/2 -translate-y-1/2" />}
        </div>
        {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1"><span>🏠</span> Home</Link>
          <span className="text-gray-400">›</span>
          <Link href="/cart" className="hover:text-brand-orange">Shopping Card</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Checkout</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-10">

            {/* Billing Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">User name</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input value={billing.firstName} onChange={(e) => updateBilling("firstName", e.target.value)} onBlur={() => markTouched("firstName")} placeholder="First name"
                        className={`h-11 border-gray-200 focus-visible:ring-brand-orange ${getError("firstName", billing.firstName) ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                      {getError("firstName", billing.firstName) && <p className="text-xs text-red-500 mt-1">{getError("firstName", billing.firstName)}</p>}
                    </div>
                    <div className="flex-1">
                      <Input value={billing.lastName} onChange={(e) => updateBilling("lastName", e.target.value)} onBlur={() => markTouched("lastName")} placeholder="Last name"
                        className={`h-11 border-gray-200 focus-visible:ring-brand-orange ${getError("lastName", billing.lastName) ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                      {getError("lastName", billing.lastName) && <p className="text-xs text-red-500 mt-1">{getError("lastName", billing.lastName)}</p>}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Company Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <Input value={billing.company} onChange={(e) => updateBilling("company", e.target.value)} placeholder="" className="h-11 border-gray-200 focus-visible:ring-brand-orange" />
                </div>
              </div>

              <div className="mb-4">
                {renderInput("address", "Address", { placeholder: "Street address, P.O. box, etc." })}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Country</label>
                  <Select value={billing.country} onValueChange={(v) => { updateBilling("country", v); updateBilling("region", ""); updateBilling("city", ""); }}>
                    <SelectTrigger className={`h-11 ${getError("country", billing.country) ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Select country..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Region/State</label>
                  <Select value={billing.region} onValueChange={(v) => { updateBilling("region", v); updateBilling("city", ""); }} disabled={!billing.country}>
                    <SelectTrigger className={`h-11 ${getError("region", billing.region) ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Select state..." />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">City</label>
                  <Select value={billing.city} onValueChange={(v) => updateBilling("city", v)} disabled={!billing.region}>
                    <SelectTrigger className={`h-11 ${getError("city", billing.city) ? "border-red-400" : ""}`}>
                      <SelectValue placeholder="Select city..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  {renderInput("zipCode", "Zip Code")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {renderInput("email", "Email", { type: "email" })}
                {renderInput("phone", "Phone Number", { type: "tel", placeholder: "+1 (555) 000-0000" })}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input checked={shipDifferentAddress} onChange={(e) => setShipDifferentAddress(e.target.checked)} type="checkbox" className="rounded border-gray-300 text-brand-orange focus:ring-brand-orange w-4 h-4" />
                Ship into different address
              </label>
            </div>

            {/* Payment Option */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Payment Option</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 text-center text-sm font-medium">
                {[
                  settings.codEnabled && { id: "cod", label: "Cash on Delivery", icon: <span className="text-orange-500 font-bold text-xl">₹</span> },
                  { id: "venmo", label: "Venmo", icon: <span className="text-blue-500 font-bold text-xl">v</span> },
                  settings.paypalEnabled && { id: "paypal", label: "Paypal", icon: <span className="text-blue-800 font-bold text-xl">P</span> },
                  { id: "amazon", label: "Amazon Pay", icon: <span className="text-black font-bold text-xl">a</span> },
                  settings.stripeEnabled && { id: "card", label: "Debit/Credit Card", icon: <CreditCard className="w-6 h-6 text-orange-500 mx-auto" /> },
                ].filter(Boolean).map((method: any) => (
                  <button key={method.id} type="button" role="radio" aria-checked={paymentMethod === method.id}
                    onClick={() => !method.disabled && setPaymentMethod(method.id)}
                    className={`p-4 border-b border-r border-gray-100 transition-colors ${method.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'} ${paymentMethod === method.id ? 'bg-orange-50/30' : ''}`}>
                    <div className="mb-2 h-6 flex items-center justify-center">{method.icon}</div>
                    <div className="text-xs text-gray-700 mb-3">{method.label}{method.disabled && <span className="block text-[10px] text-red-400 mt-0.5">Unavailable</span>}</div>
                    <div className={`w-4 h-4 mx-auto rounded-full border flex items-center justify-center ${paymentMethod === method.id ? 'border-brand-orange' : 'border-gray-300'}`}>
                      {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                    </div>
                  </button>
                ))}
              </div>
              {paymentMethod === "card" && (
                <div className="p-6 space-y-4">
                  {stripePromise ? (
                    clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                          <p className="text-sm font-medium text-blue-700">Secure payment via Stripe</p>
                        </div>
                        <StripeElementsInner onReady={(s, e) => { stripeInstanceRef.current = s; elementsInstanceRef.current = e; }} />
                        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                      </Elements>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500 p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing secure payment...
                      </div>
                    )
                  ) : (
                    <>
                      <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Name on Card</label>
                        <Input value={fallbackCard.nameOnCard} onChange={(e) => setFallbackCard({ ...fallbackCard, nameOnCard: e.target.value })}
                          onBlur={() => { setCardTouched(new Set(cardTouched).add("nameOnCard")); validateCardFields(); }}
                          placeholder="" className={`h-11 border-gray-200 ${cardErrors.nameOnCard ? "border-red-400" : ""}`} />
                        {cardErrors.nameOnCard && <p className="text-xs text-red-500 mt-1">{cardErrors.nameOnCard}</p>}
                      </div>
                      <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</label>
                        <Input value={fallbackCard.cardNumber} onChange={(e) => setFallbackCard({ ...fallbackCard, cardNumber: e.target.value })}
                          onBlur={() => { setCardTouched(new Set(cardTouched).add("cardNumber")); validateCardFields(); }}
                          placeholder="0000 0000 0000 0000" className={`h-11 border-gray-200 ${cardErrors.cardNumber ? "border-red-400" : ""}`} />
                        {cardErrors.cardNumber && <p className="text-xs text-red-500 mt-1">{cardErrors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Expire Date</label>
                          <Input value={fallbackCard.expiry} onChange={(e) => setFallbackCard({ ...fallbackCard, expiry: e.target.value })}
                            onBlur={() => { setCardTouched(new Set(cardTouched).add("expiry")); validateCardFields(); }}
                            placeholder="MM/YY" className={`h-11 border-gray-200 ${cardErrors.expiry ? "border-red-400" : ""}`} />
                          {cardErrors.expiry && <p className="text-xs text-red-500 mt-1">{cardErrors.expiry}</p>}
                        </div>
                        <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">CVC</label>
                          <Input value={fallbackCard.cvc} onChange={(e) => setFallbackCard({ ...fallbackCard, cvc: e.target.value })}
                            onBlur={() => { setCardTouched(new Set(cardTouched).add("cvc")); validateCardFields(); }}
                            placeholder="000" className={`h-11 border-gray-200 ${cardErrors.cvc ? "border-red-400" : ""}`} />
                          {cardErrors.cvc && <p className="text-xs text-red-500 mt-1">{cardErrors.cvc}</p>}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea rows={4} placeholder="Notes about your order, e.g. special notes for delivery"
                value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange resize-none" />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                ) : (
                  cart.map((item) => {
                    const isOos = outOfStockIds.has(item.id);
                    return (
                      <div key={item.id} className={`flex gap-3 ${isOos ? "opacity-50" : ""}`}>
                        <div className="w-12 h-12 border border-gray-100 rounded flex-shrink-0 relative overflow-hidden">
                          <Image src={fixImageUrl(item.image, item.name)} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs text-gray-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isOos ? <span className="text-red-500 font-medium">Out of stock</span> : `${item.quantity} x `}
                            {!isOos && <span className="text-brand-blue font-semibold">₹{item.price.toLocaleString()}</span>}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sub-total</span>
                  <span className="font-medium text-gray-900">₹{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-500">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-medium text-gray-900">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })} INR</span>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded">{error}</div>}

              {/* Coupon Code */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Coupon Code</label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="h-11 border-gray-200 flex-1"
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || !!appliedCoupon || applyingCoupon}
                    variant="outline"
                    className="h-11 border-brand-orange text-brand-orange font-semibold"
                  >
                    {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : appliedCoupon ? "Applied" : "Apply"}
                  </Button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-green-50 p-2 rounded mt-2">
                    <span className="text-xs text-green-700 font-medium">Coupon applied: {appliedCoupon.code} ({appliedCoupon.discount_percent > 0 ? `${appliedCoupon.discount_percent}% off` : `₹${appliedCoupon.discount_amount} off`})</span>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>

              <Button onClick={handlePlaceOrder} disabled={isPlacingOrder || cart.length === 0}
                className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-14 uppercase tracking-wide flex items-center justify-center gap-2">
                {isPlacingOrder ? <Loader2 className="w-6 h-6 animate-spin" /> : "PLACE ORDER"}
                {!isPlacingOrder && <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Login Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-brand-orange" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to Continue</h2>
            <p className="text-sm text-gray-500 mb-8">Please sign in or create an account to place your order.</p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12">
                <Link href="/signin?redirectTo=/checkout">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-gray-200 h-12">
                <Link href="/signup?redirectTo=/checkout">Create Account</Link>
              </Button>
              <button onClick={() => setShowLoginPopup(false)} className="text-sm text-gray-500 hover:text-gray-700 mt-2">Continue as Guest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
