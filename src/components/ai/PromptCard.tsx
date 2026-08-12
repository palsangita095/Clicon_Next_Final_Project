"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Prompt } from "@/types/interface/ai.interface";

interface PromptCardProps {
  prompt: Prompt;
  onTry: () => void;
}

const PromptCard = ({ prompt, onTry }: PromptCardProps) => {
  return (
    <motion.div
      key={prompt.id}
      initial={{
        opacity: 0,
        x: 40,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: -40,
        scale: 0.96,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.02,
      }}
      className="
rounded-3xl
border
border-white/10
bg-linear-to-br
from-white/10
to-white/5
p-6
backdrop-blur-3xl
shadow-[0_10px_40px_rgba(0,0,0,.15)]
transition-all
"
    >
      <div className="space-y-5">
        <div className="text-5xl">{prompt.icon}</div>

        <div>
          <h3 className="text-xl font-semibold">{prompt.title}</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {prompt.description}
          </p>
        </div>

        <Button onClick={onTry} className="rounded-xl">
          ✨ Try this Prompt
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PromptCard;
