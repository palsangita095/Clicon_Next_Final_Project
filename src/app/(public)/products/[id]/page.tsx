"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star, ShoppingCart, Heart, RefreshCcw, ChevronLeft, ChevronRight,
  Minus, Plus, Check, Share2, Truck, RotateCcw, ShieldCheck, Lock, AlertCircle
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStorefront } from "@/store/useStorefront";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"}`} />
      ))}
      {count !== undefined && <span className="text-sm text-gray-500 font-medium">{rating.toFixed(1)} Star Rating</span>}
      {count !== undefined && <span className="text-sm text-gray-400">({count.toLocaleString()} User feedback)</span>}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id: slug } = useParams();
  const router = useRouter();
  const addToCart = useStorefront((s) => s.addToCart);
  const addToWishlist = useStorefront((s) => s.addToWishlist);
  const isInWishlist = useStorefront((s) => s.isInWishlist);
  const addToCompare = useStorefront((s) => s.addToCompare);
  const isInCompare = useStorefront((s) => s.isInCompare);
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [productTags, setProductTags] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Standard");
  
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);


  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [reviewEligibilityMessage, setReviewEligibilityMessage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      const supabase = createClient();
      setLoading(true);

      const productKey = Array.isArray(slug) ? slug[0] : slug;
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(productKey);

      let query = supabase.from('products').select('*, category:categories!products_category_id_fkey(name), brand:brands!products_brand_id_fkey(name)');
      
      if (isUUID) {
        query = query.eq('id', productKey);
      } else {
        query = query.eq('slug', productKey);
      }

      const { data: pData, error: pError } = await query.maybeSingle();
        
      if (pError || !pData) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      setProduct(pData);
     
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("browsing_history").upsert(
            { user_id: user.id, product_id: pData.id, viewed_at: new Date().toISOString() },
            { onConflict: "user_id,product_id" }
          );
        }
      } catch {}

     
      const { data: rData } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', pData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
        
      if (rData) {
        const userIds = [...new Set(rData.map((review: any) => review.user_id).filter(Boolean))];
        const { data: profileData } = userIds.length
          ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
          : { data: [] };
        const profileMap = new Map((profileData ?? []).map((profile: any) => [profile.id, profile]));

        setReviews(
          rData.map((review: any) => ({
            ...review,
            profiles: profileMap.get(review.user_id) ?? null,
          })),
        );
      }

      
      const { data: relData } = await supabase
        .from('products')
        .select('id, name, price, image_urls, slug')
        .eq('category_id', pData.category_id)
        .neq('id', pData.id)
        .limit(8);

      if (relData) setRelatedProducts(relData);

   
      const { data: ptData } = await supabase
        .from('product_tags')
        .select('tag_id')
        .eq('product_id', pData.id);

      if (ptData && ptData.length > 0) {
        const { data: tagsData } = await supabase
          .from('tags')
          .select('id, name')
          .in('id', ptData.map((pt: any) => pt.tag_id));
        if (tagsData) setProductTags(tagsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [slug]);

  
  useEffect(() => {
    async function checkReviewEligibility() {
      if (!product?.id) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) {
        setCanReview(false);
        setReviewEligibilityMessage("Please sign in to leave a review.");
        return;
      }

      
      const { data: userOrders } = await supabase
        .from("orders")
        .select("id, status, order_items(product_id)")
        .eq("user_id", user.id)
        .eq("status", "Delivered");

      const hasDeliveredOrder = userOrders?.some((order: any) =>
        order.order_items?.some((item: any) => String(item.product_id) === String(product.id))
      );

      if (hasDeliveredOrder) {
        setCanReview(true);
        setReviewEligibilityMessage("");
      } else {
        setCanReview(false);
        setReviewEligibilityMessage("Only verified buyers who have purchased and received this product can leave a review.");
      }
    }

    checkReviewEligibility();
  }, [product]);

  const handleSubmitReview = async () => {
    if (!canReview) return;
    if (!reviewText.trim()) return;
    
    setSubmittingReview(true);
    const supabase = createClient();
    
    if (!currentUser) {
      toast.error("You must be logged in to review.");
      setSubmittingReview(false);
      return;
    }

   
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('product_id', product.id)
      .maybeSingle();

    const payload = {
      rating: reviewRating,
      comment: reviewText,
      is_approved: false,
      moderation_status: 'pending',
    };

    const { error } = existingReview
      ? await supabase.from('reviews').update(payload).eq('id', existingReview.id)
      : await supabase.from('reviews').insert({ ...payload, product_id: product.id, user_id: currentUser.id });

    if (error) {
      toast.error("Failed to submit review: " + error.message);
    } else {
      toast.success("Review submitted and pending approval.");
      setReviewText("");
      setReviewRating(5);
    }
    setSubmittingReview(false);
  };

  const inWishlist = product ? isInWishlist(product.id) : false;
  const inCompare = product ? isInCompare(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    const img = fixImageUrl(product.image_urls?.[0], product.name);
    addToCart({ id: product.id, name: product.name, price: displayPrice, image: img }, quantity);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    const img = fixImageUrl(displayImages[0], product.name);
    addToWishlist({ id: product.id, name: product.name, price: displayPrice, image: img });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("wishlist").upsert(
      {
        user_id: user.id,
        product_id: product.id,
      },
      { onConflict: "user_id,product_id" },
    );
  };

  const handleAddToCompare = () => {
    if (!product) return;
    const img = fixImageUrl(displayImages[0], product.name);
    const success = addToCompare({ id: product.id, name: product.name, price: displayPrice, image: img });
    if (!success) {
      toast.error("You can compare up to 4 products at a time.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div></div>;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-700">{error || "Not found"}</div>;
  
  const dealActive = product.is_best_deal && product.deal_end_time && new Date(product.deal_end_time).getTime() > new Date().getTime();
  const dealDiscount = Number(product.discount_percentage) || 0;
  const displayPrice = dealActive && dealDiscount > 0
    ? Math.round(product.price * (1 - dealDiscount / 100) * 100) / 100
    : product.price;
  const discountPercent = product.old_price ? Math.round(((product.old_price - displayPrice) / product.old_price) * 100) : 0;
  const avgRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
  const displayImages = product.image_urls?.length ? product.image_urls : [fixImageUrl(null, product.name)];

 
  const categoryName = product.category?.name || "Electronics";
  const isComputerOrTech = categoryName.toLowerCase().includes("laptop") || 
                           categoryName.toLowerCase().includes("smartphone") ||
                           categoryName.toLowerCase().includes("computer");

 
  const dynamicSpecs: [string, string][] = Array.isArray(product.specifications) && product.specifications.length > 0
    ? product.specifications.map((s: any) => [String(s.key || ''), String(s.value || '')])
    : product.specifications && typeof product.specifications === 'object'
    ? Object.entries(product.specifications).map(([k, v]) => [String(k), String(v)])
    : [
        ["Category", categoryName],
        ["Stock Quantity", `${product.stock_quantity} units`],
        ["Brand", product.brand?.name || "Clicon"],
        ["SKU / Slug", product.slug || product.id],
        ["Warranty", product.warranty_info || "1 Year Limited Warranty"],
        ["Shipping", product.shipping_info || "Free 2-4 days courier shipping"]
      ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
    
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/shop" className="hover:text-brand-orange">{categoryName}</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-8">

       
          <div className="flex flex-col gap-4">
            <div className="relative bg-gray-50 rounded-lg border border-gray-100 w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
              <Image src={fixImageUrl(displayImages[selectedImage], product.name)} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-8" />
            </div>

         
            <div className="flex items-center gap-3">
              <button
                aria-label="Previous image"
                className="bg-brand-orange text-white rounded-full p-1.5 hover:bg-orange-600 flex-shrink-0"
                onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
                {displayImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden relative transition-all ${i === selectedImage ? "border-brand-orange" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <Image src={fixImageUrl(img, product.name)} alt={`View ${i + 1}`} fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
              <button
                aria-label="Next image"
                className="bg-brand-orange text-white rounded-full p-1.5 hover:bg-orange-600 flex-shrink-0"
                onClick={() => setSelectedImage(Math.min(displayImages.length - 1, selectedImage + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          
          <div className="flex flex-col gap-4">
            
            <StarRating rating={avgRating} count={reviews.length} />

            
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              {product.name}
            </h1>

            
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div className="flex gap-2"><span className="text-gray-400">Availability:</span><span className={`${product.stock_quantity > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}>{product.stock_quantity > 0 ? "In Stock" : "Out of Stock"} ({product.stock_quantity})</span></div>
              <div className="flex gap-2"><span className="text-gray-400">Category:</span><span className="font-medium">{categoryName}</span></div>
            </div>

           
            {productTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {productTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/shop?search=${encodeURIComponent(tag.name)}`}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-50 text-brand-orange px-3 py-1 text-xs font-medium hover:bg-brand-orange hover:text-white transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

          
            <div className="flex items-center gap-3 pt-2">
              <span className="text-3xl font-bold text-brand-blue">₹{displayPrice.toLocaleString()}</span>
              {product.old_price && <span className="text-lg text-gray-400 line-through">₹{product.old_price.toLocaleString()}</span>}
              {discountPercent > 0 && <span className="bg-brand-yellow text-gray-900 text-sm font-bold px-2.5 py-0.5 rounded">{discountPercent}% OFF</span>}
            </div>

           
            {isComputerOrTech && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Color</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedColor("Standard")}
                      title="Standard"
                      aria-label="Color: Standard"
                      aria-pressed={selectedColor === "Standard"}
                      className={`w-8 h-8 rounded-full border-2 transition-all bg-gray-700 ${selectedColor === "Standard" ? "ring-2 ring-offset-2 ring-brand-orange" : ""}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Size / Edition</label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Edition</SelectItem>
                      <SelectItem value="pro">Pro Edition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center border border-gray-200 rounded h-12 w-32">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-semibold">{String(quantity).padStart(2, "0")}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 bg-brand-orange hover:bg-orange-600 text-white h-12 font-semibold gap-2">
                ADD TO CART <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button asChild variant="outline" className="flex-1 border-brand-blue text-brand-blue hover:bg-blue-50 h-12 font-semibold">
                <Link href="/checkout">BUY NOW</Link>
              </Button>
            </div>

            
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 pt-1">
              <div className="flex items-center gap-4">
                <button onClick={handleAddToWishlist} className={`flex items-center gap-1.5 transition-colors ${inWishlist ? "text-red-500 font-semibold" : "hover:text-brand-orange"}`}>
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  {inWishlist ? "In Wishlist" : "Add to Wishlist"}
                </button>
                <button onClick={handleAddToCompare} className={`flex items-center gap-1.5 transition-colors ${inCompare ? "text-brand-orange font-semibold" : "hover:text-brand-orange"}`}>
                  <RefreshCcw className="w-4 h-4" /> {inCompare ? "In Compare" : "Add to Compare"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>Share product</span>
              </div>
            </div>

          
            <div className="mt-2 border border-gray-100 rounded p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">100% Guarantee Safe Checkout</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["VISA", "MC", "PayPal", "Amex", "Stripe"].map((p) => (
                  <div key={p} className="h-6 px-3 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-500">{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-gray-100 bg-transparent rounded-none w-full justify-start px-6 pt-2 h-auto gap-0">
              {["description", "additional", "specification", "review"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="capitalize px-5 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-orange data-[state=active]:text-brand-orange data-[state=active]:bg-transparent font-medium text-sm text-gray-600 hover:text-brand-orange transition-colors"
                >
                  {tab === "additional" ? "Additional Information" : tab === "specification" ? "Specification" : tab}
                </TabsTrigger>
              ))}
            </TabsList>

            
            <TabsContent value="description" className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description || "High-quality item tested for ultimate performance and reliability."}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features & Warranty</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {product.warranty_info || "1 Year Limited Warranty"}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> 100% Authentic Product
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> Secure payment method
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Shipping Information</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.shipping_info || "Free 2-4 days courier shipping on orders over ₹5000."}</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between gap-2"><span className="font-medium">Standard Delivery:</span><span>2–4 days</span></li>
                    <li className="flex justify-between gap-2"><span className="font-medium">Express Delivery:</span><span>1–2 days</span></li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            
            <TabsContent value="review" className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Customer Reviews ({reviews.length})</h3>
                  <div className="space-y-5">
                    {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet for this product.</p>}
                    {reviews.map((r) => (
                      <div key={r.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-800">{r.profiles?.full_name || 'Verified Buyer'}</span>
                          <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-US')}</span>
                        </div>
                        <StarRating rating={r.rating} />
                        <p className="text-sm text-gray-600 mt-2">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>

                  {!canReview ? (
                    <div className="p-5 border border-amber-200 bg-amber-50/70 rounded-xl space-y-3">
                      <div className="flex items-start gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Review Submission Restricted</p>
                          <p className="text-xs text-amber-700 mt-1">{reviewEligibilityMessage}</p>
                        </div>
                      </div>
                      {!currentUser && (
                        <Button asChild size="sm" className="bg-brand-orange text-white text-xs font-semibold">
                          <Link href="/signin">Sign In to Review</Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Your Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setReviewRating(s)} aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`} aria-pressed={s <= reviewRating}>
                              <Star className={`w-6 h-6 ${s <= reviewRating ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="product-review-text" className="text-sm font-medium text-gray-700 mb-1 block">Your Review</label>
                        <textarea
                          id="product-review-text"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          placeholder="Write your review here..."
                          className="w-full border border-gray-200 rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange resize-none"
                        />
                      </div>
                      <Button onClick={handleSubmitReview} disabled={submittingReview} className="bg-brand-orange hover:bg-orange-600 text-white font-semibold">
                        {submittingReview ? "SUBMITTING..." : "SUBMIT REVIEW"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            
            <TabsContent value="additional" className="p-6 md:p-8">
              <div className="space-y-3 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Warranty Info:</span> {product.warranty_info || "1 Year Limited Warranty provided by manufacturer/seller."}</p>
                <p><span className="font-semibold text-gray-800">Shipping Info:</span> {product.shipping_info || "Standard courier delivery within 2-4 business days."}</p>
                <p><span className="font-semibold text-gray-800">Returns:</span> 30-day money-back guarantee for unused items in original packaging.</p>
              </div>
            </TabsContent>

          
            <TabsContent value="specification" className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-w-2xl">
                {dynamicSpecs.map(([k, v]) => (
                  <div key={k} className="flex gap-2 p-2.5 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-500 font-medium w-36 flex-shrink-0 capitalize">{k}:</span>
                    <span className="text-gray-900 font-semibold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

       
        <div className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Related Products", items: relatedProducts.slice(0, 4) },
              { title: "More from this Category", items: relatedProducts.slice(4, 8) },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-lg border border-gray-100 p-4 md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-3">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <Link key={item.id} href={`/products/${item.slug || item.id}`} className="flex gap-3 group">
                      <div className="w-16 h-16 bg-gray-50 rounded border flex-shrink-0 relative overflow-hidden">
                        <Image src={fixImageUrl(item.image_urls?.[0], item.name)} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-brand-orange transition-colors leading-snug">{item.name}</p>
                        <p className="text-brand-blue font-semibold text-sm mt-1">₹{Number(item.price).toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                  {section.items.length === 0 && <p className="text-sm text-gray-500">No related products.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
