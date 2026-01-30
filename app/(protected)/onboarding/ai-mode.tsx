"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff, Volume2, VolumeX, PhoneCall, ArrowLeft } from "lucide-react";

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
    const [hasError, setHasError] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [voiceToVoiceMode, setVoiceToVoiceMode] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const recognitionRef = useRef<any>(null);
    const shouldAutoSubmitRef = useRef(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-speak AI messages when voice is enabled
    useEffect(() => {
        if (voiceEnabled && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "assistant" && lastMessage.content) {
                speakText(lastMessage.content);
            }
        }
    }, [messages, voiceEnabled]);

    // Auto-restart listening after AI speaks in voice-to-voice mode
    useEffect(() => {
        if (voiceToVoiceMode && !isSpeaking && !isLoading && !isListening) {
            const timer = setTimeout(() => {
                startListening(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [voiceToVoiceMode, isSpeaking, isLoading, isListening]);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setIsListening(false);

                    // Auto-submit if in voice-to-voice mode
                    if (shouldAutoSubmitRef.current) {
                        setTimeout(() => {
                            submitMessage(transcript);
                        }, 500);
                    }
                };

                recognitionRef.current.onerror = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const speakText = (text: string) => {
        if (!voiceEnabled || typeof window === 'undefined') return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleVoice = () => {
        if (voiceEnabled) {
            window.speechSynthesis.cancel();
        }
        setVoiceEnabled(!voiceEnabled);
    };

    const toggleVoiceToVoice = () => {
        const newMode = !voiceToVoiceMode;
        setVoiceToVoiceMode(newMode);

        if (newMode) {
            setVoiceEnabled(true); // Auto-enable voice
            startListening(true);
        } else {
            if (isListening) {
                recognitionRef.current?.stop();
            }
        }
    };

    const startListening = (autoSubmit = false) => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser");
            return;
        }

        window.speechSynthesis.cancel();
        shouldAutoSubmitRef.current = autoSubmit;
        setIsListening(true);
        recognitionRef.current.start();
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            startListening(false);
        }
    };

    const submitMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageContent,
        };

        let currentMessages: Message[] = [];
        setMessages((prev) => {
            currentMessages = [...prev, userMessage];
            return currentMessages;
        });
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/onboarding-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: currentMessages,
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
                                assistantMessage = parsed.content;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === messageId
                                            ? { ...msg, content: assistantMessage }
                                            : msg
                                    )
                                );
                            }
                            if (parsed.complete) {
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
            setHasError(true);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "I'm having trouble connecting right now. This might be a temporary issue with the AI service. Would you like to try the manual form instead? It's a more reliable way to complete your onboarding.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await submitMessage(input);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl h-[600px] flex flex-col shadow-2xl border-border/50">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">AI-Led Onboarding</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {voiceToVoiceMode ? "🎙️ Voice conversation active" : "Let's build your profile together"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-background/50 rounded-lg p-1 border border-border/50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleVoiceToVoice}
                                    className={`h-8 px-2 gap-2 text-xs hover:bg-accent ${voiceToVoiceMode ? 'bg-primary text-primary-foreground' : ''}`}
                                    title={voiceToVoiceMode ? "Exit voice-to-voice mode" : "Enable hands-free voice conversation"}
                                >
                                    <PhoneCall className="w-4 h-4" />
                                    <span className="hidden sm:inline">{voiceToVoiceMode ? "Exit Voice" : "Voice Call"}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleVoice}
                                    className="h-8 px-2 gap-2 text-xs hover:bg-accent"
                                    title={voiceEnabled ? "Mute AI voice" : "Enable AI voice"}
                                    disabled={voiceToVoiceMode}
                                >
                                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    <span className="hidden sm:inline">{voiceEnabled ? "Mute" : "Unmute"}</span>
                                </Button>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = '/onboarding'}
                                className="h-8 px-3 text-xs gap-2"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Exit</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>


                <div className="flex-1 p-6 overflow-y-auto" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <Avatar className="w-8 h-8 bg-primary/10 ring-1 ring-primary/20">
                                        <AvatarFallback>
                                            <Bot className="w-5 h-5 text-primary" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-foreground border border-border"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {message.role === "user" && (
                                    <Avatar className="w-8 h-8 bg-accent">
                                        <AvatarFallback>
                                            <User className="w-5 h-5 text-accent-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <Avatar className="w-8 h-8 bg-primary/10 ring-1 ring-primary/20">
                                    <AvatarFallback>
                                        <Bot className="w-5 h-5 text-primary" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-2xl px-4 py-3 bg-muted border border-border">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="border-t p-4 bg-muted/10">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "🎤 Listening..." : voiceToVoiceMode ? "Voice mode active..." : "Type your answer..."}
                            disabled={isLoading || isListening || voiceToVoiceMode}
                            className="flex-1 bg-background"
                            autoComplete="off"
                        />
                        {!voiceToVoiceMode && (
                            <>
                                <Button
                                    type="button"
                                    onClick={toggleListening}
                                    disabled={isLoading}
                                    className={`${isListening
                                        ? "bg-destructive hover:bg-destructive/90"
                                        : "bg-muted hover:bg-muted/80"
                                        }`}
                                    title={isListening ? "Stop listening" : "Start voice input"}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                        {voiceToVoiceMode && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                                {isListening ? (
                                    <>
                                        <Mic className="w-5 h-5 animate-pulse" />
                                        <span className="text-sm font-medium">Listening...</span>
                                    </>
                                ) : isSpeaking ? (
                                    <>
                                        <Volume2 className="w-5 h-5 animate-pulse" />
                                        <span className="text-sm font-medium">AI Speaking...</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm font-medium">Processing...</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {hasError && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/onboarding'}
                                className="text-sm"
                            >
                                Switch to Manual Form
                            </Button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}
