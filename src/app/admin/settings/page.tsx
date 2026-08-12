"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Loader2, Palette, Save, Truck, Upload } from "lucide-react";
import { toast } from "sonner";
import { useStoreSettings, useSaveStoreSettings, useUploadLogo } from "@/hooks/queries/admin/useAdminStoreSettings";

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

const DEFAULT_SETTINGS: StoreSettings = {
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
  stripeEnabled: false,
  paypalEnabled: false,
};

function LogoUploadButton({ onUpload }: { onUpload: (url: string) => void }) {
  const { mutate: uploadLogo, isPending: uploading } = useUploadLogo();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadLogo(file, {
      onSuccess: (publicUrl) => {
        onUpload(publicUrl);
        toast.success('Logo uploaded successfully. Save settings to apply.');
      },
      onError: (error) => {
        if (error.message.includes('bucket')) {
          toast.error('Storage bucket "logos" does not exist. Create it in your Supabase dashboard under Storage > Create Bucket (set to public), then try again.');
          return;
        }
        toast.error(error.message);
      },
      onSettled: () => {
        if (fileRef.current) fileRef.current.value = '';
      },
    });
  };

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="shrink-0">
        <Upload className={`w-4 h-4 mr-1 ${uploading ? 'animate-spin' : ''}`} />
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: storeSettings, isLoading: storeSettingsLoading } = useStoreSettings();
  const { mutate: saveStoreSettings, isPending: isSaving } = useSaveStoreSettings();

  useEffect(() => {
    if (storeSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...(storeSettings as Partial<StoreSettings>) });
    }
    setLoading(storeSettingsLoading);
  }, [storeSettings, storeSettingsLoading]);

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = () => {
    setMessage(null);
    setError(null);

    saveStoreSettings(settings as unknown as Record<string, unknown>, {
      onSuccess: () => {
        setMessage("Settings saved successfully.");
      },
      onError: (err) => {
        setError(err instanceof Error && err.message ? err.message : "Failed to save settings. Please try again.");
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure payment, tax, shipping, branding, and contact details.</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving || loading} className="bg-brand-orange hover:bg-orange-600 font-bold">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      {message && <div className="bg-white border border-gray-100 rounded-xl p-4 text-sm text-gray-600">{message}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="w-5 h-5 text-brand-orange" />
              <h2 className="font-bold text-[#1E293B]">Website Branding</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Store Name</label>
                <Input value={settings.storeName} onChange={(event) => updateSetting("storeName", event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Theme Color</label>
                <div className="flex gap-2">
                  <Input value={settings.themeColor} onChange={(event) => updateSetting("themeColor", event.target.value)} placeholder="#FA8232" />
                  <input
                    type="color"
                    value={settings.themeColor}
                    onChange={(event) => updateSetting("themeColor", event.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200 p-0.5"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: settings.themeColor }} />
                  <span className="text-xs text-gray-400">Preview</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Logo</label>
                <div className="flex gap-2">
                  <Input value={settings.logoUrl} onChange={(event) => updateSetting("logoUrl", event.target.value)} placeholder="https://..." className="flex-1" />
                  <LogoUploadButton onUpload={(url) => updateSetting("logoUrl", url)} />
                </div>
                {settings.logoUrl && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <img src={settings.logoUrl} alt="Logo preview" className="w-12 h-12 object-contain rounded border border-gray-200 bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div className="text-xs text-gray-500 truncate flex-1">{settings.logoUrl}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-brand-orange" />
              <h2 className="font-bold text-[#1E293B]">Tax & Shipping</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tax Rate (%)</label>
                <Input type="number" value={settings.taxRate} onChange={(event) => updateSetting("taxRate", Number(event.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Shipping Fee (₹)</label>
                <Input type="number" value={settings.shippingFee} onChange={(event) => updateSetting("shippingFee", Number(event.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Free Shipping Above (₹)</label>
                <Input type="number" value={settings.freeShippingThreshold} onChange={(event) => updateSetting("freeShippingThreshold", Number(event.target.value))} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-brand-orange" />
              <h2 className="font-bold text-[#1E293B]">Payment Methods</h2>
            </div>
            <div className="space-y-4">
              {[
                ["codEnabled", "Cash on Delivery"],
                ["stripeEnabled", "Stripe"],
                ["paypalEnabled", "PayPal"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 text-sm font-medium text-gray-700">
                  {label}
                  <input
                    type="checkbox"
                    checked={Boolean(settings[key as keyof StoreSettings])}
                    onChange={(event) => updateSetting(key as keyof StoreSettings, event.target.checked as never)}
                    className="w-4 h-4 accent-brand-orange"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1E293B] mb-5">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Support Email</label>
                <Input value={settings.contactEmail} onChange={(event) => updateSetting("contactEmail", event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
                <Input value={settings.contactPhone} onChange={(event) => updateSetting("contactPhone", event.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address Line</label>
                <Input value={settings.addressLine} onChange={(event) => updateSetting("addressLine", event.target.value)} placeholder="4517 Washington Ave." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">City, State, ZIP</label>
                <Input value={settings.addressRegion} onChange={(event) => updateSetting("addressRegion", event.target.value)} placeholder="Manchester, Kentucky 39495" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Google Play URL</label>
                <Input value={settings.googlePlayUrl} onChange={(event) => updateSetting("googlePlayUrl", event.target.value)} placeholder="https://play.google.com/..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">App Store URL</label>
                <Input value={settings.appStoreUrl} onChange={(event) => updateSetting("appStoreUrl", event.target.value)} placeholder="https://apps.apple.com/..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
