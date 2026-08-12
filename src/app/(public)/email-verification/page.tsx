"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EmailVerificationPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <Link href="/signup" className="hover:text-brand-orange">Sign Up</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Email Verification</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center py-16 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-[420px] p-8">
          
          <h1 className="text-xl font-semibold text-gray-900 text-center mb-3">Verify Your Email Address</h1>
          
          <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed px-4">
            Nam ultricies lectus a risus blandit elementum. Quisque arcu arcu, tristique a eu in diam.
          </p>

          <div className="space-y-6 mb-2">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Verification Code</label>
                <button type="button" className="text-sm text-blue-500 hover:underline">
                  Resend Code
                </button>
              </div>
              <Input type="text" placeholder="" className="h-11 focus-visible:ring-brand-orange tracking-widest text-center text-lg" />
            </div>
            
            <Button className="w-full bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 uppercase tracking-wide">
              VERIFY ME ➔
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
