"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronRight,
  Package,
  Calendar,
  Activity,
  Palette,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts";
import { useParams } from "next/navigation";
import { fixImageUrl } from "@/lib/imageFallback";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BrandInput from "@/components/common/BrandInput";
import {
  createProductTag,
  fetchAdminProductById,
  fetchCategoryOptions,
  fetchProductOrders,
  fetchProductRevenueTrend,
  syncProductTags,
  updateAdminProduct,
  uploadStoreImage,
} from "@/api/api-function/adminProducts.function";
import type { ProductOrderRow } from "@/api/api-function/adminProducts.function";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").regex(/^[a-zA-Z0-9\s\-]+$/, "No special characters allowed"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  old_price: z.coerce.number().optional().or(z.literal(0)),
  stock_quantity: z.coerce.number().min(0, "Stock cannot be negative"),
  status: z.enum(["active", "draft", "archived"]),
  is_featured: z.boolean().default(false),
  is_best_deal: z.boolean().default(false),
  deal_end_time: z.string().optional().nullable(),
  is_flash_sale: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
  is_top_rated: z.boolean().default(false),
  discount_percentage: z.coerce.number().min(0).max(100).default(0),
  brandId: z.string().optional().nullable(),
  warrantyInfo: z.string().optional(),
  shippingInfo: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// --- Mock Data ---
const METRICS = [
  { label: "Revenue", value: "₹75,620", change: "+22%", isPositive: true, data: [4, 3, 5, 4, 6, 5, 8] },
  { label: "Orders Paid", value: "520", change: "+5.7%", isPositive: true, data: [3, 4, 3, 5, 4, 6, 7] },
  { label: "Refunds", value: "7,283", change: "18%", isPositive: false, data: [8, 6, 7, 5, 4, 5, 3] },
  { label: "Net Profit", value: "28%", change: "+12%", isPositive: true, data: [5, 4, 6, 5, 7, 6, 8] },
];

