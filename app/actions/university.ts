"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function lockUniversity(universityId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        // Check if already locked
        const existingLock = await db.lockedUniversity.findFirst({
            where: {
                userId: session.user.id,
            }
        });

        if (existingLock) {
            if (existingLock.universityId === universityId) {
                return { success: true, alreadyLocked: true };
            }
            return { error: "You can only lock one university at a time. Please unlock your current university first." };
        }

        // Create lock
        await db.lockedUniversity.create({
            data: {
                userId: session.user.id,
                universityId: universityId,
            }
        });

        // Update profile to reflect lock (redundant but useful for fast access if needed, though schema has relation)
        // We'll trust the LockedUniversity table as the source of truth for now.

        revalidatePath("/universities");
        revalidatePath("/guidance");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error locking university:", error);
        return { error: "Failed to lock university" };
    }
}

export async function unlockUniversity(universityId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    try {
        await db.lockedUniversity.deleteMany({
            where: {
                userId: session.user.id,
                universityId: universityId,
            }
        });

        revalidatePath("/universities");
        revalidatePath("/guidance");
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error unlocking university:", error);
        return { error: "Failed to unlock university" };
    }
}

export async function getLockedUniversity() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const lockedVal = await db.lockedUniversity.findFirst({
            where: { userId: session.user.id }
        });
        return lockedVal;
    } catch (error) {
        return null;
    }
}
