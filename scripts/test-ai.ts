// Test script to verify AI SDK works
import { google } from "@ai-sdk/google";
import { streamText } from "ai";

async function testAI() {
    console.log("Testing AI SDK...");
    console.log("API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    try {
        const result = await streamText({
            model: google("gemini-1.5-flash"),
            messages: [{ role: "user", content: "Say hello" }],
        });

        console.log("✅ AI SDK initialized successfully!");

        let fullText = "";
        for await (const chunk of result.textStream) {
            fullText += chunk;
        }

        console.log("✅ Response:", fullText);
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        console.error("Stack:", error.stack);
    }
}

testAI();
