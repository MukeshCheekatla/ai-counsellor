"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Registering user:", { name, email });

    if (!email || !password || !name) {
        return { error: "Missing fields" };
    }

    try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "Email already in use" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        console.log("User registered successfully. Attempting auto-login...");
    } catch (error: any) {
        console.error("Registration error full details:", error);

        // Return user-friendly error messages, not technical details
        if (error.code === 'P2002') {
            return { error: "This email is already registered" };
        }
        return { error: "Unable to create account. Please try again later." };
    }

    // Auto-login after successful creation - will redirect, never returns
    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/onboarding",
        });
    } catch (error) {
        // NextAuth throws NEXT_REDIRECT on successful login - this is expected
        if (error && typeof error === 'object' && 'digest' in error &&
            String(error.digest).startsWith('NEXT_REDIRECT')) {
            throw error; // Re-throw to allow redirect to proceed
        }
        // If it's not a redirect error, return the error
        console.error("Auto-login error:", error);
        return { error: "Account created but auto-login failed. Please login manually." };
    }
}

import { signOut } from "@/auth";

export async function logout() {
    await signOut({ redirectTo: "/" });
}
