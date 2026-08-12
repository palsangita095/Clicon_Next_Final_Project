"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Phone, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Browse our products, add items to your cart, and proceed to checkout. Fill in your billing details and choose a payment method to complete your order.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery (COD), Credit/Debit Cards via Stripe, and UPI. More payment options coming soon.",
  },
  {
    q: "How can I track my order?",
    a: 'Go to the Track Order page and enter your Order ID and billing email. You can also track orders from your Account Dashboard under "Order History".',
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day money-back guarantee for unused items in original packaging. Please contact our support team to initiate a return.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard delivery takes 2-4 business days. Express delivery is available for 1-2 business days. Shipping times may vary based on your location.",
  },
  {
    q: "How do I reset my password?",
    a: 'Go to the Forgot Password page, enter your email address, and we will send you a password reset link. Follow the instructions in the email to set a new password.',
  },
  {
    q: "Can I cancel my order?",
    a: "Orders can be cancelled while they are in 'Pending' status. Once processing has started, please contact support for assistance.",
  },
  {
    q: "How do I leave a product review?",
    a: 'You can leave a review for products you have purchased and received. Go to your Order History, click "View Details", and click "Leave a Rating" to submit your review.',
  },
];

export default function NeedHelpPage() {
  const settings = useStoreSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <Link href="/faq" className="hover:text-brand-orange">FAQ</Link>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">Need Help</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-brand-orange mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">How can we help you?</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Search our FAQs or browse the topics below to find what you need.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <div className="flex shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="flex items-center pl-4 bg-white">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 h-12 flex-1 focus-visible:ring-0 shadow-none rounded-none"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No results found for your search.</p>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 text-sm">{faq.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Still need help? Contact us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/customer-support" className="border border-gray-200 rounded-lg p-6 text-center hover:border-brand-orange transition-colors hover:shadow-sm">
              <MessageSquare className="w-8 h-8 text-brand-orange mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
              <p className="text-xs text-gray-500">Chat with our support team</p>
            </Link>
            <Link href={`mailto:${settings.contactEmail}`} className="border border-gray-200 rounded-lg p-6 text-center hover:border-brand-orange transition-colors hover:shadow-sm">
              <Mail className="w-8 h-8 text-brand-orange mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
              <p className="text-xs text-gray-500">{settings.contactEmail}</p>
            </Link>
            <Link href={`tel:${settings.contactPhone}`} className="border border-gray-200 rounded-lg p-6 text-center hover:border-brand-orange transition-colors hover:shadow-sm">
              <Phone className="w-8 h-8 text-brand-orange mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
              <p className="text-xs text-gray-500">{settings.contactPhone}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
