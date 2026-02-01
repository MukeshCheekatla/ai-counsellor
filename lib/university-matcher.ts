import { UserProfile } from "@prisma/client";

export interface UniversityMatch {
    id: string;
    name: string;
    country: string;
    city: string | null;
    ranking: number | null;
    tuitionFee: number;
    acceptanceRate: number | null;
    category: string;
    programName: string | null;
    programType: string | null;
    requirements: string | null;
    scholarships: boolean;
    matchScore: number;
    matchReason: string;
    acceptanceLikelihood: "High" | "Medium" | "Low";
    riskLevel: "Low" | "Medium" | "High";
}

/**
 * Calculate profile strength score (0-100)
 */
export function calculateProfileStrength(profile: UserProfile): {
    academics: number;
    exams: number;
    sop: number;
    overall: number;
} {
    let academicsScore = 50; // Base score
    let examsScore = 0;
    let sopScore = 0;

    // GPA scoring
    if (profile.gpa) {
        const gpaNum = parseFloat(profile.gpa);
        if (gpaNum >= 3.5) academicsScore = 100;
        else if (gpaNum >= 3.0) academicsScore = 75;
        else if (gpaNum >= 2.5) academicsScore = 50;
        else academicsScore = 25;
    }

    // Exam status scoring
    if (profile.examStatus === "completed") {
        examsScore = 100;
    } else if (profile.examStatus === "in_progress") {
        examsScore = 50;
    } else {
        examsScore = 0;
    }

    // SOP status scoring
    if (profile.sopStatus === "ready") {
        sopScore = 100;
    } else if (profile.sopStatus === "draft") {
        sopScore = 60;
    } else {
        sopScore = 0;
    }

    const overall = Math.round((academicsScore + examsScore + sopScore) / 3);

    return {
        academics: academicsScore,
        exams: examsScore,
        sop: sopScore,
        overall,
    };
}

/**
 * Determine acceptance likelihood based on GPA and acceptance rate
 */
function calculateAcceptanceLikelihood(
    userGpa: number,
    requiredGpa: number,
    acceptanceRate: number
): "High" | "Medium" | "Low" {
    const gpaGap = userGpa - requiredGpa;

    // Dream schools (low acceptance rate)
    if (acceptanceRate < 15) {
        if (gpaGap >= 0.3) return "Medium";
        if (gpaGap >= 0) return "Low";
        return "Low";
    }

    // Target schools (medium acceptance rate)
    if (acceptanceRate < 30) {
        if (gpaGap >= 0.2) return "High";
        if (gpaGap >= 0) return "Medium";
        return "Low";
    }

    // Safe schools (high acceptance rate)
    if (gpaGap >= 0) return "High";
    if (gpaGap >= -0.2) return "Medium";
    return "Low";
}

/**
 * Determine risk level for a university
 */
function calculateRiskLevel(
    category: string,
    acceptanceLikelihood: string
): "Low" | "Medium" | "High" {
    if (category === "dream") {
        return "High";
    }
    if (category === "safe") {
        return "Low";
    }
    // Target schools
    if (acceptanceLikelihood === "High") return "Low";
    if (acceptanceLikelihood === "Medium") return "Medium";
    return "High";
}

/**
 * Generate match explanation
 */
function generateMatchReason(
    university: any,
    profile: UserProfile,
    acceptanceLikelihood: string,
    budgetMatch: boolean
): string {
    const reasons: string[] = [];

    // Country match
    if (profile.targetCountry && university.country === profile.targetCountry) {
        reasons.push(`Matches your ${profile.targetCountry} preference`);
    }

    // Budget consideration
    if (budgetMatch) {
        if (university.tuitionFee < 20000) {
            reasons.push("Very affordable tuition");
        } else if (university.tuitionFee < 35000) {
            reasons.push("Fits your budget");
        }
    } else {
        reasons.push("Above your stated budget - consider scholarships");
    }

    // Scholarship availability
    if (university.scholarships) {
        reasons.push("Offers scholarships");
    }

    // Acceptance likelihood
    if (acceptanceLikelihood === "High") {
        reasons.push("Strong acceptance probability");
    } else if (acceptanceLikelihood === "Medium") {
        reasons.push("Moderate acceptance probability");
    } else {
        reasons.push("Competitive - requires excellent profile");
    }

    // Ranking
    if (university.ranking && university.ranking <= 20) {
        reasons.push("Top 20 globally ranked");
    }

    return reasons.join(". ");
}

