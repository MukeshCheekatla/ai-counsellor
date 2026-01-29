"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, GraduationCap, Plane, Wallet, BookOpen } from "lucide-react";
import { saveUserProfile, getUserProfile } from "@/app/actions/profile";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        // Step 1: Academic
        educationLevel: "",
        major: "",
        gpa: "",
        // Step 2: Goals
        targetDegree: "",
        targetCountry: "",
        intakeYear: "",
        // Step 3: Budget
        budgetRange: "",
        fundingSource: "",
        // Step 4: Readiness
        examStatus: "",
        sopStatus: "",
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        educationLevel: profile.educationLevel || "",
                        major: profile.major || "",
                        gpa: profile.gpa || "",
                        targetDegree: profile.targetDegree || "",
                        targetCountry: profile.targetCountry || "",
                        intakeYear: profile.intakeYear || "",
                        budgetRange: profile.budgetRange || "",
                        fundingSource: profile.fundingSource || "",
                        examStatus: profile.examStatus || "",
                        sopStatus: profile.sopStatus || "",
                    }));
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const totalSteps = 4;
    const progress = (step / totalSteps) * 100;

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setSaving(true);
        try {
            await saveUserProfile(formData);
            // Save to local storage as backup/mock compatibility
            localStorage.setItem("user_profile", JSON.stringify(formData));
            localStorage.setItem("onboarding_complete", "true");
            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <div className="mb-8 text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Setup your profile</h1>
                <p className="text-muted-foreground">Let's personalize your AI Counsellor experience.</p>
                <Progress value={progress} className="h-2 w-full max-w-md mx-auto" />
                <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
            </div>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {step === 1 && <GraduationCap size={24} />}
                            {step === 2 && <Plane size={24} />}
                            {step === 3 && <Wallet size={24} />}
                            {step === 4 && <BookOpen size={24} />}
                        </div>
                        <div>
                            <CardTitle>
                                {step === 1 && "Academic Background"}
                                {step === 2 && "Study Goals"}
                                {step === 3 && "Budget & Funding"}
                                {step === 4 && "Readiness Check"}
                            </CardTitle>
                            <CardDescription>
                                {step === 1 && "Tell us about your current education."}
                                {step === 2 && "Where and what do you want to study?"}
                                {step === 3 && "Help us find universities within your range."}
                                {step === 4 && "How prepared are you for the application?"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Academic */}
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>Current Education Level</Label>
                                <Select onValueChange={(val) => handleInputChange("educationLevel", val)} defaultValue={formData.educationLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high_school">High School (12th Grade)</SelectItem>
                                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                        <SelectItem value="master">Master's Degree</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Major / Stream</Label>
                                <Input
                                    placeholder="e.g. Computer Science, Business, PCM"
                                    value={formData.major}
                                    onChange={(e) => handleInputChange("major", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>GPA / Percentage</Label>
                                <Input
                                    placeholder="e.g. 3.8 GPA or 85%"
                                    value={formData.gpa}
                                    onChange={(e) => handleInputChange("gpa", e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Step 2: Goals */}
                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label>Intended Degree</Label>
                                <Select onValueChange={(val) => handleInputChange("targetDegree", val)} defaultValue={formData.targetDegree}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select degree" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                                        <SelectItem value="master">Master's / MBA</SelectItem>
                                        <SelectItem value="phd">PhD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Preferred Country</Label>
                                <Select onValueChange={(val) => handleInputChange("targetCountry", val)} defaultValue={formData.targetCountry}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usa">USA</SelectItem>
                                        <SelectItem value="uk">UK</SelectItem>
                                        <SelectItem value="canada">Canada</SelectItem>
                                        <SelectItem value="australia">Australia</SelectItem>
                                        <SelectItem value="germany">Germany</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Target Intake Year</Label>
                                <Select onValueChange={(val) => handleInputChange("intakeYear", val)} defaultValue={formData.intakeYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                        <SelectItem value="2027">2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* Step 3: Budget */}
                    {step === 3 && (
                        <>
                            <div className="space-y-2">
                                <Label>Annual Budget Range (USD)</Label>
                                <Select onValueChange={(val) => handleInputChange("budgetRange", val)} defaultValue={formData.budgetRange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select budget" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Under $20k</SelectItem>
                                        <SelectItem value="medium">$20k - $40k</SelectItem>
                                        <SelectItem value="high">$40k - $60k</SelectItem>
                                        <SelectItem value="premium">$60k+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Funding Source</Label>
                                <Select onValueChange={(val) => handleInputChange("fundingSource", val)} defaultValue={formData.fundingSource}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="self">Self / Family Funded</SelectItem>
                                        <SelectItem value="loan">Education Loan</SelectItem>
                                        <SelectItem value="scholarship">Scholarship Dependent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* Step 4: Readiness */}
                    {step === 4 && (
                        <>
                            <div className="space-y-2">
                                <Label>English Proficiency (IELTS/TOEFL)</Label>
                                <Select onValueChange={(val) => handleInputChange("examStatus", val)} defaultValue={formData.examStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="booked">Exam Booked</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Statement of Purpose (SOP) Status</Label>
                                <Select onValueChange={(val) => handleInputChange("sopStatus", val)} defaultValue={formData.sopStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="drafting">Drafting</SelectItem>
                                        <SelectItem value="ready">Ready to Submit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={saving}>
                        {step === totalSteps ? (
                            saving ? "Saving..." : (
                                <span className="flex items-center gap-2">
                                    Finish <CheckCircle2 className="w-4 h-4" />
                                </span>
                            )
                        ) : (
                            "Next"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
