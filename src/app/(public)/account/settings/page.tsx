"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fixImageUrl } from "@/lib/imageFallback";

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  company: "",
  address: "",
  country: "United States",
  region: "",
  city: "",
  zipCode: "",
};

export default function AccountSettingsPage() {
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        ? { ...EMPTY_ADDRESS, ...data.billing_address }
        : EMPTY_ADDRESS;

      setProfileId(user.id);
      setProfile({
        firstName,
        lastName: rest.join(" "),
        email: data?.email ?? user.email ?? "",
        phone: data?.phone_number ?? "",
        country: data?.country ?? "United States",
        avatarUrl: data?.avatar_url ?? "",
      });
      setBillingAddress(savedAddress);
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    if (!profileId) return;

    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone_number: profile.phone,
        avatar_url: profile.avatarUrl || null,
        country: profile.country,
        billing_address: billingAddress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    setSaving(false);
    setMessage(error ? error.message : "Account settings saved.");
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
                  <Input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="h-11 border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="h-11 border-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input type="email" value={profile.email} disabled className="h-11 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} type="tel" className="h-11 border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country/Region</label>
                <Input value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="h-11 border-gray-200" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <Input value={billingAddress.firstName} onChange={(e) => setBillingAddress({ ...billingAddress, firstName: e.target.value })} className="h-11 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <Input value={billingAddress.lastName} onChange={(e) => setBillingAddress({ ...billingAddress, lastName: e.target.value })} className="h-11 border-gray-200" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Company Name (Optional)</label>
            <Input value={billingAddress.company} onChange={(e) => setBillingAddress({ ...billingAddress, company: e.target.value })} className="h-11 border-gray-200" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input value={billingAddress.address} onChange={(e) => setBillingAddress({ ...billingAddress, address: e.target.value })} className="h-11 border-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Input value={billingAddress.country} onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })} className="h-11 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Region/State</label>
              <Input value={billingAddress.region} onChange={(e) => setBillingAddress({ ...billingAddress, region: e.target.value })} className="h-11 border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <Input value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="h-11 border-gray-200" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Zip Code</label>
            <Input value={billingAddress.zipCode} onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })} className="h-11 border-gray-200" />
          </div>
          <Button onClick={saveProfile} disabled={saving} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
            SAVE CHANGES
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-8">CHANGE PASSWORD</h2>
        <div className="space-y-6 max-w-lg">
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
          <Button onClick={changePassword} disabled={saving} className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
            CHANGE PASSWORD
          </Button>
        </div>
      </div>
    </div>
  );
}
