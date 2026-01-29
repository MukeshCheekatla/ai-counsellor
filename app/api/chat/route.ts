import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system: "You are an expert education counsellor helping students plan their study abroad journey. You are friendly, knowledgeable, and concise. Your goal is to guide them through selecting universities, understanding requirements, and preparing for applications. You can access the student's profile context if provided.",
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
