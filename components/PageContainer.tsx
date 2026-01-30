"use client";

import { usePathname } from "next/navigation";

export function PageContainer({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isOnboarding = pathname?.includes("/onboarding");

    return (
        <main className={`flex-1 flex flex-col overflow-y-auto ${isOnboarding ? "" : "pb-16 lg:pb-0"}`}>
            {children}
        </main>
    );
}
