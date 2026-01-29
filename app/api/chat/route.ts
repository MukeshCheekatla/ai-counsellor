import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system: "You are an expert AI Education Counsellor. Your goal is to help students plan their international education. You are supportive, professional, and precise. Provide guidance on university selection, application processes, and career paths.",
    messages,
  });

  return result.toDataStreamResponse();
}
