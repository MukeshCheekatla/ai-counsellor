import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainNav } from "@/components/MainNav";
import { BottomNav } from "@/components/BottomNav";
import { db } from "@/lib/db";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check onboarding completion
    let profile = null;
    try {
        profile = await db.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        // If no profile or onboarding incomplete, redirect to onboarding
        if (!profile || !profile.onboardingComplete) {
            redirect("/onboarding");
        }
    } catch (error) {
        console.error("Database connection error:", error);
        // Continue rendering if DB fails (graceful degradation)
    }

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            <MainNav user={session.user} />
            {children}
            <BottomNav user={session.user} />
        </div>
    );
}
