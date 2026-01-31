"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, Mic, Volume2, VolumeX, Trash2, PhoneCall, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function CounsellorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [voiceToVoiceMode, setVoiceToVoiceMode] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);
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
                speak(lastMessage.content);
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

    // Initialize voice features
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize speech synthesis
            synthRef.current = window.speechSynthesis;

            // Initialize speech recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    setIsListening(false);

                    // Auto-submit if in voice-to-voice mode
                    if (shouldAutoSubmitRef.current) {
                        setTimeout(() => {
                            handleSubmitWithText(transcript);
                        }, 500);
                    }
                };

                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
                setVoiceEnabled(true);
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const startListening = (autoSubmit = false) => {
        if (recognitionRef.current && !isListening) {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
            shouldAutoSubmitRef.current = autoSubmit;
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const speak = (text: string) => {
        if (synthRef.current) {
            // Cancel any ongoing speech
            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            synthRef.current.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmitWithText(input);
    };

    const handleSubmitWithText = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = "";

            const assistantId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                { id: assistantId, role: "assistant", content: "" },
            ]);

            // Stream the response
            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.type === "content") {
                                assistantMessage += parsed.content;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantId
                                            ? { ...m, content: assistantMessage }
                                            : m
                                    )
                                );
                            } else if (parsed.type === "action") {
                                // Show action as toast notification (don't add to chat)
                                toast.success(parsed.message, {
                                    duration: 3000,
                                    position: "bottom-right"
                                });
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
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

    const clearChat = () => {
        setMessages([]);
        setInput("");
    };

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl h-[calc(100vh-8rem)] flex flex-col shadow-xl border-border/50">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                <Bot className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    AI Counsellor <Sparkles className="h-4 w-4 text-amber-500" />
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Ask anything about your study abroad plans
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearChat}
                            title="Clear Chat"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <ScrollArea ref={scrollRef} className="h-full p-4 md:p-6">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-70">
                                <Bot className="h-16 w-16 text-primary/50" />
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">
                                        Welcome to your AI Counsellor
                                    </h3>
                                    <p className="max-w-md text-sm text-muted-foreground">
                                        I can help you find universities, understand visa requirements, explore scholarships, or choose a major. Pick a topic to get started:
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-6">
                                    <Button
                                        variant="outline"
                                        className="h-auto py-3 px-4 text-left justify-start hover:border-primary hover:bg-primary/5"
                                        onClick={() =>
                                            handleSubmitWithText("What are the best universities for Computer Science in the USA?")
                                        }
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">🎓 University Search</span>
                                            <span className="text-xs text-muted-foreground">Best CS universities in USA</span>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto py-3 px-4 text-left justify-start hover:border-primary hover:bg-primary/5"
                                        onClick={() =>
                                            handleSubmitWithText("How much budget do I need for a Master's degree abroad?")
                                        }
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">💰 Budget Planning</span>
                                            <span className="text-xs text-muted-foreground">Master's degree costs</span>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto py-3 px-4 text-left justify-start hover:border-primary hover:bg-primary/5"
                                        onClick={() =>
                                            handleSubmitWithText("What documents do I need for a student visa?")
                                        }
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">✈️ Visa Requirements</span>
                                            <span className="text-xs text-muted-foreground">Student visa documents</span>
                                        </div>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto py-3 px-4 text-left justify-start hover:border-primary hover:bg-primary/5"
                                        onClick={() =>
                                            handleSubmitWithText("What scholarships are available for international students?")
                                        }
                                    >
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">🎯 Scholarships</span>
                                            <span className="text-xs text-muted-foreground">Funding opportunities</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 ${m.role === "user" ? "flex-row-reverse" : ""
                                        }`}
                                >
                                    <Avatar className="h-8 w-8 mt-1 shrink-0">
                                        <AvatarFallback
                                            className={
                                                m.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                            }
                                        >
                                            {m.role === "user" ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Bot className="h-4 w-4" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`flex flex-col max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"
                                            }`}
                                    >
                                        <div
                                            className={`p-4 rounded-2xl transition-all duration-200 hover:shadow-md ${m.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-md hover:shadow-lg"
                                                : "bg-muted text-foreground rounded-tl-none border hover:bg-muted/80"
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {m.content}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1 px-1 uppercase tracking-wider font-semibold">
                                            {m.role === "user" ? "You" : "Counsellor"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-8 w-8 mt-1 animate-pulse">
                                        <AvatarFallback className="bg-muted">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="p-4 bg-muted rounded-2xl rounded-tl-none border animate-pulse flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 border-t bg-muted/10">
                    <form
                        onSubmit={handleSubmit}
                        className="flex w-full items-center space-x-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type your message..."}
                            className="flex-1 bg-background h-12 rounded-xl focus-visible:ring-primary focus-visible:ring-2 shadow-inner transition-all duration-200 hover:shadow-md"
                            disabled={isLoading || isListening}
                        />
                        {voiceEnabled && (
                            <>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={voiceToVoiceMode ? "default" : "outline"}
                                    className={`h-12 w-12 rounded-xl ${voiceToVoiceMode ? "bg-primary hover:bg-primary/90" : ""}`}
                                    onClick={toggleVoiceToVoice}
                                    disabled={isLoading}
                                    title="Voice-to-Voice Mode"
                                >
                                    <PhoneCall className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={isListening ? "default" : "outline"}
                                    className={`h-12 w-12 rounded-xl ${isListening ? "animate-pulse bg-primary hover:bg-primary/90" : ""}`}
                                    onClick={isListening ? stopListening : () => startListening(false)}
                                    disabled={isLoading || voiceToVoiceMode}
                                >
                                    {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                                </Button>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    className="h-12 w-12 rounded-xl"
                                    onClick={isSpeaking ? stopSpeaking : () => { }}
                                    disabled={!isSpeaking}
                                >
                                    {isSpeaking ? (
                                        <Volume2 className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <VolumeX className="h-5 w-5" />
                                    )}
                                </Button>
                            </>
                        )}
                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 rounded-xl transition-transform hover:scale-110"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