/**
 * Match universities to user profile
 */
export function matchUniversities(
    universities: any[],
    profile: UserProfile
): UniversityMatch[] {
    const userGpa = profile.gpa ? parseFloat(profile.gpa) : 3.0;
    const budgetRangeMap: { [key: string]: number } = {
        "0-20000": 20000,
        "20000-35000": 35000,
        "35000-50000": 50000,
        "50000+": 100000,
    };
    const maxBudget = profile.budgetRange
        ? budgetRangeMap[profile.budgetRange] || 50000
        : 50000;

    const matches: UniversityMatch[] = universities.map((uni) => {
        let matchScore = 0;

        // Parse requirements
        let requirements: any = {};
        try {
            requirements = JSON.parse(uni.requirements || "{}");
        } catch (e) {
            requirements = {};
        }

        const requiredGpa = requirements.gpa || 3.0;

        // Country match (high weight)
        if (profile.targetCountry && uni.country === profile.targetCountry) {
            matchScore += 30;
        }

        // Budget match (high weight)
        const budgetMatch = uni.tuitionFee <= maxBudget;
        if (budgetMatch) {
            matchScore += 25;
        } else {
            // Penalty for over budget
            matchScore -= 10;
            // But if scholarships available, reduce penalty
            if (uni.scholarships) {
                matchScore += 5;
            }
        }

        // GPA match
        const gpaGap = userGpa - requiredGpa;
        if (gpaGap >= 0.3) matchScore += 20;
        else if (gpaGap >= 0) matchScore += 10;
        else if (gpaGap >= -0.2) matchScore += 5;
        else matchScore -= 10;

        // Program type match
        if (
            profile.targetDegree &&
            uni.programType &&
            uni.programType.toLowerCase().includes(profile.targetDegree.toLowerCase())
        ) {
            matchScore += 15;
        }

        // Category bonus (we want a mix)
        if (uni.category === "target") matchScore += 10;
        else if (uni.category === "safe") matchScore += 5;

        // Calculate acceptance likelihood
        const acceptanceLikelihood = calculateAcceptanceLikelihood(
            userGpa,
            requiredGpa,
            uni.acceptanceRate || 50
        );

        // Risk level
        const riskLevel = calculateRiskLevel(uni.category, acceptanceLikelihood);

        // Match reason
        const matchReason = generateMatchReason(
            uni,
            profile,
            acceptanceLikelihood,
            budgetMatch
        );

        return {
            id: uni.id,
            name: uni.name,
            country: uni.country,
            city: uni.city,
            ranking: uni.ranking,
            tuitionFee: uni.tuitionFee,
            acceptanceRate: uni.acceptanceRate,
            category: uni.category,
            programName: uni.programName,
            programType: uni.programType,
            requirements: uni.requirements,
            scholarships: uni.scholarships,
            matchScore,
            matchReason,
            acceptanceLikelihood,
            riskLevel,
        };
    });

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get recommended universities (top matches in each category)
 */
export function getRecommendedUniversities(
    allMatches: UniversityMatch[],
    limit = 15
): {
    dream: UniversityMatch[];
    target: UniversityMatch[];
    safe: UniversityMatch[];
    all: UniversityMatch[];
} {
    const dream = allMatches
        .filter((m) => m.category === "dream")
        .slice(0, 5);

    const target = allMatches
        .filter((m) => m.category === "target")
        .slice(0, 5);

    const safe = allMatches
        .filter((m) => m.category === "safe")
        .slice(0, 5);

    const all = [...dream, ...target, ...safe].slice(0, limit);

    return { dream, target, safe, all };
}

/**
 * Determine user's current stage based on profile completion
 */
export function determineUserStage(profile: UserProfile): string {
    if (!profile.onboardingComplete) {
        return "building_profile";
    }



    // Check exam and SOP readiness
    const examsReady = profile.examStatus === "completed";
    const sopReady = profile.sopStatus === "ready" || profile.sopStatus === "draft";

    if (examsReady && sopReady) {
        return "finalizing_universities";
    }

    return "discovering_universities";
}
