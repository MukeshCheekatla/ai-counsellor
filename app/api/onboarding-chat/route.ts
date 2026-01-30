import Groq from "groq-sdk";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { messages } = await req.json();

        let existingProfile = await db.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        const systemPrompt = `You are an AI study abroad counsellor conducting an onboarding interview. Your goal is to collect information from the student in a natural, conversational way.

**Required Information:**
1. Academic Background: Current education level, field, and graduation year.
2. Study Goals: Target degree, field, intake year, and preferred countries (e.g., USA, UK, Canada, Germany).
3. Budget: Annual budget range and funding plan (Self/Scholarship/Loan).
4. Readiness: IELTS/TOEFL status, GRE/GMAT, and SOP status.

**Current Profile State (Saved so far):**
${existingProfile ? JSON.stringify(existingProfile, null, 2) : "None"}

**Instructions:**
- CHECK THE CONVERSATION HISTORY and the Current Profile State before asking a question.
- Do NOT repeat the initial greeting if the user has already provided some information.
- If the user provides multiple pieces of information (e.g., "I'm doing MCA, graduating in 2025"), acknowledge them: "Got it, so you're finishing your MCA in 2025!" and then transition to the next set of questions (e.g., study goals).
- Ask ONE question at a time to keep it manageable.
- Be friendly, professional, and encouraging.
- Extract all possible information into the "extracted" JSON field.
- ONLY when you have sufficient information to build a basic profile, set "complete": true and tell them they are being redirected.

**Response Format:**
CRITICAL: Respond ONLY with raw JSON. Do NOT use code blocks or markdown.
{"content":"Your message to the user","extracted":{"currentEducation":"value or null","graduationYear":"value or null","targetDegree":"value or null","fieldOfStudy":"value or null","targetIntake":"value or null","preferredCountries":["country1"],"budgetRange":"value or null","fundingPlan":"value or null","ieltsStatus":"value or null","greStatus":"value or null","sopStatus":"value or null"},"complete":false}`;

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
                        max_tokens: 500,
                        stream: true,
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

                            await db.userProfile.upsert({
                                where: { userId },
                                create: {
                                    userId,
                                    educationLevel: extracted.currentEducation || "",
                                    major: extracted.fieldOfStudy || "",
                                    targetDegree: extracted.targetDegree || "",
                                    targetCountry: extracted.preferredCountries?.[0] || "",
                                    intakeYear: extracted.targetIntake || "",
                                    budgetRange: extracted.budgetRange || "",
                                    fundingSource: extracted.fundingPlan || "",
                                    examStatus: extracted.ieltsStatus || "",
                                    sopStatus: extracted.sopStatus || "",
                                    onboardingComplete: parsed.complete || false,
                                },
                                update: {
                                    educationLevel: extracted.currentEducation || existingProfile?.educationLevel,
                                    major: extracted.fieldOfStudy || existingProfile?.major,
                                    targetDegree: extracted.targetDegree || existingProfile?.targetDegree,
                                    targetCountry: extracted.preferredCountries?.[0] || existingProfile?.targetCountry,
                                    intakeYear: extracted.targetIntake || existingProfile?.intakeYear,
                                    budgetRange: extracted.budgetRange || existingProfile?.budgetRange,
                                    fundingSource: extracted.fundingPlan || existingProfile?.fundingSource,
                                    examStatus: extracted.ieltsStatus || existingProfile?.examStatus,
                                    sopStatus: extracted.sopStatus || existingProfile?.sopStatus,
                                    onboardingComplete: parsed.complete || existingProfile?.onboardingComplete || false,
                                },
                            });
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
