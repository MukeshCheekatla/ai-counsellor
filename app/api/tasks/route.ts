import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { generateProfileTasks } from "@/lib/task-generator";

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

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, category, priority, dueDate, autoGenerate } = body;

        // Auto-generate tasks based on profile
        if (autoGenerate) {
            const profile = await db.userProfile.findUnique({
                where: { userId: session.user.id }
            });

            if (!profile) {
                return NextResponse.json({ error: "Profile not found" }, { status: 404 });
            }

            const generatedTasks = generateProfileTasks(profile);

            // Create tasks in database
            const tasks = await Promise.all(
                generatedTasks.map(task =>
                    db.task.create({
                        data: {
                            userId: session.user.id!,
                            title: task.title,
                            description: task.description,
                            category: task.category,
                            priority: task.priority,
                            dueDate: task.dueDate,
                            completed: false
                        }
                    })
                )
            );

            return NextResponse.json({ tasks, count: tasks.length });
        }

        // Create single task
        const task = await db.task.create({
            data: {
                userId: session.user.id,
                title,
                description,
                category: category || "general",
                priority: priority || "medium",
                dueDate: dueDate ? new Date(dueDate) : null,
                completed: false
            }
        });

        return NextResponse.json(task);
    } catch (error: any) {
        console.error("Task creation error:", error);
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

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get("id");

        if (!taskId) {
            return NextResponse.json({ error: "Task ID required" }, { status: 400 });
        }

        await db.task.delete({
            where: { id: taskId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
