import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, GraduationCap, MapPin, User, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getTasks } from "@/app/actions/tasks";
import { CircularProgress } from "@/components/ui/circular-progress";
import { TaskItem } from "./TaskItem";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get user profile and locked university with error handling
    let userProfile = null;
    let lockedUniversity = null;

    try {
        [userProfile, lockedUniversity] = await Promise.all([
            getUserProfile(),
            db.lockedUniversity.findFirst({
                where: { userId: session.user.id }
            }).catch(() => null) // Gracefully handle if table doesn't exist yet
        ]);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to null profile, which triggers onboarding or empty state
        userProfile = null;
    }

    if (!userProfile || !userProfile.onboardingComplete) {
        redirect("/onboarding");
    }

    const profile = userProfile;
    const isLocked = !!lockedUniversity;
    const firstName = session.user.name?.split(" ")[0] || "Student";

    // Get existing tasks (don't create during render)
    let tasks: any = [];
    try {
        tasks = await getTasks(session.user.id);
    } catch (e) {
        console.error("Dashboard tasks fetch failed:", e);
        tasks = []; // Fallback to empty tasks
    }

    // Calculate profile strength
    const calculateStrength = (field: string | null | undefined, weight: number = 1) => {
        if (!field || field === "Not started") return 0;
        if (field === "Completed" || field === "Ready") return 100 * weight;
        if (field === "In progress" || field === "Draft") return 50 * weight;
        return 30 * weight; // Has some value
    };

    const academicScore = (profile.gpa ? 100 : 50);
    const examScore = calculateStrength(profile.examStatus);
    const sopScore = calculateStrength(profile.sopStatus);
    const overallStrength = (academicScore + examScore + sopScore) / 3;

    // Determine Stage
    // Stage 1: Profile (Done)
    // Stage 2: Discovery (Default)
    // Stage 3: Shortlisting (Skipping for simplicity in this prototype, merging with Discovery)
    // Stage 4: Application (If Locked)

    const currentStage = isLocked ? 4 : 2;
    const progress = isLocked ? 75 : 50;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {firstName}.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/universities">
                        <Button variant="outline">
                            Discover Universities
                        </Button>
                    </Link>
                    <Link href="/counsellor">
                        <Button variant="outline">
                            Chat with AI Counsellor
                        </Button>
                    </Link>
                    {isLocked && (
                        <Link href="/guidance">
                            <Button>
                                Application Guidance
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Stage Tracker */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">
                            Current Stage: {isLocked ? "Preparing Applications" : "University Discovery"}
                        </CardTitle>
                        <Badge variant={isLocked ? "default" : "secondary"}>Step {currentStage} of 4</Badge>
                    </div>
                    <CardDescription>
                        {isLocked
                            ? "You have locked your university choice. Follow the guidance to apply."
                            : "You have completed your profile. Now it's time to find your best-fit universities."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-2 mb-4" />
                    <div className="grid grid-cols-4 text-center text-xs sm:text-sm text-muted-foreground">
                        <div className="text-primary font-medium">Profile</div>
                        <div className={`font-medium ${currentStage >= 2 ? "text-primary" : ""}`}>Discovery</div>
                        <div className={`font-medium ${currentStage >= 3 ? "text-primary" : ""}`}>Shortlisting</div>
                        <div className={`font-medium ${currentStage >= 4 ? "text-primary" : ""}`}>Application</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Target Degree</p>
                                <p className="text-sm text-muted-foreground capitalize">{profile.targetDegree}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Target Country</p>
                                <p className="text-sm text-muted-foreground capitalize">{profile.targetCountry}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Previous Education</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {profile.major ? `${profile.major} ` : ""}({profile.educationLevel})
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Strength Analysis */}
                <Card className="lg:col-span-2 h-fit">
                    <CardHeader>
                        <CardTitle>Profile Strength</CardTitle>
                        <CardDescription>AI-Estimated Readiness</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                            {/* Academics Circle */}
                            <div className="flex flex-col items-center gap-3">
                                <CircularProgress
                                    value={academicScore}
                                    size={100}
                                    strokeWidth={8}
                                    showValue={true}
                                />
                                <div className="text-center">
                                    <p className="text-sm font-medium">{academicScore >= 80 ? "Strong" : academicScore >= 50 ? "Average" : "Developing"}</p>
                                    <p className="text-xs text-muted-foreground">Academics</p>
                                </div>
                            </div>

                            {/* Exams Circle */}
                            <div className="flex flex-col items-center gap-3">
                                <CircularProgress
                                    value={examScore}
                                    size={100}
                                    strokeWidth={8}
                                    showValue={true}
                                />
                                <div className="text-center">
                                    <p className="text-sm font-medium">{profile.examStatus || "Pending"}</p>
                                    <p className="text-xs text-muted-foreground">Exams</p>
                                </div>
                            </div>

                            {/* SOP Circle */}
                            <div className="flex flex-col items-center gap-3">
                                <CircularProgress
                                    value={sopScore}
                                    size={100}
                                    strokeWidth={8}
                                    showValue={true}
                                />
                                <div className="text-center">
                                    <p className="text-sm font-medium">{profile.sopStatus || "Not Started"}</p>
                                    <p className="text-xs text-muted-foreground">SOP Status</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI To-Do List */}
                <Card className="lg:col-span-3 lg:row-span-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Action Plan</CardTitle>
                            <Badge variant={tasks.filter((t: any) => !t.completed).length === 0 ? "outline" : "default"}>
                                {tasks.filter((t: any) => !t.completed).length} Pending
                            </Badge>
                        </div>
                        <CardDescription>AI-generated tasks based on your current stage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                    <p>No tasks yet.</p>
                                    <p className="text-sm mt-1">Ask the AI Counsellor for a study plan!</p>
                                    <Link href="/counsellor" className="mt-4 inline-block">
                                        <Button variant="outline" size="sm">
                                            Chat with AI
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                tasks.map((task: any) => (
                                    // Use type assertion or proper type if available
                                    <TaskItem key={task.id} task={{
                                        id: task.id,
                                        title: task.title,
                                        description: task.description,
                                        completed: task.completed,
                                        priority: task.priority,
                                        category: task.category
                                    }} />
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
