import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

        const systemPrompt = `You are an AI study abroad counsellor conducting an onboarding interview. Your goal is to collect the following information from the student in a natural, conversational way:

**Required Information:**
1. Academic Background:
   - Current education level (e.g., "Bachelor's in Computer Science")
   - Graduation year
   - GPA/percentage (optional)

2. Study Goals:
   - Intended degree (Bachelor's/Master's/MBA/PhD)
   - Field of study
   - Target intake year
   - Preferred countries (e.g., USA, UK, Canada, Germany)

3. Budget:
   - Budget range per year (in USD or their currency)
   - Funding plan (Self-funded/Scholarship/Loan)

4. Exams & Readiness:
   - IELTS/TOEFL status (Not started/In progress/Completed with score)
   - GRE/GMAT status (if applicable)
   - SOP status (Not started/Draft/Ready)

**Current Profile Data:**
${existingProfile ? JSON.stringify(existingProfile, null, 2) : "No existing data"}

**Instructions:**
- Ask ONE question at a time
- Be friendly and encouraging
- If they provide multiple pieces of info, acknowledge all and move to next topic
- Extract specific values from their answers
- When you have ALL required information, save it and say "Great! Your profile is complete. Redirecting you to your dashboard..."

**Response Format:**
CRITICAL: Respond ONLY with raw JSON. Do NOT use code blocks, markdown formatting, or any wrapper.
Your entire response must be parseable JSON in this exact format:
{"content":"Your message to the user","extracted":{"currentEducation":"value or null","graduationYear":"value or null","targetDegree":"value or null","fieldOfStudy":"value or null","targetIntake":"value or null","preferredCountries":["country1"],"budgetRange":"value or null","fundingPlan":"value or null","ieltsStatus":"value or null","greStatus":"value or null","sopStatus":"value or null"},"complete":false}

When profile is complete, set "complete": true.`;

        const ai = new GoogleGenAI({});

        const fullMessages = [
            { role: 'user' as const, parts: [{ text: systemPrompt }] },
            { role: 'model' as const, parts: [{ text: '{"content":"I understand. I will respond only with raw JSON.","extracted":{"currentEducation":null,"graduationYear":null,"targetDegree":null,"fieldOfStudy":null,"targetIntake":null,"preferredCountries":null,"budgetRange":null,"fundingPlan":null,"ieltsStatus":null,"greStatus":null,"sopStatus":null},"complete":false}' }] },
            ...messages.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: msg.content }]
            }))
        ];

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";

                try {
                    const result = await ai.models.generateContentStream({
                        model: 'gemini-3-flash-preview',
                        contents: fullMessages,
                    });

                    for await (const chunk of result) {
                        const text = chunk.text;
                        if (text) {
                            fullResponse += text;
                        }
                    }

                    // Parse the complete JSON response
                    try {
                        const parsed = JSON.parse(fullResponse);

                        // Stream the content to frontend
                        if (parsed.content) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ content: parsed.content })}\n\n`)
                            );
                        }

                        if (parsed.complete && parsed.extracted) {
                            const userId = session.user!.id as string;
                            await db.userProfile.upsert({
                                where: { userId },
                                create: {
                                    userId,
                                    educationLevel: parsed.extracted.currentEducation || "",
                                    major: parsed.extracted.fieldOfStudy || "",
                                    gpa: null,
                                    targetDegree: parsed.extracted.targetDegree || "",
                                    targetCountry: parsed.extracted.preferredCountries?.[0] || "",
                                    intakeYear: parsed.extracted.targetIntake || "",
                                    budgetRange: parsed.extracted.budgetRange || "",
                                    fundingSource: parsed.extracted.fundingPlan || "",
                                    examStatus: parsed.extracted.ieltsStatus || "",
                                    sopStatus: parsed.extracted.sopStatus || "",
                                    onboardingComplete: true,
                                },
                                update: {
                                    educationLevel: parsed.extracted.currentEducation || existingProfile?.educationLevel,
                                    major: parsed.extracted.fieldOfStudy || existingProfile?.major,
                                    targetDegree: parsed.extracted.targetDegree || existingProfile?.targetDegree,
                                    targetCountry: parsed.extracted.preferredCountries?.[0] || existingProfile?.targetCountry,
                                    intakeYear: parsed.extracted.targetIntake || existingProfile?.intakeYear,
                                    budgetRange: parsed.extracted.budgetRange || existingProfile?.budgetRange,
                                    fundingSource: parsed.extracted.fundingPlan || existingProfile?.fundingSource,
                                    examStatus: parsed.extracted.ieltsStatus || existingProfile?.examStatus,
                                    sopStatus: parsed.extracted.sopStatus || existingProfile?.sopStatus,
                                    onboardingComplete: true,
                                },
                            });
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ complete: true })}\n\n`)
                            );
                        }
                    } catch (e) {
                        // If not JSON, treat as regular text response
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
