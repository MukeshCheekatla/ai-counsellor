import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { messages } = await req.json();

        // Get existing profile data if any
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
Always respond in JSON format:
{
  "content": "Your message to the user",
  "extracted": {
    "currentEducation": "value or null",
    "graduationYear": "value or null",
    "targetDegree": "value or null",
    "fieldOfStudy": "value or null",
    "targetIntake": "value or null",
    "preferredCountries": ["country1", "country2"] or null,
    "budgetRange": "value or null",
    "fundingPlan": "value or null",
    "ieltsStatus": "value or null",
    "greStatus": "value or null",
    "sopStatus": "value or null"
  },
  "complete": false
}

When profile is complete, set "complete": true and save to database.`;

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-exp" });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessageStream([
            { text: systemPrompt },
            { text: messages[messages.length - 1].content },
        ]);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let fullResponse = "";

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    fullResponse += text;

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                    );
                }

                // Try to parse the full response as JSON
                try {
                    const parsed = JSON.parse(fullResponse);

                    if (parsed.complete && parsed.extracted) {
                        // Save profile to database
                        await db.userProfile.upsert({
                            where: { userId: session.user.id },
                            create: {
                                userId: session.user.id,
                                currentEducation: parsed.extracted.currentEducation || "",
                                graduationYear: parsed.extracted.graduationYear || "",
                                targetDegree: parsed.extracted.targetDegree || "",
                                fieldOfStudy: parsed.extracted.fieldOfStudy || "",
                                targetIntake: parsed.extracted.targetIntake || "",
                                preferredCountries: parsed.extracted.preferredCountries || [],
                                budgetRange: parsed.extracted.budgetRange || "",
                                fundingPlan: parsed.extracted.fundingPlan || "",
                                ieltsStatus: parsed.extracted.ieltsStatus || "",
                                greStatus: parsed.extracted.greStatus || "",
                                sopStatus: parsed.extracted.sopStatus || "",
                                onboardingComplete: true,
                                currentStage: "discovering_universities",
                            },
                            update: {
                                currentEducation: parsed.extracted.currentEducation || existingProfile?.currentEducation,
                                graduationYear: parsed.extracted.graduationYear || existingProfile?.graduationYear,
                                targetDegree: parsed.extracted.targetDegree || existingProfile?.targetDegree,
                                fieldOfStudy: parsed.extracted.fieldOfStudy || existingProfile?.fieldOfStudy,
                                targetIntake: parsed.extracted.targetIntake || existingProfile?.targetIntake,
                                preferredCountries: parsed.extracted.preferredCountries || existingProfile?.preferredCountries,
                                budgetRange: parsed.extracted.budgetRange || existingProfile?.budgetRange,
                                fundingPlan: parsed.extracted.fundingPlan || existingProfile?.fundingPlan,
                                ieltsStatus: parsed.extracted.ieltsStatus || existingProfile?.ieltsStatus,
                                greStatus: parsed.extracted.greStatus || existingProfile?.greStatus,
                                sopStatus: parsed.extracted.sopStatus || existingProfile?.sopStatus,
                                onboardingComplete: true,
                                currentStage: "discovering_universities",
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
