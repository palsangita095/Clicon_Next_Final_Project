export interface ChatMessage {
  id: string;

  role: "user" | "assistant";

  content: string;

  createdAt: string;
}

export type AiLanguage = "en" | "hi" | "bn" | "es" | "fr" | "de" | "ja" | "zh";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
}
export interface Prompt {
  id: number;

  icon: string;

  title: string;

  description: string;

  prompt: string;
}

export interface PromptCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  prompt: string;
}
