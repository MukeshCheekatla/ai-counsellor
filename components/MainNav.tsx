"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/app/actions/auth";

interface MainNavProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    isOnboarding?: boolean;
}

export function MainNav({ user, isOnboarding = false }: MainNavProps) {
    const pathname = usePathname();

    const routes = [
        {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname === "/dashboard",
        },
        {
            href: "/universities",
            label: "Discovery",
            active: pathname === "/universities",
        },
        {
            href: "/counsellor",
            label: "AI Counsellor",
            active: pathname === "/counsellor",
        },
        // We can add Guidance conditionally if we want, or just let users find it via dashboard/universities.
        // Let's add it but maybe it'll redirect if locked.
        {
            href: "/guidance",
            label: "Guidance",
            active: pathname === "/guidance",
        }
    ];

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo & Desktop Nav */}
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <span className="hidden md:inline-block">AI Counsellor</span>
                    </Link>

                    {!isOnboarding && (
                        <div className="hidden lg:flex items-center gap-4">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${route.active ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    {route.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {user.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{user.name}</span>
                            </Link>
                            <form action={async () => {
                                await logout();
                            }}>
                                <Button variant="ghost" size="icon" type="submit" className="text-muted-foreground hover:text-foreground" title="Sign Out">
                                    <LogOut className="h-5 w-5" />
                                    <span className="sr-only">Logout</span>
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
