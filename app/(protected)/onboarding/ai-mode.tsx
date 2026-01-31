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

interface AIOnboardingModeProps {
    onExit?: () => void;
}

export default function AIOnboardingMode({ onExit }: AIOnboardingModeProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! What's your current education level?"
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

    const messagesRef = useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const submitMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: messageContent,
        };

        const currentMessages = [...messagesRef.current, userMessage];
        setMessages(currentMessages);

        // Update ref immediately for safety in this closure
        messagesRef.current = currentMessages;

        setInput("");
        setIsLoading(true);
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
                                window.speechSynthesis.cancel();
                                setTimeout(() => router.push("/dashboard"), 800);
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
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 h-full overflow-hidden">
            <Card className="w-full max-w-3xl h-full md:h-[600px] md:max-h-[85vh] flex flex-col shadow-2xl border-border/50 overflow-hidden">
                <CardHeader className="border-b bg-muted/30 pb-3 md:pb-6">
                    <div className="flex items-center justify-between gap-2">
                        {/* Title - compact on mobile */}
                        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 flex-shrink-0">
                                <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base md:text-xl truncate">AI-Led Onboarding</CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">
                                    Let's build your profile together
                                </p>
                            </div>
                        </div>

                        {/* Voice Controls + Exit - Different on mobile vs desktop */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Voice Chat Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleVoiceToVoice}
                                className={`gap-2 ${voiceToVoiceMode
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    : 'hover:bg-accent'
                                    }`}
                                title="Voice Chat Mode"
                            >
                                <PhoneCall className={`w-4 h-4 ${voiceToVoiceMode ? 'animate-pulse' : ''}`} />
                                <span className="hidden md:inline text-xs font-medium">
                                    {voiceToVoiceMode ? "Stop Voice" : "Voice Chat"}
                                </span>
                            </Button>

                            {/* Volume Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleVoice}
                                className={`gap-2 ${voiceEnabled
                                    ? 'text-green-600 hover:bg-green-500/10'
                                    : 'hover:bg-accent'
                                    }`}
                                title={voiceEnabled ? "Voice Enabled" : "Voice Disabled"}
                                disabled={voiceToVoiceMode}
                            >
                                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                <span className="hidden md:inline text-xs">
                                    {voiceEnabled ? "Voice On" : "Voice Off"}
                                </span>
                            </Button>

                            {/* Exit button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onExit}
                                className="gap-1 md:gap-2"
                            >
                                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline text-xs">Exit</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>



                <div className="flex-1 p-4 md:p-6 overflow-y-auto" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((message, index) => (
                            <div key={message.id}>
                                <div
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

                {/* Error Banner */}
                {hasError && (
                    <div className="mx-4 md:mx-6 mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <div className="text-destructive text-lg">⚠️</div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-destructive mb-1">AI Service Temporarily Unavailable</p>
                                <p className="text-xs text-muted-foreground">We're experiencing high demand. Please use the "Switch to Manual Form" button below instead.</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="border-t bg-muted/10">
                    {/* Quick reply suggestions - only show for first message */}
                    {messages.length === 1 && !isLoading && !voiceToVoiceMode && (
                        <div className="p-3 border-b border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => submitMessage("I'm currently completing my Bachelor's degree")}
                                >
                                    🎓 Completing Bachelor's
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => submitMessage("I have completed my Bachelor's degree")}
                                >
                                    ✅ Completed Bachelor's
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => submitMessage("I'm currently completing my Master's degree")}
                                >
                                    📚 Completing Master's
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8"
                                    onClick={() => submitMessage("I'm in high school (12th grade)")}
                                >
                                    📖 High School
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "🎤 Listening..." : voiceToVoiceMode ? "Voice mode active..." : "Type your answer..."}
                            disabled={isLoading || isListening || voiceToVoiceMode}
                            className="flex-1 bg-background h-11"
                            autoComplete="off"
                        />
                        {!voiceToVoiceMode && (
                            <>
                                <Button
                                    type="button"
                                    onClick={toggleListening}
                                    disabled={isLoading}
                                    size="lg"
                                    className={`h-11 w-11 p-0 ${isListening
                                        ? "bg-destructive hover:bg-destructive/90"
                                        : "bg-muted hover:bg-muted/80 text-foreground"
                                        }`}
                                    title={isListening ? "Stop listening" : "Start voice input"}
                                >
                                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    size="lg"
                                    className="h-11 w-11 p-0 bg-primary hover:bg-primary/90"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                        {voiceToVoiceMode && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg">
                                {isListening ? (
                                    <>
                                        <Mic className="w-5 h-5 animate-pulse text-primary" />
                                        <span className="text-sm font-medium">Listening...</span>
                                    </>
                                ) : isSpeaking ? (
                                    <>
                                        <Volume2 className="w-5 h-5 animate-pulse text-primary" />
                                        <span className="text-sm font-medium">AI Speaking...</span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
                                onClick={() => router.push('/onboarding?mode=manual')}
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
