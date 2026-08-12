"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.config";
import { getDashboardPath, isAllowedRedirect } from "@/lib/auth-routing";
import { loginSchema } from "@/services/validation/login.validation";

type FormValues = yup.InferType<typeof loginSchema>;

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('redirectTo') || '/account';

  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const initialError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    initialError === "auth-callback-failed"
      ? "Authentication failed. Please try again."
      : initialError === "auth-unavailable"
        ? "Authentication is temporarily unavailable. Please check your Supabase connection and try again."
        : null,
  );
  const isVerified = searchParams.get('verified') === 'true';

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(loginSchema),
    mode: "onTouched",
  });

  const formatAuthError = (message: string) => {
    if (message.toLowerCase().includes("email not confirmed")) {
      return "Your account was created, but Supabase has not confirmed this email yet. If the verification email does not arrive, disable Confirm email in Supabase Auth settings for development or configure SMTP email delivery.";
    }
    if (message.toLowerCase().includes("rate limit exceeded") || message.toLowerCase().includes("over_email_send_rate_limit") || message.toLowerCase().includes("too many requests")) {
      return "Too many verification emails were requested from this browser recently. Please wait about an hour and try again, or raise the email rate limit / disable email confirmation in your Supabase Auth settings for development.";
    }

    return message;
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setNotice(null);

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      console.error("Signin error:", error);
      setError(formatAuthError(error.message));
      setLoading(false);
    } else {
      let { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active, account_status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile) {
        const fallbackName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Customer";
        
        const fallbackRole = "customer";
        const { data: createdProfile } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: fallbackName,
            role: fallbackRole,
            is_active: true,
          })
          .select("role, is_active, account_status")
          .single();

        profile = createdProfile;
      }

      const accountStatus = profile?.account_status || (profile?.is_active === false ? "suspended" : "active");
      if (accountStatus === "banned") {
        await supabase.auth.signOut();
        setError("Your account has been banned. Please contact support.");
        setLoading(false);
        return;
      }
      if (accountStatus === "suspended") {
        await supabase.auth.signOut();
        setError("Your account has been suspended. Please contact support.");
        setLoading(false);
        return;
      }

      await supabase
        .from("profiles")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id);

      const role = profile?.role ?? "customer";
      const destination = isAllowedRedirect(next, role)
        ? next
        : getDashboardPath(role);

      router.push(destination);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
      },
    });
  }

  const handleResendVerification = async () => {
    if (!getValues("email")) {
      setError("Enter your email address first, then resend the verification email.");
      return;
    }

    setError(null);
    setNotice(null);
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: getValues("email"),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setResending(false);

    if (error) {
      console.error("Resend error:", error);
      setError(formatAuthError(error.message));
    } else {
      setNotice(`Verification email sent again to ${getValues("email")}.`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
     
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">User Account</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Sign In</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] overflow-hidden">
          
          
          <div className="flex border-b border-gray-100">
            <div className="flex-1 text-center py-4 border-b-2 border-brand-orange text-gray-900 font-semibold cursor-pointer">
              Sign In
            </div>
            <Link href="/signup" className="flex-1 text-center py-4 text-gray-500 font-medium hover:text-gray-900 transition-colors cursor-pointer">
              Sign Up
            </Link>
          </div>

          <div className="p-8 space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {isVerified && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Your email has been verified successfully! Please sign in to continue.
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">
                  {error}
                  {error.toLowerCase().includes("confirmed") && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="mt-2 block font-semibold text-red-700 underline underline-offset-2 disabled:opacity-60"
                    >
                      {resending ? "Sending..." : "Resend verification email"}
                    </button>
                  )}
                </div>
              )}
              {notice && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
                  {notice}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <Input 
                  type="email" 
                  {...register("email")}
                  disabled={loading}
                  className="h-11 focus-visible:ring-brand-orange" 
                />
                <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forget-password" className="text-sm text-blue-500 hover:underline">
                    Forget Password
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    {...register("password")}
                    disabled={loading}
                    className="h-11 pr-10 focus-visible:ring-brand-orange" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN ➔"}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => handleOAuth('google')} variant="outline" className="w-full h-11 font-medium text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Login with Google
              </Button>
              <Button onClick={() => handleOAuth('apple')} variant="outline" className="w-full h-11 font-medium text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.84 3.79-.68 1.64.19 2.87.84 3.61 1.93-3.14 1.83-2.65 5.96.22 7.15-.65 1.64-1.52 3.09-2.7 3.77zm-3.52-13.82c.74-.95 1.25-2.27 1.12-3.59-1.12.05-2.52.79-3.32 1.77-.66.8-1.28 2.15-1.12 3.44 1.25.1 2.58-.67 3.32-1.62z"/>
                </svg>
                Login with Apple
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}
