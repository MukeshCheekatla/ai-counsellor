"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createTask(data: {
    title: string;
    description?: string;
    priority?: "high" | "medium" | "low";
}) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const task = await db.task.create({
        data: {
            userId: session.user.id,
            title: data.title,
            description: data.description,
            priority: data.priority || "medium",
        },
    });

    revalidatePath("/dashboard");
    return task;
}

export async function getTasks(userId?: string) {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
        throw new Error("Unauthorized");
    }

    const tasks = await db.task.findMany({
        where: { userId: targetUserId },
        orderBy: [
            { completed: "asc" },
            { createdAt: "desc" },
        ],
    });

    return tasks;
}

export async function toggleTaskComplete(taskId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const task = await db.task.findUnique({
        where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
        throw new Error("Task not found or unauthorized");
    }

    const updated = await db.task.update({
        where: { id: taskId },
        data: { completed: !task.completed },
    });

    revalidatePath("/dashboard");
    return updated;
}

export async function deleteTask(taskId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const task = await db.task.findUnique({
        where: { id: taskId },
    });

    if (!task || task.userId !== session.user.id) {
        throw new Error("Task not found or unauthorized");
    }

    await db.task.delete({
        where: { id: taskId },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

// Generate smart tasks based on user profile
export async function generateSmartTasks(userId: string) {
    const profile = await db.userProfile.findUnique({
        where: { userId },
    });

    if (!profile) {
        return [];
    }

    const tasks = [];

    // Check exam status
    if (!profile.examStatus || profile.examStatus === "Not started") {
        tasks.push({
            title: "Complete English Proficiency Test",
            description: "Register and complete IELTS/TOEFL. Target score: 7.0+",
            priority: "high" as const,
        });
    }

    // Check SOP status
    if (!profile.sopStatus || profile.sopStatus === "Not started") {
        tasks.push({
            title: "Draft your Statement of Purpose",
            description: "Start with a rough outline of your academic journey and goals",
            priority: "high" as const,
        });
    }

    // Check university locking
    const lockedUniversity = await db.lockedUniversity.findFirst({
        where: { userId },
    });

    if (!lockedUniversity) {
        tasks.push({
            title: "Short list 5-7 universities",
            description: "Browse universities and lock at least one to proceed",
            priority: "medium" as const,
        });
    }

    // Check if they have GPA
    if (!profile.gpa) {
        tasks.push({
            title: "Update your GPA/percentage",
            description: "Add your academic scores to improve profile strength",
            priority: "low" as const,
        });
    }

    return tasks;
}
