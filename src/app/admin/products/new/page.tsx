"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import BrandInput from "@/components/common/BrandInput";
import {
  createAdminProduct,
  createProductTag,
  fetchAllTags,
  fetchCategoryOptions,
  syncProductTags,
  uploadStoreImage,
} from "@/api/api-function/adminProducts.function";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").regex(/^[a-zA-Z0-9\s\-]+$/, "No special characters allowed (only letters, numbers, spaces, and hyphens)"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  warrantyInfo: z.string().optional(),
  shippingInfo: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  oldPrice: z.coerce.number().optional().or(z.literal(0)),
  stockQuantity: z.coerce.number().min(0, "Stock cannot be negative"),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]),
  isFeatured: z.boolean().default(false),
  isBestDeal: z.boolean().default(false),
  dealEndTime: z.string().optional(),
  isFlashSale: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isTopRated: z.boolean().default(false),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  

  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFilePreview, setImageFilePreview] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "active",
      stockQuantity: 0,
      isFeatured: false,
      isBestDeal: false,
      isFlashSale: false,
      isBestSeller: false,
      isTopRated: false,
      discountPercentage: 0,
    }
  });

  const watchName = watch("name");
  const watchCategoryId = watch("categoryId");
  const watchIsBestDeal = watch("isBestDeal");

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategoryOptions();
      setCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadTags = async () => {
      const data = await fetchAllTags();
      setAllTags(data);
    };
    loadTags();
  }, []);

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setCreatingTag(true);
    const data = await createProductTag(name);
    setCreatingTag(false);

    if (data) {
      setAllTags((prev) => [...prev, data]);
      setSelectedTagIds((prev) => new Set(prev).add(data.id));
      setNewTagName("");
    }
  };

  
  useEffect(() => {
    if (watchName) {
      setValue("slug", watchName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  }, [watchName, setValue]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageFilePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setError(null);
    setLoading(true);

    let finalImageUrls: string[] = [];

    try {
      
      if (imageInputMode === "upload" && imageFile) {
        setUploadingImage(true);
        const publicUrl = await uploadStoreImage(imageFile, "products");
        setUploadingImage(false);
        finalImageUrls = publicUrl ? [publicUrl] : [];
      } else if (imageInputMode === "url" && imageUrls) {
        finalImageUrls = imageUrls.split(',').map(u => u.trim()).filter(u => u);
      }

      const newProduct = await createAdminProduct({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        old_price: data.oldPrice || null,
        stock_quantity: data.stockQuantity || 0,
        category_id: data.categoryId || null,
        brand_id: selectedBrandId || null,
        status: data.status,
        is_featured: data.isFeatured,
        is_best_deal: data.isBestDeal,
        deal_end_time: data.dealEndTime ? new Date(data.dealEndTime).toISOString() : null,
        is_flash_sale: data.isFlashSale,
        is_best_seller: data.isBestSeller,
        is_top_rated: data.isTopRated,
        discount_percentage: data.discountPercentage || 0,
        warranty_info: data.warrantyInfo || null,
        shipping_info: data.shippingInfo || null,
        rating: null,
        image_urls: finalImageUrls,
      });

      const newProductId = newProduct?.id;
      if (newProductId && selectedTagIds.size > 0) {
        await syncProductTags(newProductId, Array.from(selectedTagIds));
      }
      router.push('/admin/products');
    } catch (err) {
      setUploadingImage(false);
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-gray-400 hover:text-brand-orange">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#1E293B]">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Name *</label>
            <Input {...register("name")} placeholder="e.g. Wireless Headphones" className="h-11" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Slug *</label>
            <Input {...register("slug")} placeholder="auto-generated" className="h-11 text-gray-500 bg-gray-50" readOnly />
            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
            placeholder="Product description..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Warranty Info</label>
            <Input {...register("warrantyInfo")} placeholder="e.g. 1 Year Limited Warranty" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Shipping Info</label>
            <Input {...register("shippingInfo")} placeholder="e.g. Free 2-4 days courier shipping" className="h-11" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price ($) *</label>
            <Input type="number" step="0.01" {...register("price")} placeholder="0.00" className="h-11" />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Old Price ($)</label>
            <Input type="number" step="0.01" {...register("oldPrice")} placeholder="0.00" className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
            <Input type="number" {...register("stockQuantity")} className="h-11" />
            {errors.stockQuantity && <p className="text-red-500 text-xs mt-1">{errors.stockQuantity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              {...register("categoryId")}
              className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Brand</label>
            <BrandInput value={selectedBrandId} onChange={setSelectedBrandId} categoryId={watchCategoryId} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              {...register("status")}
              className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        
        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/50 space-y-4">
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
                    <p className="text-xs text-gray-500">{(imageFile?.size || 0) / 1024 > 1024 ? `${((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB` : `${((imageFile?.size || 0) / 1024).toFixed(1)} KB`}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Image URLs (comma separated)</label>
              <Input value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" className="h-11" />
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

        
        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/50 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Product Tags</h3>
          <div className="flex flex-col sm:flex-row gap-2">
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
          {allTags.length === 0 ? (
            <p className="text-sm text-gray-500">No tags available. Create one above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const active = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => { const s = new Set(selectedTagIds); if (active) s.delete(tag.id); else s.add(tag.id); setSelectedTagIds(s); }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${active ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange'}`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-b border-gray-100 py-4 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Promotional Flags & Display Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 accent-brand-orange rounded" />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isBestDeal")} className="w-4 h-4 accent-brand-orange rounded" />
              <span className="text-sm font-medium text-gray-700">Best Deal</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isFlashSale")} className="w-4 h-4 accent-brand-orange rounded" />
              <span className="text-sm font-medium text-gray-700">Flash Sale</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isBestSeller")} className="w-4 h-4 accent-brand-orange rounded" />
              <span className="text-sm font-medium text-gray-700">Best Seller</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register("isTopRated")} className="w-4 h-4 accent-brand-orange rounded" />
              <span className="text-sm font-medium text-gray-700">Top Rated</span>
            </label>
          </div>

          {watchIsBestDeal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Deal End Time</label>
                <Input type="datetime-local" {...register("dealEndTime")} className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Discount Percentage (%)</label>
                <Input type="number" {...register("discountPercentage")} className="h-11" placeholder="e.g. 20" />
                {errors.discountPercentage && <p className="text-red-500 text-xs mt-1">{errors.discountPercentage.message}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
          <Link href="/admin/products">
            <Button type="button" variant="ghost" className="h-11 px-6 font-bold">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading || uploadingImage} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-11 px-8">
            {(loading || uploadingImage) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
