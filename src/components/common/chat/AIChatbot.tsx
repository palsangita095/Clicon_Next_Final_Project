"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Send, X, Bot, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_ACTIONS = [
  "Track my order",
  "Find a product",
  "Return policy",
  "Talk to support",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey there! I'm Clicon AI. Ask me anything about your orders, products, or store policies." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: content.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          history: updated.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.data }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: json.message || "Sorry, I couldn't process that." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-orange to-orange-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center group"
          aria-label="Open AI Chatbot"
        >
          <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white shadow-sm" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-orange-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Clicon AI</p>
              <p className="text-xs text-green-600 font-medium">Powered by AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-orange text-white rounded-br-md"
                      : "bg-gray-50 text-gray-800 rounded-bl-md border border-gray-100"
                  }`}
                >
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 text-sm border border-gray-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-5 py-3 border-t border-gray-50 shrink-0">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100 focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none py-1.5"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(\[.*?\]\(.*?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const url = linkMatch[2];
          const isExternal = url.startsWith("http");
          if (isExternal) {
            return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-brand-orange font-medium underline underline-offset-2 hover:text-orange-700">{linkMatch[1]}</a>;
          }
          return <Link key={i} href={url} className="text-brand-orange font-medium underline underline-offset-2 hover:text-orange-700">{linkMatch[1]}</Link>;
        }
        return <span key={i}>{renderInline(part)}</span>;
      })}
    </>
  );
}

function renderInline(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return <h3 key={i} className="text-sm font-bold text-gray-900 mt-3 mb-1">{line.slice(3)}</h3>;
    }
    if (line.startsWith("### ")) {
      return <h4 key={i} className="text-sm font-semibold text-gray-800 mt-2 mb-1">{line.slice(4)}</h4>;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={i} className="text-sm text-gray-700 ml-4 list-disc">{renderBold(line.slice(2))}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      return <li key={i} className="text-sm text-gray-700 ml-4 list-decimal">{renderBold(line.replace(/^\d+\.\s/, ""))}</li>;
    }
    if (line.trim() === "") {
      return <div key={i} className="h-1" />;
    }
    return <p key={i} className="text-sm text-gray-800 my-0.5">{renderBold(line)}</p>;
  });
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
