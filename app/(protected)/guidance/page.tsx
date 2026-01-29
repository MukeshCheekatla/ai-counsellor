import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Calendar, Lock, ArrowRight, ListTodo } from "lucide-react";
import { universities } from "@/lib/universities";
import { Badge } from "@/components/ui/badge";

export default async function GuidancePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const lockedLock = await db.lockedUniversity.findFirst({
        where: { userId: session.user.id }
    });

    if (!lockedLock) {
        return (
            <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
                    <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-3xl font-bold">Guidance Locked</h1>
                    <p className="text-muted-foreground">
                        You must lock a university to access application guidance, document checklists, and timelines.
                    </p>
                </div>
                <Button asChild size="lg">
                    <Link href="/universities">
                        Browse Universities <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        );
    }

    const lockedUni = universities.find(u => u.id === lockedLock.universityId);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-2 border-b pb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    University Locked: {lockedUni?.name || "Unknown University"}
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Application Guidance</h1>
                <p className="text-muted-foreground">
                    Your personalized roadmap to getting into {lockedUni?.name}.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Documents Column */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" /> Required Documents
                        </CardTitle>
                        <CardDescription>Prepare these PDFs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-amber-500 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium block">Statement of Purpose (SOP)</span>
                                    <span className="text-xs text-muted-foreground">Draft needed by next week</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium block">Letter of Recommendation (3x)</span>
                                    <span className="text-xs text-muted-foreground">Contact professors asap</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-green-500 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium block">Transcripts</span>
                                    <span className="text-xs text-muted-foreground">Official copies required</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                                <div className="text-sm">
                                    <span className="font-medium block">Resume / CV</span>
                                    <span className="text-xs text-muted-foreground">Academic format</span>
                                </div>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Timeline Column */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" /> Application Timeline
                        </CardTitle>
                        <CardDescription>Key dates and deadlines</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative pl-2">
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                        <div className="relative flex gap-4">
                            <div className="h-3 w-3 mt-1.5 rounded-full bg-primary ring-4 ring-background z-10" />
                            <div>
                                <p className="text-sm font-medium">Profile Preparation</p>
                                <p className="text-xs text-muted-foreground">Now - 1 Month</p>
                            </div>
                        </div>
                        <div className="relative flex gap-4">
                            <div className="h-3 w-3 mt-1.5 rounded-full bg-muted ring-4 ring-background z-10 border border-border" />
                            <div>
                                <p className="text-sm font-medium">Document Gathering</p>
                                <p className="text-xs text-muted-foreground">Month 2</p>
                            </div>
                        </div>
                        <div className="relative flex gap-4">
                            <div className="h-3 w-3 mt-1.5 rounded-full bg-muted ring-4 ring-background z-10 border border-border" />
                            <div>
                                <p className="text-sm font-medium">Application Submission</p>
                                <p className="text-xs text-muted-foreground">Month 3</p>
                            </div>
                        </div>
                        <div className="relative flex gap-4">
                            <div className="h-3 w-3 mt-1.5 rounded-full bg-muted ring-4 ring-background z-10 border border-border" />
                            <div>
                                <p className="text-sm font-medium">Visa Process</p>
                                <p className="text-xs text-muted-foreground">Month 4-5</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Counsellor Tasks */}
                <Card className="md:col-span-1 h-fit border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <ListTodo className="h-5 w-5" /> AI Counsellor Tasks
                        </CardTitle>
                        <CardDescription>Generated for your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                            <div className="h-5 w-5 rounded border border-primary flex items-center justify-center">
                                {/* Checkbox placeholder */}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Draft SOP Intro</p>
                                <p className="text-xs text-muted-foreground">Focus on your motivation for {lockedUni?.programs?.[0] || "your major"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                            <div className="h-5 w-5 rounded border border-primary flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Schedule IELTS</p>
                                <p className="text-xs text-muted-foreground">Target score: 7.5+</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border shadow-sm">
                            <div className="h-5 w-5 rounded border border-primary flex items-center justify-center">
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Shortlist Professors</p>
                                <p className="text-xs text-muted-foreground">Find 2 labs at {lockedUni?.name?.split(" ")[0] || "university"}</p>
                            </div>
                        </div>
                        <Button className="w-full" size="sm" variant="outline">Ask AI for help</Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
