"use client";

import { Bot } from "lucide-react";
import MarkdownRenderer from "./MarkdownRender";

interface Props {
  content: string;
}

const AiMessage = ({ content }: Props) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-5 w-5" />
      </div>

      <div className="max-w-[80%] rounded-3xl rounded-tl-md border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl dark:bg-zinc-900/40">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

export default AiMessage;
