import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile and locked universities for context
    const [profile, lockedUnis] = await Promise.all([
      db.userProfile.findUnique({ where: { userId: session.user.id } }),
      db.lockedUniversity.findMany({ where: { userId: session.user.id } })
    ]);

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

    // Build context-aware system prompt
    const systemPrompt = `You are an expert AI Study Abroad Counsellor helping ${session.user.name || 'a student'}.

STUDENT PROFILE:
${profile ? `
- Education: ${profile.educationLevel || 'Not specified'} in ${profile.major || 'Not specified'}
- Graduation Year: ${profile.graduationYear || 'Not specified'}
- GPA: ${profile.gpa || 'Not provided'}
- Target: ${profile.targetDegree || 'Not specified'} in ${profile.targetCountry || 'Any country'}
- Intake Year: ${profile.intakeYear || 'Not specified'}
- Budget: ${profile.budgetRange || 'Not specified'} per year
- Funding: ${profile.fundingSource || 'Not specified'}
- English Test Status: ${profile.examStatus || 'Not started'}
- SOP Status: ${profile.sopStatus || 'Not started'}
- Current Stage: ${profile.currentStage || 'Building Profile'}
` : 'Profile not yet completed'}

${lockedUnis.length > 0 ? `LOCKED UNIVERSITIES: ${lockedUnis.map(u => u.universityId).join(', ')}` : 'No universities locked yet'}

Your role is to:
1. Help students discover universities (Dream/Target/Safe categories)
2. Explain why universities fit their profile
3. Identify risks and gaps in their applications
4. Suggest next steps based on their current stage
5. Be encouraging and supportive

Provide clear, actionable advice tailored to their profile.`;

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
