"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function lockUniversity(universityId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.lockedUniversity.create({
            data: {
                userId: session.user.id,
                universityId,
            },
        });

        revalidatePath("/universities");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { error: "University already locked" };
        }
        return { error: "Failed to lock university" };
    }
}

export async function unlockUniversity(universityId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        await db.lockedUniversity.deleteMany({
            where: {
                userId: session.user.id,
                universityId,
            },
        });

        revalidatePath("/universities");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Failed to unlock university" };
    }
}

export async function getLockedUniversities(userId: string) {
    const locked = await db.lockedUniversity.findMany({
        where: { userId },
        select: { universityId: true },
    });

    return locked.map(l => l.universityId);
}
