"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useAiChatStore } from "@/store/useAiChatStore";

const AiNewChatButton = () => {
  const { startNewChat } = useAiChatStore();

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={startNewChat}
      className="rounded-xl"
    >
      <Plus className="mr-2 h-4 w-4" />
      New Chat
    </Button>
  );
};

export default AiNewChatButton;
