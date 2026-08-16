"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getSiteUrl } from "@/lib/siteUrl";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${getSiteUrl()}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
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
          <span className="text-brand-orange font-medium">Forget Password</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center py-16 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-3">Check Your Email</h1>
              <p className="text-sm text-gray-500 mb-6">
                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <Button onClick={() => { setSent(false); setEmail(""); }} variant="outline" className="h-11">
                Send Again
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 text-center mb-3">Forget Password</h1>
              <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed px-4">
                Enter the email address associated with your Clicon account.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 focus-visible:ring-brand-orange"
                    onKeyDown={(e) => e.key === "Enter" && handleSendReset()}
                  />
                </div>

                <Button
                  onClick={handleSendReset}
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SEND RESET LINK ➔"}
                </Button>
              </div>

              <div className="text-sm text-gray-500 space-y-1.5 mb-6">
                <div>
                  Already have account? <Link href="/signin" className="text-blue-500 hover:underline">Sign In</Link>
                </div>
                <div>
                  Don't have account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">
                You may contact <Link href="/customer-support" className="text-brand-orange hover:underline font-medium">Customer Service</Link> for help restoring access to your account.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
