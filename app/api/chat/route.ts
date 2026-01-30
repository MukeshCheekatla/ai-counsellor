import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const systemPrompt = `You are an expert AI Study Abroad Counsellor. Help students with university selection, applications, and guidance.`;
    const userMessage = messages[messages.length - 1].content;
    const fullPrompt = systemPrompt + "\n\nStudent: " + userMessage;

    const result = await model.generateContentStream(fullPrompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const formatted = `0:${JSON.stringify({ type: "text", value: text })}\n`;
              controller.enqueue(encoder.encode(formatted));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error: any) {
    console.error("❌ Chat API error:", error);
    console.error("Error status:", error.status);
    console.error("Error details:", error.errorDetails);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate response",
        status: error.status,
        details: error.errorDetails
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
