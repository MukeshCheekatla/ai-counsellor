import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/auth";
import { getUserProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import { LogOut, User, Mail, GraduationCap, MapPin, Award } from "lucide-react";
import { logout } from "@/app/actions/auth";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const profile = await getUserProfile();
    const user = session.user;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-2xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-[24px_1fr] gap-4 items-center">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                    </CardContent>
                </Card>

                {profile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" /> Education Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
