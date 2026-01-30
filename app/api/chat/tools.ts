import { db } from "@/lib/db";
import { universities } from "@/lib/universities";
import { revalidatePath } from "next/cache";

export interface Tool {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}

export const tools: Tool[] = [
    {
        name: "shortlist_university",
        description: "Add a university to the user's shortlist for consideration. Use this when the user shows interest in a university or asks to save it.",
        parameters: {
            type: "object",
            properties: {
                universityId: {
                    type: "string",
                    description: "The ID of the university to shortlist"
                },
                universityName: {
                    type: "string",
                    description: "The name of the university"
                }
            },
            required: ["universityId", "universityName"]
        }
    },
    {
        name: "lock_university",
        description: "Lock a university choice for the user. This commits them to applying to this university and unlocks application guidance.",
        parameters: {
            type: "object",
            properties: {
                universityId: {
                    type: "string",
                    description: "The ID of the university to lock (e.g., 'mit', 'stanford')"
                }
            },
            required: ["universityId"]
        }
    },
    {
        name: "unlock_university",
        description: "Unlock the currently locked university, allowing the user to choose a different one.",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    },
    {
        name: "create_task",
        description: "Create a new task for the user's to-do list. Use this when the user accepts an action item or you suggest a step they should take.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "The task title (e.g., 'Draft SOP introduction')"
                },
                description: {
                    type: "string",
                    description: "Detailed description of what needs to be done"
                },
                category: {
                    type: "string",
                    enum: ["general", "sop", "exam", "application"],
                    description: "The category of the task (default: general)"
                },
                priority: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "The priority of the task (default: medium)"
                }
            },
            required: ["title", "category", "priority"]
        }
    },
    {
        name: "mark_task_complete",
        description: "Mark a task as completed. Use this when the user confirms they have done something.",
        parameters: {
            type: "object",
            properties: {
                taskId: {
                    type: "string",
                    description: "The ID of the task to mark as complete"
                }
            },
            required: ["taskId"]
        }
    }
];

export async function executeTool(
    toolName: string,
    args: any,
    userId: string
): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        switch (toolName) {
            case "shortlist_university": {
                const { universityId, universityName } = args;

                // Check if already shortlisted
                const existing = await db.shortlistedUniversity.findFirst({
                    where: { userId, universityId }
                });

                if (existing) {
                    return {
                        success: false,
                        message: `${universityName} is already in your shortlist.`
                    };
                }

                // Add to shortlist
                await db.shortlistedUniversity.create({
                    data: {
                        userId,
                        universityId
                    }
                });

                revalidatePath("/dashboard");
                revalidatePath("/universities");
                return {
                    success: true,
                    message: `✓ Added ${universityName} to your shortlist!`,
                    data: { universityId, universityName }
                };
            }

            case "lock_university": {
                const { universityId } = args;

                // Validate university exists in DB, fallback to static list
                let university: any = await db.university.findUnique({
                    where: { id: universityId }
                }).catch(() => null);

                if (!university) {
                    university = universities.find(u => u.id === universityId);
                }

                if (!university) {
                    return {
                        success: false,
                        message: `University with ID '${universityId}' not found.`
                    };
                }

                // Check if user already has a locked university
                const existing = await db.lockedUniversity.findFirst({
                    where: { userId }
                });

                if (existing) {
                    return {
                        success: false,
                        message: `You already have ${existing.universityId} locked. Please unlock it first before locking another university.`
                    };
                }

                // Lock the university
                await db.lockedUniversity.create({
                    data: {
                        userId,
                        universityId
                    }
                });

                revalidatePath("/dashboard");
                revalidatePath("/guidance");
                return {
                    success: true,
                    message: `✓ Successfully locked ${university.name}! Application guidance is now available.`,
                    data: { universityId, universityName: university.name }
                };
            }

            case "unlock_university": {
                const locked = await db.lockedUniversity.findFirst({
                    where: { userId }
                });

                if (!locked) {
                    return {
                        success: false,
                        message: "No university is currently locked."
                    };
                }

                await db.lockedUniversity.delete({
                    where: { id: locked.id }
                });

                revalidatePath("/dashboard");
                return {
                    success: true,
                    message: `✓ Unlocked ${locked.universityId}. You can now lock a different university.`
                };
            }

            case "create_task": {
                const { title, description, category = "general", priority = "medium" } = args;

                const newTask = await db.task.create({
                    data: {
                        userId,
                        title,
                        description: description || "",
                        category,
                        priority,
                        completed: false
                    }
                });

                revalidatePath("/dashboard");
                return {
                    success: true,
                    message: `✓ Created task: "${title}" (${priority} priority).`,
                    data: newTask
                };
            }

            case "mark_task_complete": {
                const { taskId } = args;

                try {
                    const updatedTask = await db.task.update({
                        where: {
                            id: taskId,
                            userId // Ensure user owns the task
                        },
                        data: { completed: true }
                    });

                    revalidatePath("/dashboard");
                    return {
                        success: true,
                        message: `✓ ${updatedTask.title} marked as complete!`,
                        data: updatedTask
                    };
                } catch (e) {
                    return {
                        success: false,
                        message: `Task not found or already completed.`
                    };
                }
            }

            default:
                return {
                    success: false,
                    message: `Unknown tool: ${toolName}`
                };
        }
    } catch (error: any) {
        console.error(`Error executing tool ${toolName}:`, error);
        return {
            success: false,
            message: `Failed to execute ${toolName}: ${error.message}`
        };
    }
}
