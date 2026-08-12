"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Languages } from "lucide-react";

import { useAiChatStore } from "@/store/useAiChatStore";
import { AiLanguage } from "@/types/interface/ai.interface";

const languages: {
  value: AiLanguage;
  label: string;
}[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
];

const AiLanguageSelector = () => {
  const { language, setLanguage } = useAiChatStore();

  return (
    <Select
      value={language}
      onValueChange={(value) => setLanguage(value as AiLanguage)}
    >
      <SelectTrigger className="h-9 w-42.5 rounded-xl border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>

      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AiLanguageSelector;
