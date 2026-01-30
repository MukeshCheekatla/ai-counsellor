import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { matchUniversities, getRecommendedUniversities } from "@/lib/university-matcher";

import { universities as staticUniversities } from "@/lib/universities";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const country = searchParams.get("country");
        const category = searchParams.get("category");
        const useMatching = searchParams.get("match") === "true";

        const where: any = {};
        if (country) where.country = country;
        if (category) where.category = category;

        let universities: any[] = [];
        let usingFallback = false;

        try {
            universities = await db.university.findMany({
                where,
                orderBy: [
                    { category: "asc" },
                    { ranking: "asc" }
                ]
            });
        } catch (dbError) {
            console.warn("Database fetch failed, attempting fallback:", dbError);
            usingFallback = true;
        }

        if (universities.length === 0) {
            console.log("Database Empty or Error. Using Static Fallback.");
            // Map static data to match DB schema
            universities = staticUniversities.filter(u => {
                if (country && u.country !== country) return false;
                if (category && u.category !== category) return false;
                return true;
            }).map(u => ({
                id: u.id,
                name: u.name,
                country: u.country,
                city: u.location.split(',')[0].trim(),
                ranking: u.ranking,
                tuitionFee: u.tuitionPerYear,
                acceptanceRate: u.acceptanceRate,
                category: u.category,
                programName: u.programs[0] || "General",
                programType: "Master's",
                requirements: JSON.stringify({ gpa: u.requiredGPA }),
                scholarships: true
            }));
            usingFallback = true;
        }

        // If matching is requested, get user profile and return matched universities
        if (useMatching) {
            let profile = null;
            try {
                profile = await db.userProfile.findUnique({
                    where: { userId: session.user.id }
                });
            } catch (e) {
                console.warn("Profile fetch failed");
            }

            if (profile && profile.onboardingComplete) {
                const matches = matchUniversities(universities, profile);
                const recommendations = getRecommendedUniversities(matches, 50);

                return NextResponse.json({
                    matched: true,
                    dream: recommendations.dream,
                    target: recommendations.target,
                    safe: recommendations.safe,
                    all: recommendations.all
                });
            }
        }

        return NextResponse.json(universities);
    } catch (error: any) {
        console.error("Universities API error:", error);
        // Even in top-level catch, try to return static data if possible?
        // But for now 500 is fine if auth fails etc.
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
