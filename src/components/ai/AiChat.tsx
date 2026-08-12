"use client";

import AiFloatingButton from "./AiFloatingButton";
import AiChatWindow from "./AiChatWindow";
import { useAiChatStore } from "@/store/useAiChatStore";

const AiChat = () => {
  const { isOpen } = useAiChatStore();

  return (
    <>
      <AiFloatingButton />

      {isOpen && <AiChatWindow />}
    </>
  );
};

export default AiChat;
