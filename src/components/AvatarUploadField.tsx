"use client";

import { useRef } from "react";
import Image from "next/image";
import { Loader2, Camera, User } from "lucide-react";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

interface AvatarUploadFieldProps {
  onUploaded: (url: string) => void;
}

export const AvatarUploadField = ({ onUploaded }: AvatarUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { preview, uploading, error, selectAndUpload } = useAvatarUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await selectAndUpload(file);
    if (url) onUploaded(url);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted"
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar preview"
            fill
            className="object-cover"
          />
        ) : (
          <User className="h-8 w-8 text-muted-foreground" />
        )}
        <span className="absolute bottom-0 flex w-full items-center justify-center bg-black/50 py-1">
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          ) : (
            <Camera className="h-3 w-3 text-white" />
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
