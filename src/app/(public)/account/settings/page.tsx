"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

const NAME_PATTERN = /^[A-Za-zÀ-ÿ\s\-']+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_PHONE_PATTERN = /^\d{10}$/;
const E164_PHONE_PATTERN = /^\+[1-9]\d{1,14}$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const UK_POSTAL_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
const CANADA_POSTAL_PATTERN = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
const INDIA_PIN_PATTERN = /^\d{6}$/;
const GLOBAL_POSTAL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,18}[A-Za-z0-9]$/;

function isValidPostalCode(value: string, countryValue: string) {
  const postalCode = value.trim();
  const country = countryValue.trim().toLowerCase();

  if (!postalCode) return false;
  if (GLOBAL_POSTAL_PATTERN.test(postalCode)) return true;
  if (country === "united states") return US_ZIP_PATTERN.test(postalCode);
  if (country === "united kingdom" || country === "uk") return UK_POSTAL_PATTERN.test(postalCode);
  if (country === "canada") return CANADA_POSTAL_PATTERN.test(postalCode);
  if (country === "india") return INDIA_PIN_PATTERN.test(postalCode);
  return false;
}

const EMPTY_ADDRESS = {
  company: "",
  address: "",
  country: "United States",
  region: "",
  city: "",
  zipCode: "",
};

