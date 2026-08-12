"use client";

import { Bot, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAiChatStore } from "@/store/useAiChatStore";

import AiLanguageSelector from "./AiLanguageSelector";
import AiNewChatButton from "./AiNewChatButton";

const AiHeader = () => {
  const { close } = useAiChatStore();

  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Bot className="h-6 w-6" />
          </div>

          <div>
            <h2 className="font-semibold">Clicon AI</h2>

            <p className="text-xs text-muted-foreground">
              Shopping Assistant
            </p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={close}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
        <AiLanguageSelector />

        <AiNewChatButton />
      </div>
    </header>
  );
};

export default AiHeader;
