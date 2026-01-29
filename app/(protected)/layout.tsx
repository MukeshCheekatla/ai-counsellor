import { redirect } from "next/navigation";
import { auth } from "@/auth";
import TopNav from "@/components/TopNav";

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
        <div className="min-h-screen bg-background">
            <TopNav />
            {children}
        </div>
    );
}
