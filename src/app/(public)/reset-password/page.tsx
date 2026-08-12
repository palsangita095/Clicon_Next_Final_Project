"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">User Account</span>
          <span className="text-gray-400">›</span>
          <Link href="/signin" className="hover:text-brand-orange">Sign In</Link>
          <span className="text-gray-400">›</span>
          <Link href="/forget-password" className="hover:text-brand-orange">Forget Password</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Reset Password</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center py-16 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] p-8">
          {success ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-3">Password Reset Successful</h1>
              <p className="text-sm text-gray-500 mb-6">Your password has been updated. Redirecting to sign in...</p>
              <Button asChild className="bg-brand-orange hover:bg-orange-600 text-white">
                <Link href="/signin">Go to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 text-center mb-3">Reset Password</h1>
              <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed px-2">
                Enter your new password below.
              </p>

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100 mb-4">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="8+ characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder=""
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide mt-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "RESET PASSWORD ➔"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
