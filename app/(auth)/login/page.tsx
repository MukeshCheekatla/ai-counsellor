"use client";

import Link from "next/link"
import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
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
import { GraduationCap } from "lucide-react"
import { login, socialLogin } from "@/app/actions/login"

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Logging in..." : "Login"}
        </Button>
    )
}

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(login, undefined);

    return (
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
                <form action={dispatch} className="grid gap-4">
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
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    {errorMessage && (
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    )}
                    <LoginButton />
                    <Button variant="outline" className="w-full" type="button" onClick={() => socialLogin("google")}>
                        Login with Google
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline hover:text-primary">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
