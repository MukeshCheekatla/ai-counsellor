"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, GraduationCap, MapPin, User, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load data from local storage
        const storedProfile = localStorage.getItem("user_profile");
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="p-8">Loading dashboard...</div>;
    }

    // Fallback defaults if no profile found (debugging/testing)
    const profile = userProfile || {
        firstName: "Student",
        targetDegree: "Master's",
        targetCountry: "USA",
        major: "Computer Science",
        educationLevel: "Bachelor's"
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, future {profile.targetDegree} student.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/counsellor">
                        <Button>
                            Chat with AI Counsellor
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stage Tracker */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Current Stage: University Discovery</CardTitle>
                        <Badge variant="secondary">Step 2 of 4</Badge>
                    </div>
                    <CardDescription>You have completed your profile. Now it's time to find your best-fit universities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={50} className="h-2 mb-4" />
                    <div className="grid grid-cols-4 text-center text-xs sm:text-sm text-muted-foreground">
                        <div className="text-primary font-medium">Profile</div>
                        <div className="text-primary font-bold">Discovery</div>
                        <div className="">Shortlisting</div>
                        <div className="">Application</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Summary */}
                <Card className="md:col-span-1">
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
                                <p className="text-sm text-muted-foreground">{profile.targetDegree} in {profile.major}</p>
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
                                <p className="text-sm font-medium">Current Level</p>
                                <p className="text-sm text-muted-foreground capitalize">{profile.educationLevel}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI To-Do List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Action Plan</CardTitle>
                            <Badge>3 Pending</Badge>
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
                            {/* Task 2: Active */}
                            <div className="flex items-center gap-4 p-3 rounded-lg border border-primary/20 bg-background shadow-sm">
                                <Circle className="h-6 w-6 text-primary" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Ask AI for University Recommendations</p>
                                    <p className="text-xs text-muted-foreground">Go to the Counsellor tab and ask "Suggest universities for me"</p>
                                </div>
                                <Link href="/counsellor">
                                    <Button size="sm" variant="outline">Start <ArrowRight className="ml-2 h-3 w-3" /></Button>
                                </Link>
                            </div>
                            {/* Task 3: Waiting */}
                            <div className="flex items-center gap-4 p-3 rounded-lg border bg-background text-muted-foreground">
                                <Clock className="h-6 w-6" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Lock at least 1 University</p>
                                    <p className="text-xs">Required to unlock Application Guidance</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
