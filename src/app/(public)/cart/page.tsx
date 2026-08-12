"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ArrowRight, ShoppingBag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useStorefront } from "@/store/useStorefront";
import { fixImageUrl } from "@/lib/imageFallback";
import { createClient } from "@/lib/supabase/client";
import AccountSidebar from "@/components/account/AccountSidebar";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function CartPage() {
  const settings = useStoreSettings();
  const cart = useStorefront((s) => s.cart);
  const removeFromCart = useStorefront((s) => s.removeFromCart);
  const updateQuantity = useStorefront((s) => s.updateQuantity);
  const clearCart = useStorefront((s) => s.clearCart);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee) : 0;
  const tax = subtotal * (settings.taxRate / 100);
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discountPercent / 100) : 0;
  const total = subtotal + shipping + tax - discount;

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    setAppliedCoupon(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("promotions")
      .select("code, discount_percent, is_active, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      setCouponError("Error validating coupon. Try again.");
      setCouponLoading(false);
      return;
    }

    if (!data) {
      setCouponError("Coupon code not found.");
      setCouponLoading(false);
      return;
    }

    if (!data.is_active) {
      setCouponError("This coupon is no longer active.");
      setCouponLoading(false);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError("This coupon has expired.");
      setCouponLoading(false);
      return;
    }

    setAppliedCoupon({ code: data.code, discountPercent: data.discount_percent });
    setCouponLoading(false);
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCoupon("");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
     
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <AccountSidebar />
          <div className="flex-1 min-w-0">
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-16 text-center max-w-lg mx-auto">
            <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="bg-brand-orange hover:bg-orange-600 text-white font-semibold px-8">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              
                <div className="hidden sm:grid grid-cols-12 py-3 px-5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

               
                {cart.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center py-4 px-4 sm:px-5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    
                    <div className="col-span-12 sm:col-span-6 flex items-center gap-3 sm:gap-4">
                      <button aria-label={`Remove ${item.name} from cart`} onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 border rounded relative overflow-hidden flex-shrink-0">
                        <Image src={fixImageUrl(item.image, item.name)} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                      </div>
                      <Link href={`/products/${item.id}`} className="text-sm font-medium text-gray-800 hover:text-brand-orange line-clamp-2 transition-colors">
                        {item.name}
                      </Link>
                    </div>

                
                    <div className="col-span-4 sm:col-span-2 mt-3 sm:mt-0 text-center text-sm font-medium text-gray-700">
                      ₹{item.price.toLocaleString()}
                    </div>

                   
                    <div className="col-span-4 sm:col-span-2 mt-3 sm:mt-0 flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded h-9">
                        <button aria-label={`Decrease quantity of ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l text-lg leading-none">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button aria-label={`Increase quantity of ${item.name}`} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r text-lg leading-none">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                   
                    <div className="col-span-4 sm:col-span-2 mt-3 sm:mt-0 text-right text-sm font-bold text-brand-blue">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
                <div className="flex gap-2 flex-1">
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 flex-1 h-11 px-4 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{appliedCoupon.code}</span>
                      <span className="text-green-500">({appliedCoupon.discountPercent}% off)</span>
                      <button onClick={removeAppliedCoupon} aria-label="Remove coupon" className="ml-auto text-green-500 hover:text-green-700">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        className="border border-gray-200 rounded h-11 px-4 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={couponLoading || !coupon.trim()}
                        className="bg-brand-orange hover:bg-orange-600 text-white font-semibold h-11 px-6"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "APPLY COUPON"}
                      </Button>
                    </>
                  )}
                </div>
                {couponError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <XCircle className="w-4 h-4" />
                    {couponError}
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300 h-11"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

           
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">₹{shipping.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-medium">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-brand-blue">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button asChild className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 mt-6 gap-2 rounded">
                <Link href="/checkout">
                  PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full border-gray-200 text-gray-600 h-10 mt-2 text-sm">
                <Link href="/shop">Continue Shopping</Link>
              </Button>


              <div className="mt-4 text-center text-xs text-gray-400">
                🔒 100% Secure checkout
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
