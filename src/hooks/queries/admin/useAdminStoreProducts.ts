import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminProductsWithTags,
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  syncProductTags,
  removeProductTag,
  createProductTag,
  uploadStoreImage,
  AdminProductPayload,
} from "@/api/api-function/adminProducts.function";

const PRODUCTS_KEY = ["admin-store", "products"];

export function useAdminProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => fetchAdminProductsWithTags(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminProductById(id: string) {
  return useQuery({
    queryKey: ["admin-store", "product", id],
    queryFn: () => fetchAdminProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminProductPayload) => createAdminProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminProductPayload> }) =>
      updateAdminProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useSyncProductTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, tagIds }: { productId: string; tagIds: string[] }) =>
      syncProductTags(productId, tagIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-store", "products"] }),
  });
}

export function useRemoveProductTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, tagId }: { productId: string; tagId: string }) =>
      removeProductTag(productId, tagId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-store", "products"] }),
  });
}

export function useCreateProductTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createProductTag(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-store", "tags"] }),
  });
}

export function useUploadStoreImage() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadStoreImage(file, folder),
  });
}
