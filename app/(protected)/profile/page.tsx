"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Mail, GraduationCap, MapPin, Award, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, updateUserProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [profile, setProfile] = useState<any>(null);
    const [formData, setFormData] = useState({
        educationLevel: "",
        major: "",
        gpa: "",
        targetDegree: "",
        targetCountry: "",
        intakeYear: "",
        budgetRange: "",
        fundingSource: "",
        examStatus: "",
        sopStatus: "",
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getUserProfile();
                if (data) {
                    setProfile(data);
                    setFormData({
                        educationLevel: data.educationLevel || "",
                        major: data.major || "",
                        gpa: data.gpa || "",
                        targetDegree: data.targetDegree || "",
                        targetCountry: data.targetCountry || "",
                        intakeYear: data.intakeYear || "",
                        budgetRange: data.budgetRange || "",
                        fundingSource: data.fundingSource || "",
                        examStatus: data.examStatus || "",
                        sopStatus: data.sopStatus || "",
                    });
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const result = await updateUserProfile(formData);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess("Profile updated successfully!");
                // Refresh profile data
                const data = await getUserProfile();
                if (data) {
                    setProfile(data);
                }
                setIsEditing(false);
                // Refresh the page to update other components
                router.refresh();
            }
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form data to original profile
        if (profile) {
            setFormData({
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
            });
        }
        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-2xl">
                <div className="text-center">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 max-w-2xl">
            <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4 text-center">
                <Avatar className="h-16 w-16 md:h-24 md:w-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                        {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">{session?.user?.name}</h1>
                    <p className="text-sm md:text-base text-muted-foreground">{session?.user?.email}</p>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-700 text-sm">
                    {success}
                </div>
            )}

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" /> Account Details
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[24px_1fr] gap-4 items-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{session?.user?.email}</span>
                        </div>
                    </CardContent>
                </Card>

                {profile && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" /> Education Profile
                                </CardTitle>
                                {!isEditing ? (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-2" /> Edit Profile
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleSave} disabled={saving}>
                                            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                                            <X className="h-4 w-4 mr-2" /> Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isEditing ? (
                                <>
                                    <div className="grid grid-cols-[24px_1fr] gap-4 items-center">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-medium">Target Country</p>
                                            <p className="text-muted-foreground capitalize">{profile.targetCountry}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[24px_1fr] gap-4 items-center">
                                        <Award className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-medium">Target Degree</p>
                                            <p className="text-muted-foreground capitalize">{profile.targetDegree}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[24px_1fr] gap-4 items-center">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <div className="text-sm">
                                            <p className="font-medium">Previous Education</p>
                                            <p className="text-muted-foreground capitalize">{profile.major} ({profile.educationLevel})</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Current Education Level</Label>
                                        <Select onValueChange={(val) => handleInputChange("educationLevel", val)} value={formData.educationLevel}>
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
                                    <div className="space-y-2">
                                        <Label>Target Degree</Label>
                                        <Select onValueChange={(val) => handleInputChange("targetDegree", val)} value={formData.targetDegree}>
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
                                        <Label>Target Country</Label>
                                        <Select onValueChange={(val) => handleInputChange("targetCountry", val)} value={formData.targetCountry}>
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
                                        <Select onValueChange={(val) => handleInputChange("intakeYear", val)} value={formData.intakeYear}>
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
                                    <div className="space-y-2">
                                        <Label>Budget Range (USD)</Label>
                                        <Select onValueChange={(val) => handleInputChange("budgetRange", val)} value={formData.budgetRange}>
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
                                        <Select onValueChange={(val) => handleInputChange("fundingSource", val)} value={formData.fundingSource}>
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
                                    <div className="space-y-2">
                                        <Label>English Proficiency Status</Label>
                                        <Select onValueChange={(val) => handleInputChange("examStatus", val)} value={formData.examStatus}>
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
                                        <Label>SOP Status</Label>
                                        <Select onValueChange={(val) => handleInputChange("sopStatus", val)} value={formData.sopStatus}>
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
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <form action={logout} className="w-full">
                    <Button variant="destructive" className="w-full" size="lg">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </form>
            </div>
        </div>
    );
}
