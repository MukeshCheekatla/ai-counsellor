import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainNav } from "@/components/MainNav";
import { BottomNav } from "@/components/BottomNav";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { PageContainer } from "@/components/PageContainer";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Get current pathname to detect onboarding for the redirect ONLY
    const headersList = await headers();
    const serverPathname = headersList.get("x-invoke-path") || headersList.get("referer") || "";
    const isCurrentlyOnOnboarding = serverPathname.includes("/onboarding");

    // Check onboarding completion
    try {
        const profile = await db.userProfile.findUnique({
            where: { userId: session.user.id },
        });

        // Redirect to onboarding if incomplete, but only if we're not ALREADY there
        if (!isCurrentlyOnOnboarding && (!profile || !profile.onboardingComplete)) {
            redirect("/onboarding");
        }
    } catch (error) {
        console.error("Database connection error:", error);
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <MainNav user={session.user} />
            <PageContainer>
                {children}
            </PageContainer>
            <BottomNav user={session.user} />
        </div>
    );
}
