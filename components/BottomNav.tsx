"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, MessageSquare, BookOpen } from "lucide-react";

export function BottomNav() {
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
            label: "AI Chat",
            icon: MessageSquare,
            active: pathname === "/counsellor",
        },
        {
            href: "/guidance",
            label: "Guide",
            icon: BookOpen,
            active: pathname === "/guidance",
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 px-4 pb-safe-area-inset-bottom">
            <div className="h-full grid grid-cols-4 gap-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={`flex flex-col items-center justify-center gap-1 transition-colors ${route.active
                                ? "text-primary"
                                : "text-muted-foreground hover:text-primary/70"
                            }`}
                    >
                        <route.icon className={`h-5 w-5 ${route.active ? "stroke-[2.5px]" : "stroke-2"}`} />
                        <span className="text-[10px] font-medium">{route.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
