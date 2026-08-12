"use client";

import { motion } from "framer-motion";
import Lottie from "lottie-react";

import botAnimation from "@/services/json/bot.json";

import { useAiChatStore } from "@/store/useAiChatStore";

const AiFloatingButton = () => {
  const { isOpen, toggle } = useAiChatStore();

  return (
    <motion.button
      onClick={toggle}
      animate={
        isOpen
          ? {
              y: 0,
            }
          : {
              y: [0, -8, 0],
            }
      }
      transition={
        isOpen
          ? {
              duration: 0.3,
            }
          : {
              y: {
                duration: 2.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              },
            }
      }
      whileHover={{
        scale: 1.08,
      }}
      whileTap={{
        scale: 0.95,
      }}
      className="fixed bottom-6 right-6 z-50 flex h-18 w-18 items-center justify-center rounded-full bg-transparent"
    >
      <Lottie
        animationData={botAnimation}
        loop
        autoplay
        className="h-18 w-18 drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
      />
    </motion.button>
  );
};

export default AiFloatingButton;
