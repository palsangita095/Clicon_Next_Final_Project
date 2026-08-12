interface GenerateAIResponsePayload {
  message: string;
  language: string;
  history: { role: "user" | "assistant"; content: string }[];
}

interface GenerateAIResponse {
  success: boolean;
  data: string | null;
  message: string;
  rateLimited?: boolean;
}

// ! ai response generation
export const generateAIResponseFns = async ({
  message,
  language,
  history,
}: GenerateAIResponsePayload): Promise<GenerateAIResponse> => {
  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        language,
        history,
      }),
    });

    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong.",
    };
  }
};