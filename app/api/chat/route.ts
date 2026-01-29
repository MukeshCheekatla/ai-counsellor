import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✓ API Key loaded, generating response...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert messages to Gemini format (last message is the user's)
    const userMessage = messages[messages.length - 1].content;

    const result = await model.generateContentStream(userMessage);

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (error) {
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
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
