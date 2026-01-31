"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen overflow-hidden flex items-center justify-center bg-muted/50 relative">
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            {children}
        </div>
    )
}
