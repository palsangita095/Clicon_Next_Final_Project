import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCategories,
  fetchAdminTags,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  deleteTag,
} from "@/api/api-function/adminCategories.function";

const CATEGORIES_KEY = ["admin-store", "categories"];
const TAGS_KEY = ["admin-store", "tags"];

export function useAdminCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => fetchAdminCategories(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => fetchAdminTags(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, imageUrl }: { name: string; imageUrl: string | null }) =>
      createCategory(name, imageUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, imageUrl }: { id: string; name: string; imageUrl: string | null }) =>
      updateCategory(id, name, imageUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useCreateAdminTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useDeleteAdminTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}
