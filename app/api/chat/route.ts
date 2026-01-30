import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { matchUniversities, getRecommendedUniversities, calculateProfileStrength } from "@/lib/university-matcher";
import { tools, executeTool } from "./tools";
import { universities as staticUniversities } from "@/lib/universities";

// Force Node.js runtime
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // Instantiate at runtime, not build time
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = session.user.id;

    // Execute queries sequentially with fault tolerance
    let profile = null;
    let lockedUnis: any[] = [];
    let universities: any[] = [];
    let shortlisted: any[] = [];
    let tasks: any[] = [];

    try { profile = await db.userProfile.findUnique({ where: { userId } }); } catch (e) { console.warn("Profile fetch failed"); }
    try { lockedUnis = await db.lockedUniversity.findMany({ where: { userId } }); } catch (e) { console.warn("Locked fetch failed"); }

    try { universities = await db.university.findMany(); } catch (e) { console.warn("Uni fetch failed"); }
    if (universities.length === 0) {
      universities = staticUniversities.map(u => ({
        id: u.id,
        name: u.name,
        country: u.country,
        city: u.location.split(',')[0].trim(),
        ranking: u.ranking,
        tuitionFee: u.tuitionPerYear,
        acceptanceRate: u.acceptanceRate,
        category: u.category,
        programName: u.programs[0] || "General",
        programType: "Master's",
        requirements: JSON.stringify({ gpa: u.requiredGPA }),
        scholarships: true
      }));
    }

    try { shortlisted = await db.shortlistedUniversity.findMany({ where: { userId } }); } catch (e) { console.warn("Shortlist fetch failed"); }
    try { tasks = await db.task.findMany({ where: { userId, completed: false } }); } catch (e) { console.warn("Task fetch failed"); }

    const { messages } = await req.json();

    // Get profile strength and recommendations
    let profileAnalysis = "";
    let recommendedUnis = "";

    if (profile && profile.onboardingComplete) {
      const strength = calculateProfileStrength(profile);
      profileAnalysis = `
PROFILE STRENGTH ANALYSIS:
- Academics: ${strength.academics}/100 (${strength.academics >= 75 ? "Strong" : strength.academics >= 50 ? "Average" : "Needs Improvement"})
- Exams: ${strength.exams}/100 (${strength.exams >= 75 ? "Ready" : strength.exams >= 50 ? "In Progress" : "Not Started"})
- SOP: ${strength.sop}/100 (${strength.sop >= 75 ? "Ready" : strength.sop >= 50 ? "Draft" : "Not Started"})
- Overall Readiness: ${strength.overall}/100
`;

      // Get university matches
      const matches = matchUniversities(universities, profile);
      const recommendations = getRecommendedUniversities(matches, 10);

      recommendedUnis = `
TOP UNIVERSITY MATCHES FOR THIS STUDENT:

DREAM UNIVERSITIES (Reach):
${recommendations.dream.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (ID: ${u.id}) - ${u.country}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}

TARGET UNIVERSITIES (Good Fit):
${recommendations.target.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (ID: ${u.id}) - ${u.country}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}

SAFE UNIVERSITIES (Safety):
${recommendations.safe.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (ID: ${u.id}) - ${u.country}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}
`;
    }

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
- Current Stage: ${profile.currentStage || 'Building profile'}
` : 'Profile not yet completed - Guide them to complete onboarding first'}

${profileAnalysis}

${lockedUnis.length > 0 ? `LOCKED UNIVERSITIES: ${lockedUnis.length} university/universities locked` : 'No universities locked yet'}
${shortlisted.length > 0 ? `SHORTLISTED: ${shortlisted.length} universities shortlisted` : ''}

CURRENT TASKS:
${tasks.length > 0 ? tasks.map(t => `- [${t.priority.toUpperCase()}] ${t.title} (ID: ${t.id})`).join('\n') : "No pending tasks."}

${recommendedUnis}

YOUR ROLE & CAPABILITIES:
1. **Profile Analysis**: Explain their strengths and gaps clearly
2. **University Recommendations**: Suggest universities from the list above that match their profile
3. **Risk Assessment**: Identify what might hurt their chances
4. **Strategic Advice**: Help them build Dream-Target-Safe university list
5. **Next Steps**: Be specific about what they should do NOW
6. **TAKE ACTIONS**: Use tools to shortlist universities and create tasks

IMPORTANT GUIDELINES:
- When recommending universities, ONLY suggest from the matched list above
- When the user shows interest in a university, USE THE shortlist_university TOOL to add it
- When they want to lock a university for applications, USE THE lock_university TOOL
- Create tasks for them using the create_task TOOL when discussing action items. Categorize them appropriately (sop, exam, application).
- Be honest about acceptance chances
- Use the university ID from the list when using tools

Be conversational, supportive, and ACTION-ORIENTED. Don't just talk - DO things for them!`;

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    ];

    // Convert tools to Groq format
    const groqTools = tools.map(tool => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            tools: groqTools,
            tool_choice: "auto",
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
          });

          let fullContent = "";
          let toolCalls: any[] = [];

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
              fullContent += delta.content;
              const formatted = `0:${JSON.stringify({ type: "text", value: delta.content })}\n`;
              controller.enqueue(encoder.encode(formatted));
            }

            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (!toolCalls[toolCall.index]) {
                  toolCalls[toolCall.index] = {
                    id: toolCall.id,
                    function: { name: toolCall.function?.name || "", arguments: "" }
                  };
                }
                if (toolCall.function?.arguments) {
                  toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
                }
              }
            }
          }

          // Execute tool calls if any
          if (toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await executeTool(toolCall.function.name, args, userId);

                // Send tool result to user
                const toolMessage = `\n\n🤖 ${result.message}`;
                const formatted = `0:${JSON.stringify({ type: "text", value: toolMessage })}\n`;
                controller.enqueue(encoder.encode(formatted));
              } catch (error: any) {
                console.error("Tool execution error:", error);
                const errorMsg = `\n\n⚠️ Action failed: ${error.message}`;
                const formatted = `0:${JSON.stringify({ type: "text", value: errorMsg })}\n`;
                controller.enqueue(encoder.encode(formatted));
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
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate response"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
