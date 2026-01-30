import { GoogleGenAI } from "@google/genai";
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

    const [profile, lockedUnis] = await Promise.all([
      db.userProfile.findUnique({ where: { userId: session.user.id } }),
      db.lockedUniversity.findMany({ where: { userId: session.user.id } })
    ]);

    const { messages } = await req.json();

    const ai = new GoogleGenAI({});

    const systemPrompt = `You are an expert AI Study Abroad Counsellor helping ${session.user.name || 'a student'}.

STUDENT PROFILE:
${profile ? `
- Education: ${profile.educationLevel || 'Not specified'} in ${profile.major || 'Not specified'}
- GPA: ${profile.gpa || 'Not provided'}
- Target: ${profile.targetDegree || 'Not specified'} in ${profile.targetCountry || 'Any country'}
- Intake Year: ${profile.intakeYear || 'Not specified'}
- Budget: ${profile.budgetRange || 'Not specified'} per year
- Funding: ${profile.fundingSource || 'Not specified'}
- English Test Status: ${profile.examStatus || 'Not started'}
- SOP Status: ${profile.sopStatus || 'Not started'}
` : 'Profile not yet completed'}

${lockedUnis.length > 0 ? `LOCKED UNIVERSITIES: ${lockedUnis.map(u => u.universityId).join(', ')}` : 'No universities locked yet'}

Your role is to:
1. Help students discover universities (Dream/Target/Safe categories)
2. Explain why universities fit their profile
3. Identify risks and gaps in their applications
4. Suggest next steps based on their current stage
5. Be encouraging and supportive

Provide clear, actionable advice tailored to their profile.`;

    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const fullMessages = [
      {
        role: 'user' as const,
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model' as const,
        parts: [{ text: 'I understand. I\'m ready to help with study abroad counseling.' }]
      },
      ...geminiMessages
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-3-flash-preview',
            contents: fullMessages,
          });

          for await (const chunk of response) {
            const text = chunk.text;
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
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate response"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
