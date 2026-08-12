"use client";

import { useEffect } from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function ThemeApplier() {
  const settings = useStoreSettings();

  useEffect(() => {
    document.documentElement.style.setProperty("--brand-orange", settings.themeColor);
  }, [settings.themeColor]);

  useEffect(() => {
    if (settings.logoUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.logoUrl;
    }
  }, [settings.logoUrl]);

  return null;
}
