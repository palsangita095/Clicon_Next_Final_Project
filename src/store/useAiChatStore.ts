import { create } from "zustand";

import {
  AiLanguage,
  ChatConversation,
  ChatMessage,
} from "@/types/interface/ai.interface";
import { AI_PROMPTS } from "@/constants/ai-prompts";

interface AiChatStore {
  
  isOpen: boolean;

  
  language: AiLanguage;

 
  messages: ChatMessage[];

 
  conversationId: string | null;

  conversations: ChatConversation[];

  
  isTyping: boolean;
  isLoading: boolean;

  
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

  isOpen: false,

 
  language: "en",
  currentPrompt: 0,


  messages: [
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "👋 Hello! I'm Clicon AI. How can I help you today?",
      createdAt: new Date().toISOString(),
    },
  ],

  
  conversationId: null,

  conversations: [],

  
  isTyping: false,
  isLoading: false,

  
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


  setLanguage: (language) =>
    set({
      language,
    }),

  
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

 
  setTyping: (value) =>
    set({
      isTyping: value,
    }),

  setLoading: (value) =>
    set({
      isLoading: value,
    }),

  
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
