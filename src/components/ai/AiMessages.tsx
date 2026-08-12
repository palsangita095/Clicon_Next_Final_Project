"use client";

import { useEffect, useMemo, useRef } from "react";

import AiMessage from "./AiMessage";
import UserMessage from "./UserMessage";
import TypingIndicator from "./TypingIndicator";
import { useAiChatStore } from "@/store/useAiChatStore";
import SuggestedPrompts from "./SuggestedPrompt";

const AiMessages = () => {
  const { messages, isTyping } = useAiChatStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Show suggestions only
   * when user hasn't sent
   * any message yet.
   */
  const showSuggestions = useMemo(() => {
    return !messages.some((message) => message.role === "user");
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5">
        {/* Welcome Section */}
        {showSuggestions && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                👋 Welcome to Clicon AI
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Your AI-powered shopping assistant for order tracking, product
                discovery, store policies, and support.
              </p>
            </div>

            <SuggestedPrompts />
          </div>
        )}

        {/* Messages */}
        <div className="space-y-5">
          {messages.map((message) =>
            message.role === "assistant" ? (
              <AiMessage key={message.id} content={message.content} />
            ) : (
              <UserMessage key={message.id} content={message.content} />
            ),
          )}

          {isTyping && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default AiMessages;
