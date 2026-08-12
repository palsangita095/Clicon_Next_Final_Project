"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase.config";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const useAvatarUpload = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectAndUpload = async (file: File): Promise<string | null> => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return null;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 2MB.");
      return null;
    }

   
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `pending/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setError(null);
  };

  return { preview, uploading, error, selectAndUpload, reset };
};
