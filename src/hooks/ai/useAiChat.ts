"use client";

import { generateAIResponseFns } from "@/api/api-function/ai.function";
import { useAiChatStore } from "@/store/useAiChatStore";

export const useAiChat = () => {
  const { language, messages, addMessage, setTyping, setLoading, isLoading } =
    useAiChatStore();

  const sendMessage = async (message: string) => {
    const text = message.trim();

    if (!text || isLoading) return;

    // Add user message
    addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    });

    setLoading(true);
    setTyping(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await generateAIResponseFns({
        message: text,
        language,
        history,
      });

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          response.data ??
          response.message ??
          "Sorry, I couldn't generate a response.",
        createdAt: new Date().toISOString(),
      });
    } catch {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
  };
};