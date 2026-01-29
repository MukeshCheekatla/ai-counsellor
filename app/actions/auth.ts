"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

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

        console.log("User registered successfully");
        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Failed to create account" };
    }
}
