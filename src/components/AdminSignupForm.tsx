"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase.config";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { adminSignupSchema } from "@/services/validation/admin-signup.validation";
import { getSiteUrl } from "@/lib/siteUrl";

type FormValues = yup.InferType<typeof adminSignupSchema>;

export default function AdminSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(adminSignupSchema),
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setMessage(null);

    setLoading(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
          role: "admin",
        },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    setLoading(false);

    if (signupError) {
      console.error("Admin signup error:", signupError);
      setError(signupError.message);
      return;
    }

    if (data?.session && data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: values.name,
          role: "admin",
          is_active: true,
        }, { onConflict: "id" });
      } catch {}
      setMessage("Admin account created. You can now sign in.");
    } else {
      setMessage("Admin account created. Verify the email, then sign in.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange">Home</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-brand-orange font-medium">Admin Sign Up</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Create Admin Account</h1>
            <p className="text-sm text-gray-500 mt-1">Use only during setup, then disable for production.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4">
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">{error}</div>}
            {message && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">{message}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <Input {...register("name")} disabled={loading} className="h-11 focus-visible:ring-brand-orange" />
              <p className="text-red-500 text-xs mt-1">{errors.name?.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <Input type="email" {...register("email")} disabled={loading} className="h-11 focus-visible:ring-brand-orange" />
              <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={loading}
                  className="h-11 pr-10 focus-visible:ring-brand-orange"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Admin"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
