import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, LogOut } from "lucide-react";
import { ClientNav } from "./ClientNav";

export default async function TopNav() {
    const session = await auth();

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                        <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    AI Counsellor
                </Link>

                {session?.user ? (
                    <div className="flex items-center gap-4">
                        <ClientNav />
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium">{session.user.name}</p>
                                <p className="text-xs text-muted-foreground">{session.user.email}</p>
                            </div>
                        </div>
                        <form action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}>
                            <Button variant="ghost" size="sm" type="submit">
                                <LogOut className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Logout</span>
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <ClientNav />
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
