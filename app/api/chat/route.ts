import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tools, executeTool } from "./tools";

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

    // Convert tools to Gemini function declarations
    const functionDeclarations = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object" as const,
        properties: tool.parameters.properties,
        required: tool.parameters.required
      }
    }));

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash-exp",
      tools: [{ functionDeclarations }]
    });

    // Build context-aware system prompt
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

AVAILABLE FUNCTIONS:
You can take actions for the student using these functions:
- lock_university: Lock a university choice (commits student to applying)
- unlock_university: Unlock current university
- create_task: Add tasks to their to-do list
- mark_task_complete: Mark tasks as done

When the student asks you to perform an action (e.g., "lock MIT for me", "add a task to prepare SOP"), USE THE APPROPRIATE FUNCTION rather than just describing what they should do.

Your role is to:
1. Help students discover universities (Dream/Target/Safe categories)
2. Explain why universities fit their profile
3. Identify risks and gaps in their applications
4. Suggest next steps based on their current stage
5. TAKE ACTIONS when asked using the available functions
6. Be encouraging and supportive

Provide clear, actionable advice tailored to their profile.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm your AI study abroad counsellor, and I have access to your profile. I can help you discover universities, provide personalized advice, and take actions like locking universities or creating tasks for you. How can I help you today?" }]
        }
      ]
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(userMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const candidate = chunk.candidates?.[0];

            // Handle function calls
            if (candidate?.content?.parts) {
              for (const part of candidate.content.parts) {
                if (part.functionCall) {
                  const { name, args } = part.functionCall;
                  console.log(`🔧 Function call: ${name}`, args);

                  // Execute the tool
                  const toolResult = await executeTool(name, args, session.user.id!);

                  // Send tool result as a visible message
                  const actionMessage = `0:${JSON.stringify({
                    type: "action",
                    tool: name,
                    success: toolResult.success,
                    message: toolResult.message
                  })}\n`;
                  controller.enqueue(encoder.encode(actionMessage));

                  // Continue conversation with function result
                  const followUp = await chat.sendMessageStream([{
                    functionResponse: {
                      name,
                      response: toolResult
                    }
                  }]);

                  // Stream the AI's response after taking action
                  for await (const followChunk of followUp.stream) {
                    const text = followChunk.text();
                    if (text) {
                      const formatted = `0:${JSON.stringify({ type: "text", value: text })}\n`;
                      controller.enqueue(encoder.encode(formatted));
                    }
                  }
                } else if (part.text) {
                  // Regular text response
                  const formatted = `0:${JSON.stringify({ type: "text", value: part.text })}\n`;
                  controller.enqueue(encoder.encode(formatted));
                }
              }
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
