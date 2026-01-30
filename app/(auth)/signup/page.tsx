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
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react"
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
            } else if (result) {
                // Success, redirect to login
                router.push("/login?signup=success");
            }
        } catch (e) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
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
        </>
    )
}
