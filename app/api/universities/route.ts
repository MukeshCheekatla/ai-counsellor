import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { matchUniversities, getRecommendedUniversities } from "@/lib/university-matcher";

export async function GET(req: Request) {
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

        const universities = await db.university.findMany({
            where,
            orderBy: [
                { category: "asc" },
                { ranking: "asc" }
            ]
        });

        // If matching is requested, get user profile and return matched universities
        if (useMatching) {
            const profile = await db.userProfile.findUnique({
                where: { userId: session.user.id }
            });

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

        return NextResponse.json({
            matched: false,
            universities
        });
    } catch (error: any) {
        console.error("Universities API error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
