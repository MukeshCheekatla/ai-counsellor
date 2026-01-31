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

YOUR ROLE: You're an AI counsellor who helps students choose universities.

CRITICAL RULES:
1. **BE EXTREMELY BRIEF:** Maximum 2-3 SHORT sentences. No long explanations.
   
2. **USE BULLET POINTS for lists:**
   ✓ "Top picks: MIT (Dream, 15% acceptance), Stanford (Dream), BU (Target, affordable)"
   ✗ Long paragraphs with details
   
3. **ALWAYS RESPOND when using tools:**
   ✓ "Locking MIT for you now!"
   ✗ Staying silent
   
4. **EXPLAIN WHY briefly:**
   "MIT fits your CS background and GPA, but acceptance is 15% (Dream tier)."
   
5. **Action-first for tasks:**
   User: "add MIT" → Response: "Adding MIT!" [then use tool]

Example responses:
Q: "Best CS universities?"
A: "For CS: MIT and Stanford (Dream tier), Boston U and UCSD (Target). All match your profile."

Q: "Lock eligible ones"
A: "Locking MIT and Stanford since they're your best matches!"

KEEP IT SHORT. Students need quick, clear answers, not essays!`;

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
        // Try primary model first, fallback to lighter model if rate limited
        const models = [
          "llama-3.3-70b-versatile",  // Primary: Best quality
          "llama-3.1-8b-instant"       // Fallback: Faster, lower token usage
        ];

        let lastError = null;

        for (const model of models) {
          try {
            const completion = await groq.chat.completions.create({
              model,
              messages: groqMessages,
              tools: groqTools,
              tool_choice: "auto",
              parallel_tool_calls: false,
              temperature: 0.7,
              max_tokens: 300,
              stream: true,
            });

            let fullContent = "";
            let toolCalls: any[] = [];

            for await (const chunk of completion) {
              const delta = chunk.choices[0]?.delta;

              if (delta?.content) {
                fullContent += delta.content;
                const formatted = `data: ${JSON.stringify({ type: "content", content: delta.content })}\n\n`;
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
            const validToolCalls = toolCalls.filter(tc => tc && tc.function && tc.function.name);
            if (validToolCalls.length > 0) {
              for (const toolCall of validToolCalls) {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const result = await executeTool(toolCall.function.name, args, userId);

                  // Send tool result to user
                  const formatted = `data: ${JSON.stringify({ type: "action", message: result.message })}\n\n`;
                  controller.enqueue(encoder.encode(formatted));
                } catch (error: any) {
                  console.error("Tool execution error:", error);
                  const errorMsg = `⚠️ ${error.message || "Action failed"}`;
                  const formatted = `data: ${JSON.stringify({ type: "action", message: errorMsg })}\n\n`;
                  controller.enqueue(encoder.encode(formatted));
                }
              }
            }

            controller.close();
            return; // Success - exit the loop
          } catch (error: any) {
            lastError = error;

            // If it's a rate limit error (429), try the next model
            if (error?.status === 429) {
              console.log(`Rate limited on ${model}, trying fallback...`);
              continue; // Try next model
            }

            // For other errors, break immediately
            console.error("Stream error:", error);
            throw error;
          }
        }

        // If we exhausted all models, throw the last error
        if (lastError) {
          console.error("All models failed:", lastError);
          controller.error(lastError);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
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
