"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, MessageSquare, BookOpen, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface BottomNavProps {
    user?: {
        name?: string | null;
        image?: string | null;
    };
}

export function BottomNav({ user }: BottomNavProps) {
    const pathname = usePathname();

    const routes = [
        {
            href: "/dashboard",
            label: "Home",
            icon: LayoutDashboard,
            active: pathname === "/dashboard",
        },
        {
            href: "/universities",
            label: "Explore",
            icon: Compass,
            active: pathname === "/universities",
        },
        {
            href: "/counsellor",
            label: "Chat",
            icon: MessageSquare,
            active: pathname === "/counsellor",
        },
        {
            href: "/guidance",
            label: "Guide",
            icon: BookOpen,
            active: pathname === "/guidance",
        },
        {
            href: "/profile",
            label: "Profile",
            icon: User, // Fallback icon
            isProfile: true,
            active: pathname === "/profile",
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 px-2 pb-safe-area-inset-bottom">
            <div className="h-full grid grid-cols-5 gap-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${route.active
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary/70"
                            }`}
                    >
                        {route.isProfile && user ? (
                            <Avatar className={`h-6 w-6 ${route.active ? "ring-2 ring-primary ring-offset-1" : ""}`}>
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <route.icon className={`h-5 w-5 ${route.active ? "stroke-[2.5px]" : "stroke-2"}`} />
                        )}
                        <span className="text-[10px] font-medium">{route.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
