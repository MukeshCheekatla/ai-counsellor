import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";

// Force Node.js runtime
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    // Instantiate at runtime, not build time
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { messages } = await req.json();

        let existingProfile = null;
        try {
            existingProfile = await db.userProfile.findUnique({
                where: { userId: session.user.id },
            });
        } catch (e) {
            console.warn("Onboarding profile fetch failed:", e);
        }

        const systemPrompt = `You are an AI study abroad counsellor conducting a FAST onboarding interview. Be EXTREMELY CONCISE.

**ABSOLUTELY CRITICAL RULES:**
1. Keep responses UNDER 15 words - just acknowledge + ask next question
2. NO explanations, NO long intros, NO extra details
3. Format: "Got it! [Next question]?" or "Perfect! [Next question]?"
4. READ conversation history - NEVER repeat questions
5. User's LAST message = their answer to YOUR LAST QUESTION
6. **VALIDATION:** If answer is unclear/gibberish, say "Sorry, didn't catch that. Could you repeat?" and wait

**STRICT ORDER - Follow this EXACT sequence:**
STEP 1 - ACADEMICS (complete ALL before moving to step 2):
   a) Education level (Bachelor's/Master's/etc)
   b) Major/field of study
   c) Graduation year
   d) GPA (optional - if they don't mention, skip it)

STEP 2 - STUDY GOALS (complete ALL before moving to step 3):
   a) Target degree (Master's/MBA/PhD)
   b) Target field
   c) Preferred country
   d) Intake year

STEP 3 - BUDGET:
   a) Budget range per year
   b) Funding plan (self/scholarship/loan)

STEP 4 - TESTS:
   a) IELTS/TOEFL status
   b) GRE/GMAT status  
   c) SOP status

**DO NOT skip ahead!** Complete each step fully before moving to next.

**Required Information to Collect:**
- Academic: Education level, major/stream, field of study, graduation year, GPA (optional)
- Study Goals: Target degree, field of study, preferred country, intake year  
- Budget: Budget range, funding source
- Tests: IELTS/TOEFL status, GRE/GMAT status, SOP status

**Current Profile State:**
${existingProfile ? JSON.stringify(existingProfile, null, 2) : "No data saved yet"}

**HOW TO RESPOND:**
1. LOOK at the user's LAST message - what did they just tell you?
2. EXTRACT that information 
3. SAY something like "Got it! You're studying [what they said]..."
4. ASK the NEXT missing question only

**Example Flow:**
User: "bachelor" → You acknowledge "Great! Bachelor's degree" and ask about their major
User: "computer science" → You say "Perfect, Computer Science!" and ask about graduation year
User: "2025" → You say "Graduating 2025, excellent!" and ask about target degree

**CRITICAL: If user answers multiple things at once, extract ALL of it!**

**Response Format (JSON only, no markdown):**
{
  "content": "Your natural response here (e.g. 'That sounds great! What about...')",
  "extracted": {
    "currentEducation": "value or null",
    "major": "value or null",
    "fieldOfStudy": "value or null",
    "graduationYear": "value or null",
    "gpa": "value or null",
    "targetDegree": "value or null",
    "targetIntake": "value or null",
    "preferredCountries": ["country"],
    "budgetRange": "value or null",
    "fundingPlan": "value or null",
    "ieltsStatus": "value or null",
    "greStatus": "value or null",
    "sopStatus": "value or null"
  },
  "complete": false
}

**WHEN TO SET complete:true:**
Set complete to true ONLY when you have collected:
1. Education level AND major AND graduation year (Step 1 complete)
2. Target degree AND target field AND preferred country AND intake year (Step 2 complete)
3. Budget range AND funding plan (Step 3 complete)
4. IELTS status AND GRE status AND SOP status (Step 4 complete)

**Make sure to return valid JSON.**`;

        const groqMessages = [
            { role: "system" as const, content: systemPrompt },
            ...messages.map((msg: any) => ({
                role: msg.role === "user" ? "user" as const : "assistant" as const,
                content: msg.content
            }))
        ];

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";

                try {
                    const completion = await groq.chat.completions.create({
                        model: "llama-3.3-70b-versatile",
                        messages: groqMessages,
                        temperature: 0.7,
                        max_tokens: 350,
                        stream: true,
                        response_format: { type: "json_object" }
                    });

                    for await (const chunk of completion) {
                        const text = chunk.choices[0]?.delta?.content || "";
                        if (text) {
                            fullResponse += text;
                        }
                    }

                    // Parse the complete JSON response
                    let parsed: any = null;
                    try {
                        parsed = JSON.parse(fullResponse);
                    } catch (e) {
                        // Try to extract JSON with regex if direct parse fails
                        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            try {
                                parsed = JSON.parse(jsonMatch[0]);
                            } catch (e2) {
                                console.error("Regex JSON parse error:", e2);
                            }
                        }
                    }

                    if (parsed) {
                        // Stream the content to frontend
                        if (parsed.content) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ content: parsed.content })}\n\n`)
                            );
                        }

                        // Save data incrementally if extracted
                        if (parsed.extracted) {
                            const userId = session.user!.id as string;
                            const extracted = parsed.extracted;

                            try {
                                await db.userProfile.upsert({
                                    where: { userId },
                                    create: {
                                        userId,
                                        educationLevel: extracted.currentEducation || "",
                                        major: extracted.major || "",
                                        graduationYear: String(extracted.graduationYear || ""),
                                        gpa: extracted.gpa || "",
                                        fieldOfStudy: extracted.fieldOfStudy || "",
                                        targetDegree: extracted.targetDegree || "",
                                        targetCountry: extracted.preferredCountries?.[0] || "",
                                        intakeYear: extracted.targetIntake || "",
                                        budgetRange: extracted.budgetRange || "",
                                        fundingSource: extracted.fundingPlan || "",
                                        examStatus: extracted.ieltsStatus || "",
                                        greGmatStatus: extracted.greStatus || "",
                                        sopStatus: extracted.sopStatus || "",
                                        onboardingComplete: parsed.complete || false,
                                    },
                                    update: {
                                        educationLevel: extracted.currentEducation || existingProfile?.educationLevel,
                                        major: extracted.major || existingProfile?.major,
                                        graduationYear: extracted.graduationYear ? String(extracted.graduationYear) : existingProfile?.graduationYear,
                                        gpa: extracted.gpa || existingProfile?.gpa,
                                        fieldOfStudy: extracted.fieldOfStudy || existingProfile?.fieldOfStudy,
                                        targetDegree: extracted.targetDegree || existingProfile?.targetDegree,
                                        targetCountry: extracted.preferredCountries?.[0] || existingProfile?.targetCountry,
                                        intakeYear: extracted.targetIntake || existingProfile?.intakeYear,
                                        budgetRange: extracted.budgetRange || existingProfile?.budgetRange,
                                        fundingSource: extracted.fundingPlan || existingProfile?.fundingSource,
                                        examStatus: extracted.ieltsStatus || existingProfile?.examStatus,
                                        greGmatStatus: extracted.greStatus || existingProfile?.greGmatStatus,
                                        sopStatus: extracted.sopStatus || existingProfile?.sopStatus,
                                        onboardingComplete: parsed.complete || existingProfile?.onboardingComplete || false,
                                    },
                                });
                            } catch (e) {
                                console.error("Failed to save onboarding progress:", e);
                            }
                        }

                        if (parsed.complete) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ complete: true })}\n\n`)
                            );
                        }
                    } else {
                        // If no JSON found, send the raw response as content
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ content: fullResponse })}\n\n`)
                        );
                    }

                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Onboarding chat error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
