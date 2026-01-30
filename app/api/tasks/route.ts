import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tasks = await db.task.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { completed: "asc" },
                { priority: "desc" },
                { createdAt: "desc" }
            ]
        });

        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { taskId, completed } = await req.json();

        const task = await db.task.update({
            where: { id: taskId },
            data: { completed }
        });

        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
