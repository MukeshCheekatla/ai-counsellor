import { UserProfile } from "@prisma/client";

export interface GeneratedTask {
    title: string;
    description: string;
    category: string;
    priority: "high" | "medium" | "low";
    dueDate?: Date;
}

/**
 * Generate tasks based on user profile and current stage
 */
export function generateProfileTasks(profile: UserProfile): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    const now = new Date();

    // Exam tasks
    if (!profile.examStatus || profile.examStatus === "not_started") {
        tasks.push({
            title: "Register for TOEFL/IELTS",
            description:
                "English proficiency test is required for most universities. Book your test slot at least 2 months before application deadlines.",
            category: "exam",
            priority: "high",
            dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        });

        if (profile.targetDegree?.toLowerCase().includes("master")) {
            tasks.push({
                title: "Prepare for GRE/GMAT",
                description:
                    "Most master's programs require GRE or GMAT. Start preparation at least 3 months in advance.",
                category: "exam",
                priority: "high",
                dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 1 month
            });
        }
    } else if (profile.examStatus === "in_progress") {
        tasks.push({
            title: "Complete exam preparation",
            description:
                "Finish your exam preparation and book a test date if you haven't already.",
            category: "exam",
            priority: "high",
            dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        });
    }

    // SOP tasks
    if (!profile.sopStatus || profile.sopStatus === "not_started") {
        tasks.push({
            title: "Start your Statement of Purpose (SOP)",
            description:
                "Your SOP is crucial for admissions. Start by outlining your academic background, career goals, and why you're interested in this program.",
            category: "sop",
            priority: "high",
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week
        });
    } else if (profile.sopStatus === "draft") {
        tasks.push({
            title: "Refine and finalize your SOP",
            description:
                "Get feedback from mentors or use professional editing services. Ensure it's tailored to each university.",
            category: "sop",
            priority: "medium",
            dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        });
    }

    // Research tasks
    if (profile.currentStage === "discovering_universities") {
        tasks.push({
            title: "Research and shortlist universities",
            description:
                "Use the AI Counsellor to discover universities that match your profile. Aim to shortlist 8-12 universities across Dream, Target, and Safe categories.",
            category: "research",
            priority: "high",
            dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
        });
    }

    // Document preparation
    tasks.push({
        title: "Prepare academic transcripts",
        description:
            "Request official transcripts from all universities you've attended. This process can take 2-4 weeks.",
        category: "application",
        priority: "medium",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    });

    tasks.push({
        title: "Arrange Letters of Recommendation (LOR)",
        description:
            "Identify 2-3 professors or supervisors who can write strong recommendations. Request them at least 4 weeks before deadlines.",
        category: "application",
        priority: "medium",
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    });

    // Financial planning
    if (profile.fundingSource?.includes("scholarship")) {
        tasks.push({
            title: "Research scholarship opportunities",
            description:
                "Look for university-specific scholarships, government scholarships, and private funding options.",
            category: "financial",
            priority: "medium",
            dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        });
    }

    if (profile.fundingSource?.includes("loan")) {
        tasks.push({
            title: "Explore education loan options",
            description:
                "Compare education loan offers from different banks. Check interest rates, collateral requirements, and repayment terms.",
            category: "financial",
            priority: "medium",
            dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        });
    }

    return tasks;
}

/**
 * Generate tasks specific to a locked university
 */
export function generateUniversityTasks(
    universityName: string,
    universityRequirements: string,
    intakeYear: string
): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    const now = new Date();

    let requirements: any = {};
    try {
        requirements = JSON.parse(universityRequirements);
    } catch (e) {
        requirements = {};
    }

    // Application deadline task
    tasks.push({
        title: `Complete application for ${universityName}`,
        description: `Submit your complete application including all required documents. Check the specific deadline for ${intakeYear} intake.`,
        category: "application",
        priority: "high",
        dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 2 months
    });

    // University-specific SOP
    tasks.push({
        title: `Write university-specific SOP for ${universityName}`,
        description: `Tailor your Statement of Purpose to highlight why ${universityName} is the perfect fit for your goals.`,
        category: "sop",
        priority: "high",
        dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
    });

    // LOR tasks
    const lorCount = requirements.lor || 2;
    tasks.push({
        title: `Arrange ${lorCount} Letters of Recommendation`,
        description: `Contact professors/supervisors and provide them with necessary information about ${universityName} and the program.`,
        category: "application",
        priority: "high",
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 1 month
    });

    // Exam requirements
    if (requirements.toefl || requirements.ielts) {
        tasks.push({
            title: `Take English proficiency test`,
            description: `Score at least ${requirements.toefl || requirements.ielts} on ${requirements.toefl ? "TOEFL" : "IELTS"}. Send official scores to ${universityName}.`,
            category: "exam",
            priority: "high",
            dueDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        });
    }

    if (requirements.gre && requirements.gre !== "Not Required") {
        tasks.push({
            title: "Complete GRE and send scores",
            description: `Target score: ${requirements.gre}+. Send official GRE scores to ${universityName}.`,
            category: "exam",
            priority: "high",
            dueDate: new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000),
        });
    }

    // Financial documents
    tasks.push({
        title: "Prepare financial documents",
        description: `Prepare bank statements, affidavits of support, and other financial proof required by ${universityName}.`,
        category: "financial",
        priority: "medium",
        dueDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
    });

    // Resume/CV
    tasks.push({
        title: "Prepare academic resume/CV",
        description:
            "Create or update your academic CV highlighting research, projects, publications, and relevant experience.",
        category: "application",
        priority: "medium",
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    });

    // Application fee
    tasks.push({
        title: "Pay application fee",
        description: `Most universities charge $50-$150 application fee. Keep your payment method ready.`,
        category: "application",
        priority: "low",
        dueDate: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
    });

    return tasks;
}

/**
 * Generate next steps based on current stage
 */
export function generateNextSteps(
    profile: UserProfile,
    hasShortlistedUniversities: boolean,
    hasLockedUniversities: boolean
): string[] {
    const steps: string[] = [];

    if (!profile.onboardingComplete) {
        steps.push("Complete your profile onboarding");
        return steps;
    }

    const stage = profile.currentStage || "building_profile";

    switch (stage) {
        case "building_profile":
            if (!profile.examStatus || profile.examStatus === "not_started") {
                steps.push("Register for required exams (TOEFL/IELTS, GRE/GMAT)");
            }
            if (!profile.sopStatus || profile.sopStatus === "not_started") {
                steps.push("Start drafting your Statement of Purpose");
            }
            steps.push("Consult the AI Counsellor to understand your profile strength");
            break;

        case "discovering_universities":
            steps.push("Use AI Counsellor to get personalized university recommendations");
            steps.push("Research universities that match your profile and budget");
            steps.push("Shortlist 8-12 universities (mix of Dream, Target, Safe)");
            break;

        case "finalizing_universities":
            if (!hasShortlistedUniversities) {
                steps.push("Shortlist universities before finalizing");
            } else if (!hasLockedUniversities) {
                steps.push("Lock at least one university to begin focused preparation");
            }
            steps.push("Review requirements for each shortlisted university");
            steps.push("Finalize your application strategy");
            break;

        case "preparing_applications":
            steps.push("Complete university-specific SOPs");
            steps.push("Arrange Letters of Recommendation");
            steps.push("Gather all required documents (transcripts, certificates)");
            steps.push("Prepare financial documents");
            steps.push("Submit applications before deadlines");
            break;

        default:
            steps.push("Consult the AI Counsellor for personalized guidance");
    }

    return steps;
}
