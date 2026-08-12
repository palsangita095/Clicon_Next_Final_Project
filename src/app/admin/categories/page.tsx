"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderTree, Plus, Search, Tag, Trash2, Upload, Link as LinkIcon, Loader2, Pencil } from "lucide-react";
import {
  useAdminCategories,
  useAdminTags,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
  useCreateAdminTag,
  useDeleteAdminTag,
} from "@/hooks/queries/admin/useAdminStoreCategories";
import { useUploadStoreImage } from "@/hooks/queries/admin/useAdminStoreProducts";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  product_count?: number;
}

interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [categoryInputMode, setCategoryInputMode] = useState<"upload" | "url">("url");
  const [categoryFile, setCategoryFile] = useState<File | null>(null);
  const [categoryFilePreview, setCategoryFilePreview] = useState<string | null>(null);
  const [tagName, setTagName] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id:string;name:string;type:'category'|'tag'} | null>(null);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState("");
  const [editCategoryInputMode, setEditCategoryInputMode] = useState<"upload" | "url">("url");
  const [editCategoryFile, setEditCategoryFile] = useState<File | null>(null);
  const [editCategoryFilePreview, setEditCategoryFilePreview] = useState<string | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useAdminCategories();
  const { data: tagsData, isLoading: tagsLoading } = useAdminTags();
  const createCategoryMutation = useCreateAdminCategory();
  const updateCategoryMutation = useUpdateAdminCategory();
  const deleteCategoryMutation = useDeleteAdminCategory();
  const createTagMutation = useCreateAdminTag();
  const deleteTagMutation = useDeleteAdminTag();
  const uploadStoreImageMutation = useUploadStoreImage();

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search],
  );

  useEffect(() => {
    if (categoriesLoading || tagsLoading) return;
    setCategories((categoriesData as Category[]) ?? []);
    setTags((tagsData as ProductTag[]) ?? []);
    setLoading(false);
  }, [categoriesData, tagsData, categoriesLoading, tagsLoading]);

  const createCategory = async () => {
    if (!categoryName.trim()) return;

    setError(null);
    let finalImage = categoryImage.trim() || null;
    if (categoryInputMode === "upload" && categoryFile) {
      try {
        finalImage = await uploadStoreImageMutation.mutateAsync({ file: categoryFile, folder: "categories" });
      } catch {
        // preserve original behavior: continue even if upload fails
      }
    }
    try {
      await createCategoryMutation.mutateAsync({ name: categoryName.trim(), imageUrl: finalImage });
      setCategoryName("");
      setCategoryImage("");
      setCategoryFile(null);
      setCategoryFilePreview(null);
      toast.success("Category created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const createTag = async () => {
    if (!tagName.trim()) return;

    setError(null);
    try {
      await createTagMutation.mutateAsync(tagName.trim());
      setTagName("");
      toast.success("Tag created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
      toast.error(err instanceof Error ? err.message : "Failed to create tag");
    }
  };

  const openEditCategory = (category: Category) => {
    setEditCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImage(category.image_url ?? "");
    setEditCategoryInputMode("url");
    setEditCategoryFile(null);
    setEditCategoryFilePreview(null);
    setError(null);
  };

  const updateCategory = async () => {
    if (!editCategory || !editCategoryName.trim()) return;

    setError(null);
    let finalImage = editCategoryImage.trim() || null;
    if (editCategoryInputMode === "upload" && editCategoryFile) {
      try {
        finalImage = await uploadStoreImageMutation.mutateAsync({ file: editCategoryFile, folder: "categories" });
      } catch {
        // preserve original behavior: continue even if upload fails
      }
    }
    try {
      await updateCategoryMutation.mutateAsync({ id: editCategory.id, name: editCategoryName.trim(), imageUrl: finalImage });
      setEditCategory(null);
      toast.success("Category updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
      toast.error(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const deleteCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    setDeleteConfirm({ id, name: category?.name || '', type: 'category' });
  };

  const deleteTag = async (id: string) => {
    const tag = tags.find(t => t.id === id);
    setDeleteConfirm({ id, name: tag?.name || '', type: 'tag' });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Categories & Tags</h1>
          <p className="text-sm text-gray-500 mt-1">Organize products for filters, search, and admin catalog control.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-50 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-brand-orange" />
              <h2 className="font-bold text-[#1E293B]">Product Categories</h2>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories..." className="pl-10 h-10 border-gray-200" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 font-medium bg-gray-50/50">
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500">Loading...</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500">No categories found.</td></tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded bg-gray-100 relative overflow-hidden flex-shrink-0">
                            {category.image_url ? (
                              <Image src={category.image_url} alt={category.name} fill sizes="40px" className="object-cover" />
                            ) : (
                              <FolderTree className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                            )}
                          </div>
                          <span className="font-medium text-[#1E293B]">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                      <td className="px-6 py-4 text-gray-500">{category.product_count ?? 0}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditCategory(category)} className="text-gray-400 hover:text-brand-orange" title="Edit category">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCategory(category.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1E293B] mb-4">Add Category</h2>
            <div className="space-y-3">
              <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" />
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button type="button" onClick={() => setCategoryInputMode("upload")} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${categoryInputMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}><Upload className="w-3 h-3 inline mr-1" /> Upload</button>
                <button type="button" onClick={() => setCategoryInputMode("url")} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${categoryInputMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}><LinkIcon className="w-3 h-3 inline mr-1" /> URL</button>
              </div>
              {categoryInputMode === "upload" ? (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <div className="flex flex-col items-center py-3"><Upload className="w-6 h-6 mb-1 text-gray-400" /><p className="text-xs text-gray-500">Click to upload</p></div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCategoryFile(f); setCategoryFilePreview(URL.createObjectURL(f)); } }} />
                  </label>
                  {categoryFilePreview && <img src={categoryFilePreview} alt="Preview" className="w-16 h-16 object-cover rounded mt-2 border" />}
                </div>
              ) : (
                <Input value={categoryImage} onChange={(event) => setCategoryImage(event.target.value)} placeholder="Image URL" />
              )}
              <Button onClick={createCategory} disabled={createCategoryMutation.isPending || uploadStoreImageMutation.isPending} className="w-full bg-brand-orange hover:bg-orange-600 font-bold">
                {(createCategoryMutation.isPending || uploadStoreImageMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Add Category
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1E293B] mb-4">Product Tags</h2>
            <div className="flex gap-2 mb-4">
              <Input value={tagName} onChange={(event) => setTagName(event.target.value)} placeholder="Tag name" />
              <Button onClick={createTag} disabled={createTagMutation.isPending} className="bg-brand-orange hover:bg-orange-600">
                {createTagMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags yet.</p>
              ) : (
                tags.map((tag) => (
                  <span key={tag.id} className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-brand-orange px-3 py-1 text-sm font-medium">
                    <Tag className="w-3 h-3" />
                    {tag.name}
                    <button onClick={() => deleteTag(tag.id)} className="hover:text-red-500">x</button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {editCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditCategory(null)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Category</h3>
            <div className="space-y-3">
              <Input value={editCategoryName} onChange={(event) => setEditCategoryName(event.target.value)} placeholder="Category name" />
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button type="button" onClick={() => setEditCategoryInputMode("upload")} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${editCategoryInputMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}><Upload className="w-3 h-3 inline mr-1" /> Upload</button>
                <button type="button" onClick={() => setEditCategoryInputMode("url")} className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${editCategoryInputMode === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}><LinkIcon className="w-3 h-3 inline mr-1" /> URL</button>
              </div>
              {editCategoryInputMode === "upload" ? (
                <div>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                    <div className="flex flex-col items-center py-3"><Upload className="w-6 h-6 mb-1 text-gray-400" /><p className="text-xs text-gray-500">Click to upload</p></div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setEditCategoryFile(f); setEditCategoryFilePreview(URL.createObjectURL(f)); } }} />
                  </label>
                  {(editCategoryFilePreview || editCategory.image_url) && <img src={editCategoryFilePreview ?? editCategory.image_url ?? ""} alt="Preview" className="w-16 h-16 object-cover rounded mt-2 border" />}
                </div>
              ) : (
                <Input value={editCategoryImage} onChange={(event) => setEditCategoryImage(event.target.value)} placeholder="Image URL" />
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditCategory(null)} className="h-10">Cancel</Button>
                <Button onClick={updateCategory} disabled={updateCategoryMutation.isPending || uploadStoreImageMutation.isPending} className="bg-brand-orange hover:bg-orange-600 text-white h-10 font-bold">
                  {(updateCategoryMutation.isPending || uploadStoreImageMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />} Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="h-10">Cancel</Button>
              <Button onClick={async () => {
                setError(null);
                try {
                  if (deleteConfirm.type === 'category') {
                    await deleteCategoryMutation.mutateAsync(deleteConfirm.id);
                    toast.success("Category deleted.");
                  } else {
                    await deleteTagMutation.mutateAsync(deleteConfirm.id);
                    toast.success("Tag deleted.");
                  }
                  setDeleteConfirm(null);
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "Failed to delete";
                  setError(msg);
                  toast.error(msg);
                }
              }} className="bg-red-500 hover:bg-red-600 text-white h-10 font-bold">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}