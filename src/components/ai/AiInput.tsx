"use client";

import { useState } from "react";
import { Loader2, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAiChat } from "@/hooks/ai/useAiChat";

const AiInput = () => {
  const [message, setMessage] = useState("");

  const { sendMessage, isLoading } = useAiChat();

  const handleSend = async () => {
    const text = message.trim();

    if (!text) return;

    setMessage("");

    await sendMessage(text);
  };

  return (
    <div className="border-t border-white/10 bg-background/20 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Input
          value={message}
          placeholder="Ask Clicon AI..."
          disabled={isLoading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSend();
            }
          }}
          className="h-12 rounded-full border-white/10 bg-white/10 px-5 backdrop-blur-xl"
        />

        <Button
          size="icon"
          className="h-12 w-12 rounded-full"
          disabled={!message.trim() || isLoading}
          onClick={handleSend}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default AiInput;