export default function AccountSettingsPage() {
  const router = useRouter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United States",
    avatarUrl: "",
  });
  const [billingAddress, setBillingAddress] = useState(EMPTY_ADDRESS);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = (field: keyof typeof profile, value: string) => {
    setProfile({ ...profile, [field]: value });
    if (profileErrors[field]) setProfileErrors({ ...profileErrors, [field]: "" });
  };

  const updateBillingAddress = (field: keyof typeof billingAddress, value: string) => {
    setBillingAddress({ ...billingAddress, [field]: value });
    if (billingErrors[field]) setBillingErrors({ ...billingErrors, [field]: "" });
  };

  const validateProfile = () => {
    const nextErrors: Record<string, string> = {};

    if (!profile.firstName.trim()) nextErrors.firstName = "First name is required.";
    else if (!NAME_PATTERN.test(profile.firstName.trim())) nextErrors.firstName = "Only letters, spaces, hyphens, and apostrophes allowed.";

    if (!profile.lastName.trim()) nextErrors.lastName = "Last name is required.";
    else if (!NAME_PATTERN.test(profile.lastName.trim())) nextErrors.lastName = "Only letters, spaces, hyphens, and apostrophes allowed.";

    if (!profile.email.trim()) nextErrors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(profile.email.trim())) nextErrors.email = "Enter a valid email address.";

    const localPhone = profile.phone.replace(/\D/g, "");
    const compactPhone = profile.phone.replace(/[\s\-()]/g, "");
    if (!profile.phone.trim()) nextErrors.phone = "Phone number is required.";
    else if (!LOCAL_PHONE_PATTERN.test(localPhone) && !E164_PHONE_PATTERN.test(compactPhone)) nextErrors.phone = "Enter a 10 digit phone number or E.164 number like +14155552671.";

    if (!profile.country.trim()) nextErrors.country = "Country/Region is required.";

    setProfileErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateBillingAddress = () => {
    const nextErrors: Record<string, string> = {};

    if (!billingAddress.address.trim()) nextErrors.address = "Address is required.";
    if (!billingAddress.country.trim()) nextErrors.country = "Country is required.";
    if (!billingAddress.region.trim()) nextErrors.region = "Region/State is required.";
    if (!billingAddress.city.trim()) nextErrors.city = "City is required.";
    const postalCode = billingAddress.zipCode.trim();
    if (!postalCode) nextErrors.zipCode = "Zip Code is required.";
    else if (!isValidPostalCode(postalCode, billingAddress.country)) nextErrors.zipCode = "Enter a valid ZIP or postal code.";

    setBillingErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = await supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      setProfile({ ...profile, avatarUrl: urlData.publicUrl });
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const fullName = data?.full_name ?? user.email?.split("@")[0] ?? "";
      const [firstName, ...rest] = fullName.split(" ");
      const savedAddress = data?.billing_address && typeof data.billing_address === "object"
        ? data.billing_address as Record<string, unknown>
        : {};

      setProfileId(user.id);
      setProfile({
        firstName: firstName ?? "",
        lastName: rest.join(" "),
        email: data?.email ?? user.email ?? "",
        phone: data?.phone_number ?? "",
        country: data?.country ?? "United States",
        avatarUrl: data?.avatar_url ?? "",
      });
      setBillingAddress({
        company: String(savedAddress.company ?? ""),
        address: String(savedAddress.address ?? ""),
        country: String(savedAddress.country ?? "United States"),
        region: String(savedAddress.region ?? ""),
        city: String(savedAddress.city ?? ""),
        zipCode: String(savedAddress.zipCode ?? ""),
      });
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    if (!profileId) return;
    const profileValid = validateProfile();
    const billingValid = validateBillingAddress();

    if (!profileValid || !billingValid) {
      setMessage("Please fix the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const billingPayload = {
      company: billingAddress.company.trim(),
      address: billingAddress.address.trim(),
      country: billingAddress.country.trim(),
      region: billingAddress.region.trim(),
      city: billingAddress.city.trim(),
      zipCode: billingAddress.zipCode.trim(),
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim(),
        phone_number: profile.phone.trim(),
        avatar_url: profile.avatarUrl || null,
        country: profile.country.trim(),
        billing_address: billingPayload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    setSaving(false);
    setMessage(error ? error.message : "Account settings saved.");

    const redirectTo = new URLSearchParams(window.location.search).get("redirectTo");
    if (!error && redirectTo?.startsWith("/")) {
      router.push(redirectTo);
    }
  };

  const changePassword = async () => {
    setMessage(null);

    if (!password.next || password.next.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (password.next !== password.confirm) {
      setMessage("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: password.next });
    setSaving(false);

    setMessage(error ? error.message : "Password updated successfully.");
    if (!error) setPassword({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="space-y-8">
      {message && <div className="bg-white rounded-md border border-gray-100 p-4 text-sm text-gray-600 shadow-sm">{message}</div>}

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-8">ACCOUNT SETTING</h2>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input value={profile.firstName} onChange={(e) => updateProfile("firstName", e.target.value)} className={`h-11 border-gray-200 ${profileErrors.firstName ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                  {profileErrors.firstName && <p className="text-xs text-red-500">{profileErrors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input value={profile.lastName} onChange={(e) => updateProfile("lastName", e.target.value)} className={`h-11 border-gray-200 ${profileErrors.lastName ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                  {profileErrors.lastName && <p className="text-xs text-red-500">{profileErrors.lastName}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input type="email" value={profile.email} disabled className={`h-11 border-gray-200 ${profileErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                {profileErrors.email && <p className="text-xs text-red-500">{profileErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} type="tel" className={`h-11 border-gray-200 ${profileErrors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                {profileErrors.phone && <p className="text-xs text-red-500">{profileErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country/Region</label>
                <Input value={profile.country} onChange={(e) => updateProfile("country", e.target.value)} className={`h-11 border-gray-200 ${profileErrors.country ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
                {profileErrors.country && <p className="text-xs text-red-500">{profileErrors.country}</p>}
              </div>
              <Button onClick={saveProfile} disabled={saving} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
                SAVE CHANGES
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gray-100 relative overflow-hidden border-4 border-white shadow-lg">
              <Image src={fixImageUrl(profile.avatarUrl, "Profile")} alt="Profile" fill sizes="120px" className="object-cover" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-8">BILLING ADDRESS</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company Name (Optional)</label>
            <Input value={billingAddress.company} onChange={(e) => updateBillingAddress("company", e.target.value)} className="h-11 border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input value={billingAddress.address} onChange={(e) => updateBillingAddress("address", e.target.value)} className={`h-11 border-gray-200 ${billingErrors.address ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
            {billingErrors.address && <p className="text-xs text-red-500">{billingErrors.address}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Input value={billingAddress.country} onChange={(e) => updateBillingAddress("country", e.target.value)} className={`h-11 border-gray-200 ${billingErrors.country ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
              {billingErrors.country && <p className="text-xs text-red-500">{billingErrors.country}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Region/State</label>
              <Input value={billingAddress.region} onChange={(e) => updateBillingAddress("region", e.target.value)} className={`h-11 border-gray-200 ${billingErrors.region ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
              {billingErrors.region && <p className="text-xs text-red-500">{billingErrors.region}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <Input value={billingAddress.city} onChange={(e) => updateBillingAddress("city", e.target.value)} className={`h-11 border-gray-200 ${billingErrors.city ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
              {billingErrors.city && <p className="text-xs text-red-500">{billingErrors.city}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Zip Code</label>
            <Input value={billingAddress.zipCode} onChange={(e) => updateBillingAddress("zipCode", e.target.value)} className={`h-11 border-gray-200 ${billingErrors.zipCode ? "border-red-400 focus-visible:ring-red-400" : ""}`} />
            {billingErrors.zipCode && <p className="text-xs text-red-500">{billingErrors.zipCode}</p>}
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
            SAVE CHANGES
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-8">CHANGE PASSWORD</h2>
        <form onSubmit={(event) => { event.preventDefault(); changePassword(); }} className="space-y-6 max-w-lg">
          {[
            ["current", "Current Password", showCurrentPassword, setShowCurrentPassword],
            ["next", "New Password", showNewPassword, setShowNewPassword],
            ["confirm", "Confirm Password", showConfirmPassword, setShowConfirmPassword],
          ].map(([key, label, visible, setVisible]) => (
            <div key={String(key)} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{String(label)}</label>
              <div className="relative">
                <Input
                  type={visible ? "text" : "password"}
                  name={String(key)}
                  autoComplete={key === "current" ? "current-password" : "new-password"}
                  value={password[key as keyof typeof password]}
                  onChange={(e) => setPassword({ ...password, [key as string]: e.target.value })}
                  placeholder={String(label)}
                  className="h-11 border-gray-200 pr-12"
                />
                <button type="button" onClick={() => (setVisible as React.Dispatch<React.SetStateAction<boolean>>)((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-400">8 characters minimum. Use a mix of letters, numbers, and symbols.</div>
          <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
            CHANGE PASSWORD
          </Button>
        </form>
      </div>
    </div>
  );
}
