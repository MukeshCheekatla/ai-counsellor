import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const locked = await db.lockedUniversity.findMany({
            where: { userId: session.user.id }
        });

        return NextResponse.json(locked);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { universityId } = await req.json();

        // Check if already locked
        const existing = await db.lockedUniversity.findFirst({
            where: {
                userId: session.user.id,
                universityId
            }
        });

        if (existing) {
            return NextResponse.json(existing);
        }

        const locked = await db.lockedUniversity.create({
            data: {
                userId: session.user.id,
                universityId
            }
        });

        // Update user stage to preparing
        await db.userProfile.update({
            where: { userId: session.user.id },
            data: { currentStage: "preparing_applications" }
        });

        // Create initial tasks
        await db.task.createMany({
            data: [
                {
                    userId: session.user.id,
                    title: "Complete Statement of Purpose (SOP)",
                    description: "Write a compelling SOP highlighting your goals and fit",
                    category: "sop",
                    priority: "high"
                },
                {
                    userId: session.user.id,
                    title: "Prepare Letters of Recommendation",
                    description: "Contact professors and employers for LORs",
                    category: "application",
                    priority: "high"
                },
                {
                    userId: session.user.id,
                    title: "Submit standardized test scores",
                    description: "Send official IELTS/TOEFL and GRE scores",
                    category: "exam",
                    priority: "medium"
                }
            ]
        });

        return NextResponse.json(locked);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { universityId } = await req.json();

        // Find the locked record
        const existing = await db.lockedUniversity.findFirst({
            where: {
                userId: session.user.id,
                universityId
            }
        });

        if (!existing) {
            return NextResponse.json({ error: "Not locked" }, { status: 404 });
        }

        // Delete it
        await db.lockedUniversity.delete({
            where: { id: existing.id }
        });

        // Optional: Revert stage? 
        // Logic: If no locked universities left, revert to discovery?
        // But for now, just unlocking is enough.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
