"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react"
import { login, socialLogin } from "@/app/actions/login"
import { toast } from "sonner"

export default function LoginPage() {
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const error = await login(undefined, formData);
            if (error) {
                toast.error(error);
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'digest' in error &&
                String((error as any).digest).startsWith('NEXT_REDIRECT')) {
                return;
            }
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="mx-auto max-w-sm border-border/50 shadow-xl opacity-50">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        );
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
                            Welcome Back!
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Continue your journey to studying abroad. Your personalized dashboard is waiting.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Track Your Progress</h3>
                                <p className="text-sm text-muted-foreground">See your application status at a glance</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">AI Assistance</h3>
                                <p className="text-sm text-muted-foreground">Get instant answers to your questions</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-lg bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Task Management</h3>
                                <p className="text-sm text-muted-foreground">Stay on top of deadlines and requirements</p>
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
                            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                            <CardDescription>
                                Enter your email below to login to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <form onSubmit={handleSubmit} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            disabled={isLoading}
                                        />
                                        <Link href="/forgot-password" title="Forgot Password" className="text-sm underline hover:text-primary text-right">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Logging in..." : "Login"}
                                    </Button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full" type="button" onClick={() => socialLogin("google")}>
                                    Login with Google
                                </Button>

                                <div className="mt-2 text-center text-sm">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/signup" className="underline hover:text-primary">
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
