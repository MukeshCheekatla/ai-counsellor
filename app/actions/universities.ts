"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function lockUniversity(universityId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const locked = await db.lockedUniversity.create({
        data: {
            userId: session.user.id,
            universityId,
        },
    });

    revalidatePath("/universities");
    revalidatePath("/dashboard");
    return locked;
}

export async function unlockUniversity(universityId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await db.lockedUniversity.deleteMany({
        where: {
            userId: session.user.id,
            universityId,
        },
    });

    revalidatePath("/universities");
    revalidatePath("/dashboard");
}

export async function getLockedUniversities(userId: string) {
    return await db.lockedUniversity.findMany({
        where: { userId },
    });
}

export async function isUniversityLocked(userId: string, universityId: string) {
    const locked = await db.lockedUniversity.findFirst({
        where: {
            userId,
            universityId,
        },
    });
    return !!locked;
}
