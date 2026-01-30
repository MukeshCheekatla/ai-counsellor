"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function AIOnboardingMode() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm your AI counsellor. I'll help you get started on your study abroad journey. Let's begin by understanding your background. What's your current level of education? For example, are you completing your Bachelor's, Master's, or something else?"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/onboarding-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";
            let messageId = Date.now().toString();

            setMessages((prev) => [
                ...prev,
                { id: messageId, role: "assistant", content: "" },
            ]);

            while (true) {
                const { done, value } = (await reader?.read()) ?? { done: true };
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") {
                            setIsLoading(false);
                            break;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.content) {
                                assistantMessage += parsed.content;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === messageId
                                            ? { ...msg, content: assistantMessage }
                                            : msg
                                    )
                                );
                            }
                            if (parsed.complete) {
                                // Onboarding complete, redirect to dashboard
                                setTimeout(() => router.push("/dashboard"), 1500);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl h-[600px] flex flex-col shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">AI-Led Onboarding</CardTitle>
                                <p className="text-sm text-white/80">Let's build your profile together</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = '/onboarding'}
                            className="text-white hover:bg-white/20"
                        >
                            ← Change Mode
                        </Button>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
                                        <AvatarFallback>
                                            <Bot className="w-5 h-5 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${message.role === "user"
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                        : "bg-white border border-gray-200"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === "user" && (
                                    <Avatar className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-500">
                                        <AvatarFallback>
                                            <User className="w-5 h-5 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
                                    <AvatarFallback>
                                        <Bot className="w-5 h-5 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-2xl px-4 py-3 bg-white border border-gray-200">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <form onSubmit={handleSubmit} className="border-t p-4 bg-gray-50">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your answer..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