const revenueFormatter = (value: number) =>
  `₹${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

export default function AdminProductDetailsPage() {
  const params = useParams();
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - 28);
    return `${start.toLocaleDateString('en-US')} - ${now.toLocaleDateString('en-US')}`;
  });
  const [product, setProduct] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productOrders, setProductOrders] = useState<ProductOrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [revenueData, setRevenueData] = useState<{ name: string; value: number }[]>([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // Image Upload State
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Tags
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Categories
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Specs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "active",
      stock_quantity: 0,
      is_featured: false,
      is_best_deal: false,
      is_flash_sale: false,
      is_best_seller: false,
      is_top_rated: false,
      discount_percentage: 0,
    }
  });

  const watchIsBestDeal = watch("is_best_deal");

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setCreatingTag(true);
    const created = await createProductTag(name);
    setCreatingTag(false);

    if (created) {
      setAllTags((prev) => [...prev, created]);
      setSelectedTagIds((prev) => new Set(prev).add(created.id));
      setNewTagName("");
    }
  };

  useEffect(() => {
    setMounted(true);
    const loadProduct = async () => {
      const { product: data, allTags, selectedTagIds } = await fetchAdminProductById(params.id as string);
      setAllTags(allTags);
      setCategories(await fetchCategoryOptions());

      try {
        setProductOrders(await fetchProductOrders(params.id as string));
      } catch {
        setProductOrders([]);
      } finally {
        setLoadingOrders(false);
      }

      try {
        setRevenueData(await fetchProductRevenueTrend(params.id as string));
      } catch {
        setRevenueData([]);
      } finally {
        setLoadingRevenue(false);
      }

      if (data) {
        setProduct(data);
        setImageUrls(data.image_urls?.join(", ") || "");
        setSpecs(Array.isArray(data.specifications) ? data.specifications : []);
        setSelectedBrandId(data.brand_id || "");
        setSelectedCategoryId(data.category_id || "");
        setSelectedTagIds(new Set(selectedTagIds));
        setValue("warrantyInfo", data.warranty_info || "");
        setValue("shippingInfo", data.shipping_info || "");

        reset({
          name: data.name,
          description: data.description || "",
          price: data.price,
          old_price: data.old_price || 0,
          stock_quantity: data.stock_quantity || 0,
          status: data.status,
          is_featured: data.is_featured || false,
          is_best_deal: data.is_best_deal || false,
          deal_end_time: data.deal_end_time ? new Date(data.deal_end_time).toISOString().slice(0, 16) : "",
          is_flash_sale: data.is_flash_sale || false,
          is_best_seller: data.is_best_seller || false,
          is_top_rated: data.is_top_rated || false,
          discount_percentage: data.discount_percentage || 0,
        });
      }
    };

    loadProduct().catch((err) => setError(err instanceof Error ? err.message : "Failed to load product"));
  }, [params.id, reset, setValue]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageFilePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!product) return;
    setError(null);

    let finalImageUrls = product.image_urls || [];

    try {
      // Handle Image Mode: Upload vs URL
      if (imageInputMode === "upload" && imageFile) {
        setUploadingImage(true);
        const publicUrl = await uploadStoreImage(imageFile, "products");
        setUploadingImage(false);
        if (publicUrl) finalImageUrls = [publicUrl];
      } else if (imageInputMode === "url" && imageUrls) {
        finalImageUrls = imageUrls.split(',').map(u => u.trim()).filter(u => u);
      }

      await updateAdminProduct(product.id, {
        name: data.name,
        description: data.description || null,
        price: data.price,
        old_price: data.old_price || null,
        stock_quantity: data.stock_quantity,
        status: data.status,
        category_id: selectedCategoryId || null,
        brand_id: selectedBrandId || null,
        is_featured: data.is_featured,
        is_best_deal: data.is_best_deal,
        deal_end_time: data.deal_end_time ? new Date(data.deal_end_time).toISOString() : null,
        is_flash_sale: data.is_flash_sale,
        is_best_seller: data.is_best_seller,
        is_top_rated: data.is_top_rated,
        discount_percentage: data.discount_percentage,
        image_urls: finalImageUrls,
        warranty_info: (data as any).warrantyInfo || null,
        shipping_info: (data as any).shippingInfo || null,
        specifications: specs.filter((s) => s.key.trim()),
      });

      // Update tags
      await syncProductTags(product.id, Array.from(selectedTagIds));

      setProduct({ ...product, ...data, image_urls: finalImageUrls, category: categories.find(c => c.id === selectedCategoryId) ?? null });
      setImageFile(null);
      setImageFilePreview(null);
      toast.success("Product updated successfully!");
    } catch (err) {
      setUploadingImage(false);
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-yellow-500";
      case "Processing": return "text-blue-500";
      case "Shipping": return "text-gray-900";
      case "Delivered":
      case "Completed": return "text-green-500";
      case "Cancelled":
      case "Failed": return "text-red-500";
      case "Refund": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  const productColors = (() => {
    const raw = product?.specifications;
    const entries: [string, string][] = Array.isArray(raw) && raw.length > 0
      ? raw.map((s: any) => [String(s?.key || ""), String(s?.value || "")])
      : raw && typeof raw === "object"
        ? Object.entries(raw).map(([k, v]) => [k, String(v)])
        : [];
    const colorValues = entries.filter(([k]) => /color/i.test(k)).map(([, v]) => v.trim()).filter(Boolean);
    return colorValues.length > 0 ? colorValues.join(", ") : "—";
  })();

  const startTime = product?.created_at
    ? new Date(product.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const lifetimeSells = productOrders
    .filter((o) => !["Cancelled", "Refund", "Failed"].includes(o.status))
    .reduce((sum, o) => sum + o.qty, 0)
    .toLocaleString("en-IN");

  const peakIndex = revenueData.reduce(
    (best, d, i) => (d.value > (revenueData[best]?.value ?? -1) ? i : best),
    0
  );
  const peakValue = revenueData[peakIndex]?.value ?? 0;
  const hasRevenue = revenueData.some((d) => d.value > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar / Breadcrumb */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-xl">
          <Link href="/admin/products" className="text-brand-orange font-bold hover:underline">Products</Link>
          <span className="text-gray-400">/</span>
          <h1 className="font-bold text-[#1E293B]">{product?.name ?? "Product Details"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-600 flex items-center gap-2 cursor-pointer shadow-sm">
            {dateRange} <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-md shadow-sm border border-gray-100">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {METRICS.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{metric.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-bold flex items-center gap-1 ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
                {metric.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </span>
              <div className="h-10 w-20 mt-2">
                {mounted && <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metric.data.map((val, i) => ({ val, i }))}>
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke={metric.isPositive ? "#FF8C00" : "#EF4444"} 
                      strokeWidth={3} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Product Details Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden relative mb-4 border-4 border-gray-50">
            <Image src={fixImageUrl(product?.image_urls?.[0], product?.name)} alt={product?.name || "Product"} fill sizes="40px" className="object-cover" />
          </div>
          <h2 className="text-lg font-bold text-[#1E293B] mb-1 text-center">{product?.name ?? "Loading product..."}</h2>
          <p className="text-sm text-gray-500 mb-8">{product?.category?.name ?? "General"}</p>

          <div className="w-full space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1E293B]">In Stock</p>
                <p className="text-sm text-gray-500">{product?.stock_quantity ?? 0}</p>
              </div>
            </div>
            
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Colors</p>
                  <p className="text-sm text-gray-500">{productColors}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Start Time</p>
                  <p className="text-sm text-gray-500">{startTime}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">Life Time Sells</p>
                  <p className="text-sm text-gray-500">{lifetimeSells}</p>
                </div>
              </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
              <h3 className="font-bold text-[#1E293B]">Revenue</h3>
            </div>
            <button className="text-sm text-gray-500 hover:text-brand-orange flex items-center gap-1">
              View Details →
            </button>
          </div>
          <div className="h-72">
            {loadingRevenue ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading revenue...
              </div>
            ) : !hasRevenue ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No revenue data for this product yet.
              </div>
            ) : mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} interval="preserveStartEnd" />
                  <Tooltip
                    formatter={(value: any) => [`${revenueFormatter(Number(value))}`, "Revenue"]}
                    labelFormatter={(label: any) => `Day ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF8C00" 
                    strokeWidth={3} 
                    dot={(props: any) => {
                      const { cx, cy, index } = props;
                      if (typeof cx !== 'number' || typeof cy !== 'number') return <g key={index}></g>;
                      
                      if (index === peakIndex && peakValue > 0) {
                        const label = revenueFormatter(peakValue);
                        return (
                          <g key={index}>
                            <circle cx={cx} cy={cy} r={6} fill="#fff" stroke="#FF8C00" strokeWidth={3} />
                            <rect x={cx - 22} y={cy - 40} width={44} height={24} rx={4} fill="#FF8C00" />
                            <text x={cx} y={cy - 24} fill="#fff" fontSize={12} fontWeight="bold" textAnchor="middle">{label}</text>
                          </g>
                        );
                      }
                      return <g key={index}></g>;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-bold text-[#1E293B] text-lg">Edit Product</h3>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
        )}

        {!product ? (
          <p className="text-sm text-gray-500">Loading product editor...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product Name *</label>
              <Input {...register("name")} className="h-11" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Status</label>
              <select
                {...register("status")}
                className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Price *</label>
              <Input type="number" step="0.01" {...register("price")} className="h-11" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Old Price</label>
              <Input type="number" step="0.01" {...register("old_price")} className="h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Stock Quantity</label>
              <Input type="number" {...register("stock_quantity")} className="h-11" />
              {errors.stock_quantity && <p className="text-red-500 text-xs mt-1">{errors.stock_quantity.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Brand</label>
              <BrandInput value={selectedBrandId} onChange={setSelectedBrandId} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            {/* IMAGE SECTION */}
            <div className="md:col-span-2 border border-gray-100 rounded-xl p-6 bg-gray-50/50 mt-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-brand-orange" /> Product Image
                </h3>
                <div className="flex bg-gray-200 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("upload")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${imageInputMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${imageInputMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Link URL
                  </button>
                </div>
              </div>

              {imageInputMode === "upload" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 2MB</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                    </label>
                  </div>
                  {imageFilePreview && (
                    <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <img src={imageFilePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 truncate">{imageFile?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
                  <Input value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} className="h-11" />
                  {imageUrls && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                      {imageUrls.split(',').map((url, i) => url.trim() ? (
                        <img key={i} src={url.trim()} alt="Preview" className="w-16 h-16 object-cover rounded-md border border-gray-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : null)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <label className="text-sm font-bold text-gray-900 mb-3 block uppercase tracking-wide">Product Tags</label>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateTag(); } }}
                  placeholder="Create new tag e.g. Wireless, Gaming..."
                  className="h-10"
                />
                <Button type="button" onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()} className="h-10 bg-brand-orange hover:bg-orange-600 text-white font-medium shrink-0">
                  {creatingTag ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Tag"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 ? (
                  <p className="text-sm text-gray-500">No tags available. Create one above.</p>
                ) : (
                  allTags.map((tag) => {
                    const active = selectedTagIds.has(tag.id);
                    return (
                      <button key={tag.id} type="button" onClick={() => { const s = new Set(selectedTagIds); if (active) s.delete(tag.id); else s.add(tag.id); setSelectedTagIds(s); }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${active ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange'}`}>
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <label className="text-sm font-bold text-gray-900 mb-3 block uppercase tracking-wide">Additional Specifications</label>
              <div className="space-y-2">
                {specs.map((spec, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={spec.key} onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], key: e.target.value }; setSpecs(s); }} placeholder="Label (e.g. Warranty)" className="flex-1 h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                    <input value={spec.value} onChange={(e) => { const s = [...specs]; s[i] = { ...s[i], value: e.target.value }; setSpecs(s); }} placeholder="Value (e.g. 1 Year)" className="flex-1 h-10 border border-gray-200 rounded px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                    <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 px-2">x</button>
                  </div>
                ))}
                <button type="button" onClick={() => setSpecs([...specs, { key: "", value: "" }])} className="text-sm text-brand-orange hover:underline font-medium">+ Add Specification</button>
              </div>
            </div>

            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <label className="text-sm font-bold text-gray-900 mb-4 block uppercase tracking-wide">Promotional Flags</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("is_featured")} className="w-4 h-4 accent-brand-orange rounded" />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("is_best_deal")} className="w-4 h-4 accent-brand-orange rounded" />
                  <span className="text-sm font-medium text-gray-700">Best Deal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("is_flash_sale")} className="w-4 h-4 accent-brand-orange rounded" />
                  <span className="text-sm font-medium text-gray-700">Flash Sale</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("is_best_seller")} className="w-4 h-4 accent-brand-orange rounded" />
                  <span className="text-sm font-medium text-gray-700">Best Seller</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("is_top_rated")} className="w-4 h-4 accent-brand-orange rounded" />
                  <span className="text-sm font-medium text-gray-700">Top Rated</span>
                </label>
              </div>

              {watchIsBestDeal && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Deal End Time</label>
                    <Input type="datetime-local" {...register("deal_end_time")} className="h-11" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Discount Percentage (%)</label>
                    <Input type="number" {...register("discount_percentage")} className="h-11" />
                    {errors.discount_percentage && <p className="text-red-500 text-xs mt-1">{errors.discount_percentage.message}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Warranty Info</label>
                <input {...register("warrantyInfo")} placeholder="e.g. 1 Year Limited Warranty" className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Shipping Info</label>
                <input {...register("shippingInfo")} placeholder="e.g. Free 2-4 days courier shipping" className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</label>
              <textarea
                {...register("description")}
                className="min-h-28 w-full rounded-md border border-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting || uploadingImage} className="bg-brand-orange hover:bg-orange-600 font-bold h-11 px-8">
                {(isSubmitting || uploadingImage) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Product"}
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h3 className="font-bold text-[#1E293B] text-lg">Orders</h3>
          <button className="text-sm text-gray-500 flex items-center gap-1 hover:text-brand-orange">
            More →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium">
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Customers</th>
                <th className="px-6 py-4">Qty ▾</th>
                <th className="px-6 py-4">Date ▾</th>
                <th className="px-6 py-4">Revenue ▾</th>
                <th className="px-6 py-4">Net Profit ▾</th>
                <th className="px-6 py-4">Status ▾</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />Loading orders...
                  </td>
                </tr>
              ) : productOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    No orders found for this product yet.
                  </td>
                </tr>
              ) : (
                productOrders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden relative flex-shrink-0">
                        <Image src={fixImageUrl(order.avatar, order.customer)} alt={order.customer} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="font-medium text-[#1E293B]">{order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{order.qty}</td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 text-[#1E293B] font-medium">{order.revenue}</td>
                  <td className="px-6 py-4 text-gray-500">{order.profit}</td>
                  <td className="px-6 py-4 font-medium">
                    <span className={getStatusColor(order.status)}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-gray-400">
                      <button className="hover:text-brand-orange"><Edit2 className="w-4 h-4" /></button>
                      <button className="hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      <button className="hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
