import { db } from "@/lib/db";
import { universities } from "@/lib/universities";

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
        description: "Create a new task for the user's to-do list.",
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
                }
            },
            required: ["title", "description"]
        }
    },
    {
        name: "mark_task_complete",
        description: "Mark a task as completed.",
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
            case "lock_university": {
                const { universityId } = args;

                // Validate university exists
                const university = universities.find(u => u.id === universityId);
                if (!university) {
                    return {
                        success: false,
                        message: `University with ID '${universityId}' not found. Available IDs: ${universities.map(u => u.id).join(', ')}`
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

                return {
                    success: true,
                    message: `✓ Unlocked ${locked.universityId}. You can now lock a different university.`
                };
            }

            case "create_task": {
                // TODO: Task model needs to be added to Prisma schema
                // For now, return success message without actual DB operation
                const { title, description } = args;

                return {
                    success: true,
                    message: `✓ Task noted: "${title}". (Task management coming soon)`,
                    data: { title, description }
                };
            }

            case "mark_task_complete": {
                // TODO: Task model needs to be added to Prisma schema
                const { taskId } = args;

                return {
                    success: true,
                    message: `✓ Task marked as complete. (Full task management coming soon)`,
                    data: { taskId }
                };
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
