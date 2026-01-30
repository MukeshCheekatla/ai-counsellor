"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveUserProfile(data: any) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        // Upsert the profile
        await db.userProfile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                educationLevel: data.educationLevel,
                major: data.major,
                graduationYear: data.graduationYear,
                gpa: data.gpa,
                fieldOfStudy: data.fieldOfStudy,
                targetDegree: data.targetDegree,
                targetCountry: data.targetCountry,
                intakeYear: data.intakeYear,
                budgetRange: data.budgetRange,
                fundingSource: data.fundingSource,
                examStatus: data.examStatus,
                greGmatStatus: data.greGmatStatus,
                sopStatus: data.sopStatus,
                onboardingComplete: true,
            },
            update: {
                educationLevel: data.educationLevel,
                major: data.major,
                graduationYear: data.graduationYear,
                gpa: data.gpa,
                fieldOfStudy: data.fieldOfStudy,
                targetDegree: data.targetDegree,
                targetCountry: data.targetCountry,
                intakeYear: data.intakeYear,
                budgetRange: data.budgetRange,
                fundingSource: data.fundingSource,
                examStatus: data.examStatus,
                greGmatStatus: data.greGmatStatus,
                sopStatus: data.sopStatus,
                onboardingComplete: true,
            },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error saving profile:", error);
        return { error: "Failed to save profile" };
    }
}

export async function updateUserProfile(data: any) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        // Update the profile
        await db.userProfile.update({
            where: { userId: session.user.id },
            data: {
                educationLevel: data.educationLevel,
                major: data.major,
                graduationYear: data.graduationYear,
                gpa: data.gpa,
                fieldOfStudy: data.fieldOfStudy,
                targetDegree: data.targetDegree,
                targetCountry: data.targetCountry,
                intakeYear: data.intakeYear,
                budgetRange: data.budgetRange,
                fundingSource: data.fundingSource,
                examStatus: data.examStatus,
                greGmatStatus: data.greGmatStatus,
                sopStatus: data.sopStatus,
            },
        });

        // Revalidate all pages that depend on profile
        revalidatePath("/dashboard");
        revalidatePath("/universities");
        revalidatePath("/profile");
        revalidatePath("/counsellor");

        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile" };
    }
}

export async function getUserProfile() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    try {
        const profile = await db.userProfile.findUnique({
            where: { userId: session.user.id }
        });
        return profile;
    } catch (error) {
        return null;
    }
}
