import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainNav } from "@/components/MainNav";
import { BottomNav } from "@/components/BottomNav";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <MainNav user={session.user} />
            {children}
            <BottomNav user={session.user} />
        </div>
    );
}
