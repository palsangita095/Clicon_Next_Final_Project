"use client";

import { Bot } from "lucide-react";
import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Bot className="h-5 w-5" />
      </div>

      <div className="rounded-3xl rounded-tl-md border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl dark:bg-zinc-900/40">
        <div className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{
                y: [0, -4, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: dot * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
