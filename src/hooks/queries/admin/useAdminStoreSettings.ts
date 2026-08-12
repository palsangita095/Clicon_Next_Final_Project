import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStoreSettings,
  saveStoreSettings,
  uploadLogo,
} from "@/api/api-function/adminSettings.function";

export function useStoreSettings() {
  return useQuery({
    queryKey: ["admin-store", "settings"],
    queryFn: () => fetchStoreSettings(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveStoreSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Record<string, unknown>) => saveStoreSettings(settings),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-store", "settings"] }),
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-store", "settings"] }),
  });
}