"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, GraduationCap, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";

interface Task {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    priority: string;
    category: string;
    dueDate: string | null;
}

export default function GuidancePage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = async (taskId: string, completed: boolean) => {
        try {
            await fetch("/api/tasks", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, completed: !completed })
            });
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, completed: !completed } : t
            ));
        } catch (error) {
            console.error("Failed to toggle task:", error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "bg-red-100 text-red-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            default: return "bg-blue-100 text-blue-800";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "sop": return <FileText className="w-4 h-4" />;
            case "exam": return <GraduationCap className="w-4 h-4" />;
            case "application": return <ClipboardList className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (loading) {
        return <div className="p-8">Loading your guidance...</div>;
    }

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <div className="min-h-screen p-6 bg-muted/20">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Application Guidance</h1>
                        <p className="text-muted-foreground">Follow these steps to complete your applications</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/universities")}>
                        Back to Universities
                    </Button>
                </div>

                {/* Progress Card */}
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                                <p className="text-sm opacity-80">Overall Progress</p>
                                <h2 className="text-2xl font-bold">{Math.round(progress)}% Complete</h2>
                            </div>
                            <div className="p-3 bg-white/20 rounded-full">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-white h-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="mt-3 text-sm opacity-80">
                            {completedCount} of {tasks.length} tasks finished
                        </p>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Your Personalized To-Do List
                    </h3>

                    {tasks.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No tasks yet. Lock a university to generate your application timeline!</p>
                                <Button className="mt-4" onClick={() => router.push("/universities")}>
                                    Explore Universities
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        tasks.map(task => (
                            <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <button
                                            onClick={() => toggleTask(task.id, task.completed)}
                                            className="mt-1 transition-colors"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500 fill-green-50" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </button>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                                    {task.title}
                                                </h4>
                                                <Badge className={getPriorityColor(task.priority)}>
                                                    {task.priority.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {task.description}
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                                                    {getCategoryIcon(task.category)}
                                                    {task.category.toUpperCase()}
                                                </Badge>
                                                {task.dueDate && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
