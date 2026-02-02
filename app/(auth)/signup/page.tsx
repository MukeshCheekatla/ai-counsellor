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

import { toast } from "sonner";

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget);

        try {
            const result = await registerUser(formData);
            if (result?.error) {
                toast.error(result.error);
                setIsLoading(false);
            } else {
                toast.success("Account created successfully! Redirecting...");
            }
        } catch (e) {
            if (e && typeof e === 'object' && 'digest' in e &&
                String((e as any).digest).startsWith('NEXT_REDIRECT')) {
                return;
            }
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Hero Section - Hidden on mobile */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-muted/10 border-r">
                <div className="space-y-8 max-w-lg mx-auto">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="rounded-lg bg-primary p-3">
                            <GraduationCap className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Counsellor</h2>
                            <p className="text-sm text-muted-foreground">Your Study Abroad Guide</p>
                        </div>
                    </Link>

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
            <div className="flex items-center justify-center p-4 md:p-12">
                <div className="w-full max-w-sm md:max-w-md space-y-6">
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
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sign Up
                                </Button>
                                <Button variant="outline" className="w-full" type="button">
                                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
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
