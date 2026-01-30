import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainNav } from "@/components/MainNav";
import { BottomNav } from "@/components/BottomNav";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get current pathname to detect onboarding
    const headersList = await headers();
    const referer = headersList.get("referer") || "";
    const pathname = headersList.get("x-invoke-path") || referer;
    const isOnboardingPage = pathname.includes("/onboarding");

    console.log("Layout - pathname:", pathname, "isOnboarding:", isOnboardingPage); // Debug

    // Check onboarding completion (but skip check if already on onboarding page)
    if (!isOnboardingPage) {
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
    }

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            <MainNav user={session.user} isOnboarding={isOnboardingPage} />
            {children}
            <BottomNav user={session.user} isOnboarding={isOnboardingPage} />
        </div>
    );
}
