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
import { ArrowLeft, GraduationCap } from "lucide-react"
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
            // NEXT_REDIRECT errors are expected on success - let them pass through
            if (error && typeof error === 'object' && 'digest' in error &&
                String((error as any).digest).startsWith('NEXT_REDIRECT')) {
                // This is actually a successful login redirect
                return;
            }
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return (
            <Card className="mx-auto max-w-sm border-border/50 shadow-xl opacity-50">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

    return (
        <>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <Card className="mx-auto max-w-sm border-border/50 shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20 w-fit mb-2">
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
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" title="Forgot Password" className="ml-auto inline-block text-sm underline hover:text-primary">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    disabled={isLoading}
                                />
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
        </>
    )
}
