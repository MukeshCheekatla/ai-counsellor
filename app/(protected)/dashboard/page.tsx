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

    // Get locked university details if exists
    let lockedUniDetails = null;
    if (lockedUniversity) {
        try {
            lockedUniDetails = await db.university.findUnique({
                where: { id: (lockedUniversity as any).universityId }
            });
        } catch (e) {
            console.error("Failed to fetch locked university details:", e);
        }
    }

    const currentStage = isLocked ? 4 : 2;
    const progress = isLocked ? 75 : 50;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-6xl">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Welcome back, {firstName}.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/universities">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            Discover Universities
                        </Button>
                        <Button variant="outline" size="sm" className="md:hidden text-xs">
                            Discover
                        </Button>
                    </Link>
                    <Link href="/counsellor">
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            Chat with AI Counsellor
                        </Button>
                        <Button variant="outline" size="sm" className="md:hidden text-xs">
                            Chat AI
                        </Button>
                    </Link>
                    {isLocked && (
                        <Link href="/guidance">
                            <Button size="sm" className="text-xs md:text-sm">
                                Guidance
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Lock Warning Banner */}
            {!isLocked && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Lock a University to Proceed</h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                    To unlock application guidance and personalized tasks, you need to lock at least one university from your shortlist.
                                </p>
                                <Link href="/universities">
                                    <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700">
                                        Browse & Lock Universities <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Clean Stage Tracker */}
            <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Current Stage</p>
                        <h3 className="text-base font-bold">{isLocked ? "Preparing Applications" : "University Discovery"}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-2 w-2 rounded-full ${step <= currentStage ? "bg-primary" : "bg-muted"
                                    }`}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">{currentStage}/4</span>
                    </div>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            {/* Locked University Card - PROMINENT DISPLAY */}
            {isLocked && lockedUniDetails && (
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-200 dark:border-indigo-800 shadow-md">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <Badge className="mb-2 bg-indigo-500 hover:bg-indigo-600">PRIMARY CHOICE</Badge>
                                <CardTitle className="text-2xl text-indigo-950 dark:text-indigo-100">{lockedUniDetails.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {lockedUniDetails.city}, {lockedUniDetails.country}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <Link href="/universities">
                                    <Button variant="outline" size="sm">
                                        Manage Lock
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="font-semibold capitalize">{lockedUniDetails.category}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Ranking</p>
                            <p className="font-semibold">#{lockedUniDetails.ranking}</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Tuition</p>
                            <p className="font-semibold">${lockedUniDetails.tuitionFee.toLocaleString()}/yr</p>
                        </div>
                        <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Acceptance</p>
                            <p className="font-semibold text-green-600">{lockedUniDetails.acceptanceRate}%</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* First-Time User Tips */}
            {!isLocked && tasks.length === 0 && (
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    👋 Quick Start Guide
                                </h3>
                                <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold">1.</span>
                                        <p><strong>Explore Universities</strong> - Browse Dream/Target/Safe options matched to your profile</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold">2.</span>
                                        <p><strong>Ask AI Counsellor</strong> - Get personalized recommendations and advice</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-bold">3.</span>
                                        <p><strong>Lock Your Choice</strong> - Commit to a university to unlock application guidance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}


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
                                <p className="text-sm text-muted-foreground uppercase">{profile.targetDegree}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Target Country</p>
                                <p className="text-sm text-muted-foreground uppercase">{profile.targetCountry}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Previous Education</p>
                                <p className="text-sm text-muted-foreground">
                                    {profile.major ? <span className="capitalize">{profile.major}</span> : ""} <span className="uppercase">({profile.educationLevel})</span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Strength - Actionable Insights */}
                <Card className="lg:col-span-2 h-fit">
                    <CardHeader>
                        <CardTitle>Profile Strength & Next Steps</CardTitle>
                        <CardDescription>AI-powered recommendations to improve your application</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Academics */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {academicScore >= 70 ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-amber-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium">Academic Profile</p>
                                        <Badge variant={academicScore >= 70 ? "default" : "secondary"}>
                                            {academicScore >= 80 ? "Strong" : academicScore >= 70 ? "Good" : "Developing"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {academicScore >= 70
                                            ? "Your academic background is competitive for most programs."
                                            : "Consider improving your GPA or test scores to strengthen your profile."}
                                    </p>
                                </div>
                            </div>

                            {/* Exams */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {examScore === 0 ? (
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    ) : examScore >= 70 ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-amber-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium">Test Scores</p>
                                        <Badge variant={examScore >= 70 ? "default" : "outline"}>
                                            {examScore === 0 ? "Not Started" : examScore >= 70 ? "Ready" : "In Progress"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {examScore === 0
                                            ? "Take required tests (IELTS/TOEFL, GRE/GMAT) to unlock more opportunities."
                                            : examScore >= 70
                                                ? "Your test scores meet most university requirements."
                                                : "Continue preparing - higher scores open more options."}
                                    </p>
                                </div>
                            </div>

                            {/* SOP */}
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    {sopScore === 0 ? (
                                        <Clock className="h-5 w-5 text-amber-600" />
                                    ) : sopScore >= 70 ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-amber-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium">Statement of Purpose</p>
                                        <Badge variant={sopScore >= 70 ? "default" : "outline"}>
                                            {sopScore === 0 ? "Not Started" : sopScore >= 70 ? "Ready" : "In Progress"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {sopScore === 0
                                            ? "Draft your SOP after locking a university to tell your unique story."
                                            : sopScore >= 70
                                                ? "Your SOP is ready for review and submission."
                                                : "Keep refining - a strong SOP makes you stand out."}
                                    </p>
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
