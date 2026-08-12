import { generateAIResponse } from "@/services/helper/ai.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message, history = [], language } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 },
      );
    }

    // The caller's identity is resolved server-side from the session cookie in
    // ai.service — a userId from the client body is intentionally ignored.
    const response = await generateAIResponse(message, history, undefined, language);

    if (!response.success) {
      return NextResponse.json(response, {
        status: response.rateLimited ? 429 : 500,
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 },
    );
  }
}
