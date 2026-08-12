"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.config";
import { getDashboardPath } from "@/lib/auth-routing";
import { customerSignupSchema } from "@/services/validation/customer-signup.validation";

type FormValues = yup.InferType<typeof customerSignupSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(customerSignupSchema),
    mode: "onTouched",
  });

  
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const formatAuthError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("email not confirmed")) {
      return "Your account was created, but Supabase has not confirmed this email yet. If the verification email does not arrive, disable Confirm email in Supabase Auth settings for development or configure SMTP email delivery.";
    }
    if (lower.includes("user already registered")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (lower.includes("fetch failed") || lower.includes("network")) {
      return "Unable to reach the authentication server. Check your internet connection or verify your Supabase credentials (URL and anon key) are correct in .env.";
    }
    if (lower.includes("rate limit exceeded") || lower.includes("over_email_send_rate_limit") || lower.includes("too many requests")) {
      return "Too many verification emails were requested from this browser recently. Please wait about an hour and try again, or raise the email rate limit / disable email confirmation in your Supabase Auth settings for development.";
    }

    return message;
  };

  const ensureProfile = async (userId: string, userEmail: string | undefined) => {
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: userEmail,
        full_name: getValues("name"),
        role: "customer",
        is_active: true,
      }, { onConflict: "id" });
      if (error) {
        if (error.code === "42501") {
          
        } else {
          console.error("Profile upsert fallback failed:", error);
        }
      }
    } catch (err) {
      console.error("Profile upsert threw:", err);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setNotice(null);

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
          role: "customer",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    setLoading(false);

    if (error) {
      console.error("Signup error:", error);
      setError(formatAuthError(error.message));
      return;
    }

    if (data?.session && data.user) {
      await ensureProfile(data.user.id, data.user.email);
      router.push(getDashboardPath("customer"));
    } else {
      setSuccess(true);
      setResendCooldown(60);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleResendVerification = async () => {
    if (!getValues("email")) {
      setError("Enter your email address first, then resend the verification email.");
      return;
    }
    if (resendCooldown > 0) return;

    setError(null);
    setNotice(null);
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: getValues("email"),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
    setResending(false);

    if (error) {
      console.error("Resend error:", error);
      setError(formatAuthError(error.message));
    } else {
      setNotice(`Verification email sent again to ${getValues("email")}.`);
      setResendCooldown(60);
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
          <span className="text-brand-orange font-medium">Sign Up</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] overflow-hidden">
          
          
          <div className="flex border-b border-gray-100">
            <Link href="/signin" className="flex-1 text-center py-4 text-gray-500 font-medium hover:text-gray-900 transition-colors cursor-pointer">
              Sign In
            </Link>
            <div className="flex-1 text-center py-4 border-b-2 border-brand-orange text-gray-900 font-semibold cursor-pointer">
              Sign Up
            </div>
          </div>

          <div className="p-8 space-y-4">
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-md text-center space-y-2">
                <h3 className="font-bold text-lg">Check your email</h3>
                <p className="text-sm">We&apos;ve sent a verification link to <strong>{getValues("email")}</strong>. Please click the link to confirm your account.</p>
                <p className="text-xs text-green-800">
                  If no email arrives, configure SMTP in Supabase Auth or disable email confirmation for local development.
                </p>
                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 text-left">
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="bg-white text-green-700 p-3 rounded-md text-sm border border-green-200">
                    {notice}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending || resendCooldown > 0}
                  variant="outline"
                  className="mt-3 border-green-300 text-green-800 hover:bg-green-100"
                >
                  {resending ? "Sending..." : resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend Verification Email"}
                </Button>
                <Button asChild className="mt-3 bg-brand-orange hover:bg-orange-600 text-white">
                  <Link href="/signin">Go to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <Input 
                    type="text" 
                    {...register("name")}
                    disabled={loading}
                    className="h-11 focus-visible:ring-brand-orange" 
                  />
                  <p className="text-red-500 text-xs mt-1">{errors.name?.message}</p>
                </div>
                
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
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="8+ characters" 
                      {...register("password")}
                      disabled={loading}
                      className="h-11 pr-10 focus-visible:ring-brand-orange text-sm placeholder:text-gray-400" 
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      {...register("confirmPassword")}
                      disabled={loading}
                      className="h-11 pr-10 focus-visible:ring-brand-orange text-sm" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword?.message}</p>
                </div>

                <label className="flex items-start gap-2 pt-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...register("agree")}
                    className="mt-1 rounded border-gray-300 text-brand-orange focus:ring-brand-orange w-4 h-4 flex-shrink-0" 
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    Are you agree to Clicon <Link href="#" className="text-blue-500 hover:underline">Terms of Condition</Link> and <Link href="#" className="text-blue-500 hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.agree && <p className="text-red-500 text-xs mt-1">{errors.agree.message}</p>}

                <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide mt-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN UP ➔"}
                </Button>
              </form>
            )}

            {!success && (
              <>
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <Button onClick={() => handleOAuth("google")} variant="outline" className="w-full h-11 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </Button>
                <Button onClick={() => handleOAuth("apple")} variant="outline" className="w-full h-11 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.5-.8 1.52.03 2.7.59 3.5 1.48-3.08 1.63-2.58 5.68.32 6.84-.71 1.84-1.57 3.73-2.4 4.65z"/>
                    <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.36-3.74 4.25z"/>
                  </svg>
                  Sign up with Apple
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
