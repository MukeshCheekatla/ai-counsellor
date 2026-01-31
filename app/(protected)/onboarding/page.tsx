"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, GraduationCap, Plane, Wallet, BookOpen, Bot, FileText, ArrowLeft } from "lucide-react";
import { saveUserProfile, getUserProfile } from "@/app/actions/profile";
import AIOnboardingMode from "./ai-mode";
import { toast } from "sonner";

export default function OnboardingPage() {
    const router = useRouter();
    const [mode, setMode] = useState<"select" | "ai" | "manual">("select");
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        // Step 1: Academic
        educationLevel: "",
        major: "",
        graduationYear: "",
        gpa: "",
        // Step 2: Goals
        targetDegree: "",
        fieldOfStudy: "",
        targetCountry: "",
        intakeYear: "",
        // Step 3: Budget
        budgetRange: "",
        fundingSource: "",
        // Step 4: Readiness
        examStatus: "",
        greGmatStatus: "",
        sopStatus: "",
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    // If onboarding is already complete, redirect to dashboard
                    if (profile.onboardingComplete) {
                        router.push("/dashboard");
                        return;
                    }

                    setFormData(prev => ({
                        ...prev,
                        educationLevel: profile.educationLevel || "",
                        major: profile.major || "",
                        graduationYear: profile.graduationYear || "",
                        gpa: profile.gpa || "",
                        targetDegree: profile.targetDegree || "",
                        fieldOfStudy: profile.fieldOfStudy || "",
                        targetCountry: profile.targetCountry || "",
                        intakeYear: profile.intakeYear || "",
                        budgetRange: profile.budgetRange || "",
                        fundingSource: profile.fundingSource || "",
                        examStatus: profile.examStatus || "",
                        greGmatStatus: profile.greGmatStatus || "",
                        sopStatus: profile.sopStatus || "",
                    }));
                } else {
                    // New user - show welcome toast
                    toast.success("Welcome! Let's set up your profile.");
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

    // Validation helpers

    const getStepName = (currentStep: number) => {
        switch (currentStep) {
            case 1: return "Academic Background";
            case 2: return "Study Goals";
            case 3: return "Budget & Funding";
            case 4: return "Readiness Check";
            default: return "";
        }
    };

    const getRequiredFieldsForStep = (currentStep: number) => {
        switch (currentStep) {
            case 1:
                return ["educationLevel", "major", "graduationYear"];
            case 2:
                return ["targetDegree", "fieldOfStudy", "targetCountry", "intakeYear"];
            case 3:
                return ["budgetRange", "fundingSource"];
            case 4:
                return ["examStatus", "greGmatStatus", "sopStatus"];
            default:
                return [];
        }
    };

    const hasEmptyRequiredFields = (currentStep: number) => {
        const required = getRequiredFieldsForStep(currentStep);
        return required.some(field => !formData[field as keyof typeof formData]);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        // Validate required fields
        if (hasEmptyRequiredFields(step)) {
            toast.error("Please complete all required fields.", {
                description: `${getStepName(step)} is incomplete.`
            });
            return;
        }

        // Proceed to next step
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
            toast.success("Profile saved successfully!");
            // Redirect to dashboard
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to save profile", error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Show AI mode if selected
    if (mode === "ai") {
        return <AIOnboardingMode />;
    }

    // Show mode selection
    if (mode === "select") {
        return (
            <div className="container max-w-4xl mx-auto py-16 px-4">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Welcome! Let's get started</h1>
                    <p className="text-lg text-muted-foreground">Choose how you'd like to complete your profile</p>
                </div>


                <div className="grid md:grid-cols-2 gap-6">
                    {/* Manual Form Mode */}
                    <Card className="border-2 hover:border-primary transition-all duration-300 cursor-pointer group hover:shadow-xl hover:scale-[1.02]" onClick={() => setMode("manual")}>
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center ring-1 ring-accent-foreground/20 mb-4">
                                <FileText className="w-6 h-6 text-accent-foreground" />
                            </div>
                            <CardTitle className="text-xl">Manual Form</CardTitle>
                            <CardDescription>Fill out a step-by-step form</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">Complete a structured form with clear fields and options.</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✓ Traditional form format</li>
                                <li>✓ Clear structure</li>
                                <li>✓ Full control over inputs</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">Start Form</Button>
                        </CardFooter>
                    </Card>

                    {/* AI-Led Mode */}
                    <Card className="border-2 hover:border-primary transition-all duration-300 cursor-pointer group hover:shadow-xl hover:scale-[1.02]" onClick={() => setMode("ai")}>
                        <CardHeader>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mb-4">
                                <Bot className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">AI-Led Onboarding</CardTitle>
                            <CardDescription>Chat with your AI counsellor</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">Have a natural conversation with the AI to build your profile.</p>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>✓ Conversational and guided</li>
                                <li>✓ Quick and intuitive</li>
                                <li>✓ Recommended for first-timers</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">Start AI Chat</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    // Show manual form (mode === "manual")
    return (
        <div className="container max-w-2xl mx-auto py-4 md:py-6 px-4">
            {/* Back to mode selection */}
            <div className="flex justify-start mb-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("select")}
                    className="h-8 px-3 text-xs gap-2"
                >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Mode</span>
                </Button>
            </div>

            <div className="mb-4 text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Setup your profile</h1>
                <p className="text-sm text-muted-foreground">Let's personalize your AI Counsellor experience.</p>
                <Progress value={progress} className="h-2 w-full max-w-md mx-auto mt-3" />
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

                <CardContent className="space-y-4">
                    {/* Step 1: Academic */}
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    Current Education Level
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select onValueChange={(val) => handleInputChange("educationLevel", val)} defaultValue={formData.educationLevel}>
                                    <SelectTrigger >
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
                                <Label className="flex items-center gap-1">
                                    Major / Stream
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Computer Science, Business, PCM"
                                    value={formData.major}
                                    onChange={(e) => handleInputChange("major", e.target.value)}

                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    Graduation Year
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select onValueChange={(val) => handleInputChange("graduationYear", val)} defaultValue={formData.graduationYear}>
                                    <SelectTrigger >
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                        <SelectItem value="2027">2027</SelectItem>
                                        <SelectItem value="2028">2028</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <Label className="flex items-center gap-1">
                                    Field of Study
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Computer Science, Mechanical Engineering, Business Analytics"
                                    value={formData.fieldOfStudy}
                                    onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}

                                />
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
                                <Label>GRE / GMAT Status</Label>
                                <Select onValueChange={(val) => handleInputChange("greGmatStatus", val)} defaultValue={formData.greGmatStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="booked">Exam Booked</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="not_required">Not Required</SelectItem>
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

