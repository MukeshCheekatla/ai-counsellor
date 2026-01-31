"use client";

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { registerUser } from "@/app/actions/auth"
import { socialLogin } from "@/app/actions/login"

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget);

        try {
            const result = await registerUser(formData);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            } else {
                const { toast } = await import("sonner");
                toast.success("Account created successfully! Redirecting...");
            }
        } catch (e) {
            if (e && typeof e === 'object' && 'digest' in e &&
                String((e as any).digest).startsWith('NEXT_REDIRECT')) {
                return;
            }
            setError("Something went wrong");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Hero Section - Hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-muted/10 border-r">
                <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <div className="space-y-8 max-w-lg">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary p-3">
                            <GraduationCap className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Counsellor</h2>
                            <p className="text-sm text-muted-foreground">Your Study Abroad Guide</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-bold tracking-tight leading-tight">
                            Start Your Journey Today
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Join thousands of students using AI to navigate their study abroad process with confidence.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">AI-Powered Matching</h3>
                                <p className="text-sm text-muted-foreground">Get personalized university recommendations</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Voice Onboarding</h3>
                                <p className="text-sm text-muted-foreground">Complete your profile naturally via chat</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Application Guidance</h3>
                                <p className="text-sm text-muted-foreground">Step-by-step tasks and timelines</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-6">
                    <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>

                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="text-center space-y-2">
                            <div className="lg:hidden mx-auto rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20 w-fit mb-2">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                            <CardDescription>
                                Enter your information to start your journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign Up
                                </Button>
                                <Button variant="outline" className="w-full" type="button" onClick={() => socialLogin("google")}>
                                    Sign up with Google
                                </Button>
                            </form>
                            <div className="mt-4 text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline hover:text-primary">
                                    Sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
