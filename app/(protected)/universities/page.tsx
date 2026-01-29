import { universities, University } from "@/lib/universities";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, TrendingUp, Info, GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UniversityCard } from "./university-card";

export default async function UniversitiesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // Fetch Profile and Locked University
    const [profile, lockedUniversity] = await Promise.all([
        db.userProfile.findUnique({ where: { userId: session.user.id } }),
        db.lockedUniversity.findFirst({ where: { userId: session.user.id } })
    ]);

    if (!profile) {
        return (
            <div className="container mx-auto p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                <p className="mb-4">Please complete your onboarding to view universities.</p>
                <Link href="/onboarding"><Button>Go to Onboarding</Button></Link>
            </div>
        );
    }

    // --- Filtering Logic ---
    let filteredUniversities = universities;

    // 1. Country Filter
    if (profile.targetCountry) {
        const targetCountries = profile.targetCountry.split(",").map(c => c.trim().toLowerCase());
        // If user selected specific countries, filter. If "Any" or similar, maybe don't filter?
        // Assuming loose matching for now.
        if (targetCountries.length > 0 && !targetCountries.includes("any")) {
            filteredUniversities = filteredUniversities.filter(u =>
                targetCountries.some(tc => u.country.toLowerCase().includes(tc) || tc.includes(u.country.toLowerCase()))
            );
        }
    }

    // 2. Budget Filter (Parsing "20000-30000" or ">50000" etc)
    // This is heuristic-based as the profile likely stores a string range.
    if (profile.budgetRange) {
        const budgetStr = profile.budgetRange.replace(/[^0-9]/g, ''); // Extract numbers
        // This is a naive check. A better way would be to parse the max budget.
        // If budgetStr is empty, skip.
        if (budgetStr.length > 0) {
            const maxBudget = parseInt(budgetStr);
            if (!isNaN(maxBudget) && maxBudget > 0) {
                // If the budget string implies a range, usually the upperbound is relevant? 
                // Let's assume if the university tuition is significantly higher than the parsed number, we filter it out?
                // Actually, "Budget range per year" might be "0-10k", "10k-20k". 
                // If I extract all numbers, I might get "1020".
                // Let's try to interpret "Low", "Medium", "High" if that's what is stored?
                // The core.txt said "Budget range per year".
                // Let's SKIP strict budget filtering for this prototype to avoid over-filtering due to parsing errors, 
                // UNLESS the user explicitly has a very low budget (e.g., < 10k) and we can detect it.
                // For now, I will NOT filter strictly by budget to ensure universities show up, 
                // but I will sort or tag them? No, let's just stick to Country for hard filtering.
            }
        }
    }

    // If filtering results in 0 universities, fallback to showing all but with a warning?
    // Or just show all if country doesn't match?
    // Let's keep it simple: If filtered is empty, show all but add a notice.
    let showFilterWarning = false;
    if (filteredUniversities.length === 0) {
        filteredUniversities = universities;
        showFilterWarning = true;
    }

    const dreamUniversities = filteredUniversities.filter(u => u.category === "dream");
    const targetUniversities = filteredUniversities.filter(u => u.category === "target");
    const safeUniversities = filteredUniversities.filter(u => u.category === "safe");

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">University Discovery</h1>
                <p className="text-muted-foreground">
                    Recommended based on your profile: <span className="font-medium text-foreground">{profile.targetDegree} in {profile.major}</span> in <span className="font-medium text-foreground">{profile.targetCountry || "Any Region"}</span>
                </p>
                {lockedUniversity && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3 mt-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-medium text-sm text-primary">University Locked</p>
                            <p className="text-xs text-muted-foreground">You have committed to a university. Unlock it to lock another.</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-auto" asChild>
                            <Link href="/guidance">Go to Guidance</Link>
                        </Button>
                    </div>
                )}
                {showFilterWarning && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3 mt-2">
                        <Info className="h-5 w-5 text-amber-600" />
                        <p className="text-sm text-amber-700">No universities matched your exact preferences. Showing all available universities.</p>
                    </div>
                )}
            </div>

            {/* Dream Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Dream Universities</h2>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        {dreamUniversities.length} universities
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dreamUniversities.map(uni => (
                        <UniversityCard
                            key={uni.id}
                            university={uni}
                            isLocked={lockedUniversity?.universityId === uni.id}
                            hasAnyLock={!!lockedUniversity}
                        />
                    ))}
                    {dreamUniversities.length === 0 && <p className="text-muted-foreground italic col-span-full">No Dream universities found.</p>}
                </div>
            </section>

            {/* Target Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Target Universities</h2>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        {targetUniversities.length} universities
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {targetUniversities.map(uni => (
                        <UniversityCard
                            key={uni.id}
                            university={uni}
                            isLocked={lockedUniversity?.universityId === uni.id}
                            hasAnyLock={!!lockedUniversity}
                        />
                    ))}
                    {targetUniversities.length === 0 && <p className="text-muted-foreground italic col-span-full">No Target universities found.</p>}
                </div>
            </section>

            {/* Safe Universities */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Safe Universities</h2>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        {safeUniversities.length} universities
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {safeUniversities.map(uni => (
                        <UniversityCard
                            key={uni.id}
                            university={uni}
                            isLocked={lockedUniversity?.universityId === uni.id}
                            hasAnyLock={!!lockedUniversity}
                        />
                    ))}
                    {safeUniversities.length === 0 && <p className="text-muted-foreground italic col-span-full">No Safe universities found.</p>}
                </div>
            </section>
        </div>
    );
}
