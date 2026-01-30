"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { toggleTaskComplete } from "@/app/actions/tasks";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
    task: {
        id: string;
        title: string;
        description: string | null;
        completed: boolean;
        priority: string;
        category: string;
    };
}

export function TaskItem({ task }: TaskItemProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            await toggleTaskComplete(task.id);
        });
    };

    return (
        <div
            onClick={handleToggle}
            className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md",
                task.completed ? "bg-muted/20 opacity-60 border-transparent" : "bg-background border-primary/20 hover:border-primary/30",
                isPending && "opacity-50 pointer-events-none"
            )}
        >
            {task.completed ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            ) : (
                <Circle className={cn(
                    "h-6 w-6 shrink-0",
                    task.priority === "high" ? "text-red-500" : "text-primary"
                )} />
            )}

            <div className="flex-1">
                <p className={cn("text-sm font-medium", task.completed && "line-through")}>
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                    </p>
                )}
            </div>

            {task.priority === "high" && !task.completed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    High
                </span>
            )}
        </div>
    );
}
