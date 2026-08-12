"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const faqs = [
  {
    question: "How long does delivery take?",
    answer: null,
  },
  {
    question: "What is your return and refund policy?",
    answer: (
      <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
        <p>
          We want you to be completely happy with your purchase. If an item is not what you expected, you can return it within 30 days of delivery for a full refund or exchange, as long as the product is in its original condition with all accessories and packaging.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Items must be returned in their original packaging.</li>
          <li>Refunds are processed within 5 to 7 business days after we receive the return.</li>
          <li>Damaged or defective items are replaced free of charge.</li>
          <li>Return shipping is free for orders above a minimum amount.</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Do you offer international shipping?",
    answer: null,
  },
  {
    question: "How do I track my order?",
    answer: null,
  },
  {
    question: "Are the products on your site genuine?",
    answer: null,
  },
];

export default function FaqPage() {
  const settings = useStoreSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Open second one by default

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-8 py-3 text-sm text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-400">Pages</span>
          <span className="text-gray-400">›</span>
          <span className="text-brand-orange font-medium">FAQ</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* FAQ Accordion */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className={`border rounded-md overflow-hidden ${isOpen ? 'border-brand-orange shadow-md' : 'border-gray-200'}`}>
                    <button
                      className={`w-full flex items-center justify-between p-5 text-left font-medium ${isOpen ? 'bg-brand-orange text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      {faq.question}
                      {isOpen ? (
                        <Minus className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                    
                    {isOpen && faq.answer && (
                      <div className="p-6 bg-white border-t border-gray-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Sidebar */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-[#FEF9E6] rounded-md p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Don&apos;t find your answer, Ask for support.</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Our support team is available 24/7 to help with orders, returns, and product questions. Send us a message and we will get back to you within a few hours.
              </p>
              
              <form className="space-y-4">
                <Input type="email" placeholder="Email address" className="bg-white border-white h-11" />
                <Input type="text" placeholder="Subject" className="bg-white border-white h-11" />
                <Textarea placeholder="Message (Optional)" className="bg-white border-white min-h-[120px] resize-none" />
                
                <Button className="bg-brand-orange hover:bg-orange-600 text-white font-bold h-12 px-8 uppercase tracking-wide">
                  SEND MESSAGE ➔
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
