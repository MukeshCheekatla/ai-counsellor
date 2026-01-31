"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(prevState: string | undefined, formData: FormData) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirectTo: "/onboarding",
        });
    } catch (error) {
        // NextAuth throws NEXT_REDIRECT on successful login - this is expected
        // Check if it's a redirect error (successful login)
        if (error && typeof error === 'object' && 'digest' in error &&
            String(error.digest).startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function socialLogin(provider: string) {
    await signIn(provider, { redirectTo: "/onboarding" });
}
