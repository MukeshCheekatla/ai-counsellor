"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <Card className="mx-auto max-w-sm border-border/50 shadow-xl">
            <CardHeader className="text-center space-y-2">
                <div className="mx-auto rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20 w-fit mb-2">
                    <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
                <CardDescription>
                    {!submitted
                        ? "No worries, we'll send you reset instructions."
                        : "Check your email for instructions."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending..." : "Reset Password"}
                        </Button>
                        <div className="text-center text-sm">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-8 w-8" />
                            <p className="text-sm font-medium">
                                If an account exists for that email, we've sent password reset instuctions.
                            </p>
                        </div>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
