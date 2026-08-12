"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { AI_PROMPTS } from "@/constants/ai-prompts";
import { useAiChatStore } from "@/store/useAiChatStore";

import PromptCard from "./PromptCard";
import { useAiChat } from "@/hooks/ai/useAiChat";

const SuggestedPrompts = () => {
 const { currentPrompt, nextPrompt, previousPrompt } = useAiChatStore();

 const { sendMessage, isLoading } = useAiChat(); // * new 

  const prompt = AI_PROMPTS[currentPrompt];

  // Auto slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextPrompt();
    }, 4000);

    return () => clearInterval(interval);
  }, [nextPrompt]);
  
  const handleTry = async () => {
    await sendMessage(prompt.prompt);
  };

  // const handleTry = () => {
  //   addMessage({
  //     id: crypto.randomUUID(),
  //     role: "user",
  //     content: prompt.prompt,
  //     createdAt: new Date().toISOString(),
  //   });

  //   // Gemini integration will come later
  // };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={previousPrompt}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 space-y-2">
          <Progress
            value={((currentPrompt + 1) / AI_PROMPTS.length) * 100}
            className="h-2"
          />

          <p className="text-center text-xs text-muted-foreground">
            {currentPrompt + 1} of {AI_PROMPTS.length}
          </p>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={nextPrompt}
          className="rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <PromptCard key={prompt.id} prompt={prompt} onTry={handleTry} />
      </AnimatePresence>
    </div>
  );
};

export default SuggestedPrompts;
