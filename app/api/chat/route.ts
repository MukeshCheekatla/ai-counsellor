import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { matchUniversities, getRecommendedUniversities, calculateProfileStrength } from "@/lib/university-matcher";

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

    const [profile, lockedUnis, universities, shortlisted] = await Promise.all([
      db.userProfile.findUnique({ where: { userId: session.user.id } }),
      db.lockedUniversity.findMany({ where: { userId: session.user.id } }),
      db.university.findMany(),
      db.shortlistedUniversity.findMany({ where: { userId: session.user.id } })
    ]);

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
${recommendations.dream.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (${u.country}) - ${u.programName}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}

TARGET UNIVERSITIES (Good Fit):
${recommendations.target.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (${u.country}) - ${u.programName}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}

SAFE UNIVERSITIES (Safety):
${recommendations.safe.slice(0, 3).map((u, i) => `${i + 1}. ${u.name} (${u.country}) - ${u.programName}
   - Tuition: $${u.tuitionFee.toLocaleString()}/year
   - Match Score: ${u.matchScore}/100
   - Why: ${u.matchReason}
   - Acceptance Likelihood: ${u.acceptanceLikelihood}
`).join('\n')}
`;
    }

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
- Current Stage: ${profile.currentStage || 'Building profile'}
` : 'Profile not yet completed - Guide them to complete onboarding first'}

${profileAnalysis}

${lockedUnis.length > 0 ? `LOCKED UNIVERSITIES: ${lockedUnis.length} university/universities locked` : 'No universities locked yet'}
${shortlisted.length > 0 ? `SHORTLISTED: ${shortlisted.length} universities shortlisted` : ''}

${recommendedUnis}

YOUR ROLE & CAPABILITIES:
1. **Profile Analysis**: Explain their strengths and gaps clearly
2. **University Recommendations**: Suggest universities from the list above that match their profile
3. **Risk Assessment**: Identify what might hurt their chances (low GPA, missing exams, etc.)
4. **Strategic Advice**: Help them build Dream-Target-Safe university list
5. **Next Steps**: Be specific about what they should do NOW
6. **Encouragement**: Be supportive but realistic

IMPORTANT GUIDELINES:
- When recommending universities, ONLY suggest from the matched list above
- Explain WHY each university is a good/bad fit based on their profile
- Be honest about acceptance chances - don't give false hope
- Emphasize the importance of having safety schools
- If their profile is weak, guide them on improving it FIRST
- When they ask about specific universities, provide details from the list
- Recommend they shortlist 8-12 universities (3-4 Dream, 4-5 Target, 3-4 Safe)
- Remind them to lock at least ONE university to get application guidance

CURRENT PRIORITIES based on their stage:
${!profile?.onboardingComplete ? "- Complete profile onboarding FIRST" : ""}
${profile?.examStatus === "not_started" ? "- Register for TOEFL/IELTS and GRE/GMAT immediately" : ""}
${profile?.sopStatus === "not_started" ? "- Start drafting Statement of Purpose" : ""}
${shortlisted.length === 0 ? "- Research and shortlist universities" : ""}
${lockedUnis.length === 0 && shortlisted.length > 0 ? "- Lock at least one university to begin focused preparation" : ""}

Be conversational, supportive, and actionable. Students are stressed - help them feel confident.`;

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
        parts: [{ text: 'I understand. I\'m ready to provide personalized study abroad counseling based on this student\'s profile and the matched universities. I\'ll be supportive, honest, and actionable.' }]
      },
      ...geminiMessages
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash-exp',
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
