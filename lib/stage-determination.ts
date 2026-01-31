/**
 * STAGE DETERMINATION - SINGLE SOURCE OF TRUTH
 * 
 * Implements the strict stage model from core philosophy:
 * - Stage 1 → onboarding incomplete
 * - Stage 2 → onboarding complete AND no shortlisted universities
 * - Stage 3 → ≥1 shortlisted AND no locked university
 * - Stage 4 → ≥1 locked university
 * 
 * Stages are DERIVED, never stored.
 */

export interface StageInfo {
    stage: number;
    name: string;
    description: string;
    nextAction: string;
}

/**
 * Determine current stage based on user state
 * @param onboardingComplete - Whether user completed onboarding
 * @param shortlistedCount - Number of shortlisted universities
 * @param lockedCount - Number of locked universities
 * @returns Current stage number (1-4)
 */
export function determineCurrentStage(
    onboardingComplete: boolean,
    shortlistedCount: number,
    lockedCount: number
): number {
    // Stage 1: Profile Building
    if (!onboardingComplete) {
        return 1;
    }

    // Stage 4: Application Preparation (locked university exists)
    if (lockedCount > 0) {
        return 4;
    }

    // Stage 3: Finalizing / Shortlisting (has shortlisted but not locked)
    if (shortlistedCount > 0) {
        return 3;
    }

    // Stage 2: University Discovery (onboarding done, no shortlisted yet)
    return 2;
}

/**
 * Get stage information
 */
export function getStageInfo(stage: number): StageInfo {
    const stages: Record<number, StageInfo> = {
        1: {
            stage: 1,
            name: "Building Profile",
            description: "Complete your profile to unlock university recommendations",
            nextAction: "Complete onboarding to proceed"
        },
        2: {
            stage: 2,
            name: "University Discovery",
            description: "Explore and shortlist universities that match your profile",
            nextAction: "Shortlist universities that interest you"
        },
        3: {
            stage: 3,
            name: "Finalizing / Shortlisting",
            description: "Review your shortlist and lock your primary choice",
            nextAction: "Lock a university to unlock application guidance"
        },
        4: {
            stage: 4,
            name: "Application Preparation",
            description: "Prepare your application documents and complete tasks",
            nextAction: "Complete your application tasks"
        }
    };

    return stages[stage] || stages[2];
}

/**
 * Get progress percentage for a stage
 */
export function getStageProgress(stage: number): number {
    const progressMap: Record<number, number> = {
        1: 25,
        2: 50,
        3: 65,
        4: 85,
    };

    return progressMap[stage] || 0;
}

/**
 * Check if user can access a feature based on their stage
 */
export function canAccessFeature(
    currentStage: number,
    feature: "counsellor" | "universities" | "guidance"
): boolean {
    const accessRules: Record<string, number> = {
        counsellor: 2, // Requires onboarding complete (Stage 2+)
        universities: 2, // Requires onboarding complete (Stage 2+)
        guidance: 4, // Requires locked university (Stage 4)
    };

    return currentStage >= accessRules[feature];
}

/**
 * Get stage name for display
 */
export function getStageName(stage: number): string {
    const names: Record<number, string> = {
        1: "Profile Building",
        2: "University Discovery",
        3: "Finalizing / Shortlisting",
        4: "Preparing Applications"
    };

    return names[stage] || "Unknown";
}
