"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface StoreSettings {
  storeName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  addressRegion: string;
  googlePlayUrl: string;
  appStoreUrl: string;
  themeColor: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  stripeEnabled: boolean;
  paypalEnabled: boolean;
}

const DEFAULTS: StoreSettings = {
  storeName: "Clicon",
  logoUrl: "",
  contactEmail: "support@clicon.com",
  contactPhone: "+1 555 0199",
  addressLine: "4517 Washington Ave.",
  addressRegion: "Manchester, Kentucky 39495",
  googlePlayUrl: "#",
  appStoreUrl: "#",
  themeColor: "#FA8232",
  taxRate: 10,
  shippingFee: 29,
  freeShippingThreshold: 500,
  codEnabled: true,
  stripeEnabled: true,
  paypalEnabled: false,
};

let cachedSettings: StoreSettings | null = null;
let cachedPromise: Promise<StoreSettings> | null = null;

async function fetchSettings(): Promise<StoreSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "storefront")
    .maybeSingle();

  if (data?.value) {
    const stored = data.value as Partial<StoreSettings>;
    if (stored.addressLine === undefined && stored.addressRegion === undefined) {
      stored.addressLine = DEFAULTS.addressLine;
      stored.addressRegion = DEFAULTS.addressRegion;
    }
    if (stored.googlePlayUrl === undefined) stored.googlePlayUrl = DEFAULTS.googlePlayUrl;
    if (stored.appStoreUrl === undefined) stored.appStoreUrl = DEFAULTS.appStoreUrl;
    return { ...DEFAULTS, ...stored };
  }
  return DEFAULTS;
}

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      return;
    }

    if (!cachedPromise) {
      cachedPromise = fetchSettings().catch((err) => {
        console.error("Failed to load store settings:", err);
        cachedSettings = null;
        cachedPromise = null;
        return DEFAULTS;
      });
    }

    cachedPromise.then((result) => {
      cachedSettings = result;
      setSettings(result);
    });
  }, []);

  return settings;
}
