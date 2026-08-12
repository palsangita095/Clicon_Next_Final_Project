import { create } from "zustand";

import {
  AiLanguage,
  ChatConversation,
  ChatMessage,
} from "@/types/interface/ai.interface";
import { AI_PROMPTS } from "@/constants/ai-prompts";

interface AiChatStore {
  // Window
  isOpen: boolean;

  // Language
  language: AiLanguage;

  // Messages
  messages: ChatMessage[];

  // Conversation
  conversationId: string | null;

  conversations: ChatConversation[];

  // States
  isTyping: boolean;
  isLoading: boolean;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;

  setLanguage: (language: AiLanguage) => void;

  addMessage: (message: ChatMessage) => void;

  setMessages: (messages: ChatMessage[]) => void;

  clearMessages: () => void;

  setTyping: (value: boolean) => void;

  setLoading: (value: boolean) => void;

  startNewChat: () => void;
  currentPrompt: number;

  nextPrompt: () => void;

  previousPrompt: () => void;

  setCurrentPrompt: (index: number) => void;
}

export const useAiChatStore = create<AiChatStore>((set) => ({
  // Window
  isOpen: false,

  // Language
  language: "en",
  currentPrompt: 0,

  // Messages
  messages: [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "👋 Hello! I'm Clicon AI. How can I help you today?",
      createdAt: new Date().toISOString(),
    },
  ],

  // Conversation
  conversationId: null,

  conversations: [],

  // States
  isTyping: false,
  isLoading: false,

  // Window Actions
  open: () =>
    set({
      isOpen: true,
    }),

  close: () =>
    set({
      isOpen: false,
    }),

  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),

  // Language
  setLanguage: (language) =>
    set({
      language,
    }),

  // Messages
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) =>
    set({
      messages,
    }),

  clearMessages: () =>
    set({
      messages: [],
    }),

  // States
  setTyping: (value) =>
    set({
      isTyping: value,
    }),

  setLoading: (value) =>
    set({
      isLoading: value,
    }),

  // New Chat
  startNewChat: () =>
    set({
      conversationId: null,

      messages: [
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "👋 Hello! I'm Clicon AI. How can I help you today?",
          createdAt: new Date().toISOString(),
        },
      ],
    }),
  setCurrentPrompt: (index) =>
    set({
      currentPrompt: index,
    }),

  nextPrompt: () =>
    set((state) => ({
      currentPrompt:
        state.currentPrompt === AI_PROMPTS.length - 1
          ? 0
          : state.currentPrompt + 1,
    })),

  previousPrompt: () =>
    set((state) => ({
      currentPrompt:
        state.currentPrompt === 0
          ? AI_PROMPTS.length - 1
          : state.currentPrompt - 1,
    })),
}));
