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
        return { error: `Failed to create account: ${error.message || "Unknown error"}` };
    }

    // Auto-login after successful creation - will redirect, never returns
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/onboarding",
    });
}

import { signOut } from "@/auth";

export async function logout() {
    await signOut({ redirectTo: "/" });
}
