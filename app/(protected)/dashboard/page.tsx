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
        userProfile = await getUserProfile();
    }

    if (!userProfile || !userProfile.onboardingComplete) {
        redirect("/onboarding");
    }

    const profile = userProfile;
    const isLocked = !!lockedUniversity;
    const firstName = session.user.name?.split(" ")[0] || "Student";

    // Get existing tasks (don't create during render)
    const tasks = await getTasks(session.user.id);

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card className="md:col-span-1 h-fit">
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
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Profile Strength</CardTitle>
                        <CardDescription>AI-Estimated Readiness</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Academics</span>
                                <span className="font-medium text-green-600">Strong</span>
                            </div>
                            <Progress value={85} className="h-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Exams ({profile.examStatus || "Pending"})</span>
                                <span className="font-medium text-amber-600">In Progress</span>
                            </div>
                            <Progress value={40} className="h-2" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">SOP Status</span>
                                <span className="font-medium text-muted-foreground">{profile.sopStatus || "Not Started"}</span>
                            </div>
                            <Progress value={profile.sopStatus === "Ready" ? 100 : profile.sopStatus === "Draft" ? 50 : 10} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* AI To-Do List */}
                <Card className="md:col-span-1 md:row-span-2">
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
                            {/* Task 1: Done */}
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20 opacity-60">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium line-through">Complete Onboarding Profile</p>
                                    <p className="text-xs text-muted-foreground">Mandatory for AI analysis</p>
                                </div>
                            </div>

                            {/* Task 2: Discovery */}
                            {!isLocked ? (
                                <div className="flex items-center gap-4 p-3 rounded-lg border border-primary/20 bg-background shadow-sm">
                                    <Circle className="h-6 w-6 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Shortlist & Lock Utility</p>
                                        <p className="text-xs text-muted-foreground">Browse universities and lock your target.</p>
                                    </div>
                                    <Link href="/universities">
                                        <Button size="sm" variant="outline">Browse <ArrowRight className="ml-2 h-3 w-3" /></Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20 opacity-60">
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium line-through">Lock University Choice</p>
                                        <p className="text-xs text-muted-foreground">Target locked.</p>
                                    </div>
                                </div>
                            )}


                            {/* Task 3: Application */}
                            {isLocked ? (
                                <div className="flex items-center gap-4 p-3 rounded-lg border border-primary/20 bg-background shadow-sm">
                                    <Circle className="h-6 w-6 text-primary" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Start Application Documents</p>
                                        <p className="text-xs text-muted-foreground">Begin SOP and document gathering.</p>
                                    </div>
                                    <Link href="/guidance">
                                        <Button size="sm">Start <ArrowRight className="ml-2 h-3 w-3" /></Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-3 rounded-lg border bg-background text-muted-foreground opacity-50">
                                    <Lock className="h-6 w-6" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Start Application Guidance</p>
                                        <p className="text-xs">Locked until university is selected.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
