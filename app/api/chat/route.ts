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

    // Add system prompt for the AI Counsellor
    const systemPrompt = `You are an expert AI Study Abroad Counsellor. Your role is to:
- Help students find the best universities based on their profile
- Provide guidance on application process, exams, and requirements
- Explain university fit and acceptance chances  
- Be supportive, knowledgeable, and provide actionable advice
- Keep responses concise but helpful

Always be encouraging and help students make informed decisions about their study abroad journey.`;

    // Convert messages to Gemini format
    const userMessage = messages[messages.length - 1].content;
    const fullPrompt = systemPrompt + "\n\nStudent: " + userMessage;

    const result = await model.generateContentStream(fullPrompt);

    // Create a readable stream in the format the client expects
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            // Format as expected by client: "0:{\"type\":\"text\",\"value\":\"...\"}\n"
            const formatted = `0:${JSON.stringify({ type: "text", value: text })}\n`;
            controller.enqueue(encoder.encode(formatted));
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
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
