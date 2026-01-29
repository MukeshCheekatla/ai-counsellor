export interface University {
    id: string;
    name: string;
    location: string;
    country: string;
    ranking: number;
    category: "dream" | "target" | "safe";
    tuitionPerYear: number;
    acceptanceRate: number;
    requiredGPA: number;
    programs: string[];
    whyItFits: string;
    risks: string;
}

export const universities: University[] = [
    // USA - Dream
    {
        id: "mit",
        name: "Massachusetts Institute of Technology",
        location: "Cambridge, MA",
        country: "USA",
        ranking: 1,
        category: "dream",
        tuitionPerYear: 58000,
        acceptanceRate: 4,
        requiredGPA: 3.9,
        programs: ["Computer Science", "Electrical Engineering", "Data Science"],
        whyItFits: "World-class CS program, strong research opportunities, excellent placement",
        risks: "Extremely competitive, high cost, very rigorous curriculum"
    },
    {
        id: "stanford",
        name: "Stanford University",
        location: "Stanford, CA",
        country: "USA",
        ranking: 3,
        category: "dream",
        tuitionPerYear: 57000,
        acceptanceRate: 5,
        requiredGPA: 3.9,
        programs: ["Computer Science", "AI/ML", "Software Engineering"],
        whyItFits: "Silicon Valley connections, top AI program, entrepreneurship focus",
        risks: "Very selective, high living costs, intense competition"
    },

    // USA - Target
    {
        id: "bu",
        name: "Boston University",
        location: "Boston, MA",
        country: "USA",
        ranking: 42,
        category: "target",
        tuitionPerYear: 62000,
        acceptanceRate: 18,
        requiredGPA: 3.6,
        programs: ["Computer Science", "Data Analytics", "Software Engineering"],
        whyItFits: "Strong CS program, good job placement, urban tech hub",
        risks: "Moderate competition, high cost of living"
    },
    {
        id: "neu",
        name: "Northeastern University",
        location: "Boston, MA",
        country: "USA",
        ranking: 49,
        category: "target",
        tuitionPerYear: 60000,
        acceptanceRate: 20,
        requiredGPA: 3.5,
        programs: ["Computer Science", "Information Systems", "Cybersecurity"],
        whyItFits: "Co-op program provides work experience, strong industry connections",
        risks: "Tuition high, competitive but achievable"
    },

    // USA - Safe
    {
        id: "asu",
        name: "Arizona State University",
        location: "Tempe, AZ",
        country: "USA",
        ranking: 121,
        category: "safe",
        tuitionPerYear: 32000,
        acceptanceRate: 88,
        requiredGPA: 3.0,
        programs: ["Computer Science", "Software Engineering", "IT"],
        whyItFits: "Affordable, high acceptance rate, good CS program for the cost",
        risks: "Lower ranking, less competitive peer group"
    },
    {
        id: "ucf",
        name: "University of Central Florida",
        location: "Orlando, FL",
        country: "USA",
        ranking: 148,
        category: "safe",
        tuitionPerYear: 28000,
        acceptanceRate: 44,
        requiredGPA: 3.2,
        programs: ["Computer Science", "Game Design", "Cybersecurity"],
        whyItFits: "Growing tech scene in Orlando, affordable, solid CS program",
        risks: "Moderate ranking, less name recognition"
    },

    // Germany - Dream
    {
        id: "tum",
        name: "Technical University of Munich",
        location: "Munich",
        country: "Germany",
        ranking: 37,
        category: "dream",
        tuitionPerYear: 0,
        acceptanceRate: 15,
        requiredGPA: 3.7,
        programs: ["Computer Science", "AI", "Robotics"],
        whyItFits: "Top European tech university, free tuition, strong industry ties",
        risks: "German language helpful for daily life, competitive admissions"
    },

    // Germany - Target
    {
        id: "rwth",
        name: "RWTH Aachen University",
        location: "Aachen",
        country: "Germany",
        ranking: 106,
        category: "target",
        tuitionPerYear: 0,
        acceptanceRate: 25,
        requiredGPA: 3.4,
        programs: ["Computer Science", "Data Science", "Engineering"],
        whyItFits: "Free tuition, good engineering program, English programs available",
        risks: "Smaller city, need German for job market"
    },

    // Germany - Safe
    {
        id: "tu-berlin",
        name: "Technical University of Berlin",
        location: "Berlin",
        country: "Germany",
        ranking: 154,
        category: "safe",
        tuitionPerYear: 0,
        acceptanceRate: 45,
        requiredGPA: 3.0,
        programs: ["Computer Science", "Information Technology"],
        whyItFits: "Free tuition, vibrant tech startup scene, affordable living",
        risks: "Lower ranking, less selective"
    },

    // UK - Dream
    {
        id: "cambridge",
        name: "University of Cambridge",
        location: "Cambridge",
        country: "UK",
        ranking: 2,
        category: "dream",
        tuitionPerYear: 38000,
        acceptanceRate: 21,
        requiredGPA: 3.9,
        programs: ["Computer Science", "AI", "Machine Learning"],
        whyItFits: "World-class reputation, cutting-edge research, excellent faculty",
        risks: "Very competitive, high cost, demanding curriculum"
    },

    // UK - Target
    {
        id: "edinburgh",
        name: "University of Edinburgh",
        location: "Edinburgh",
        country: "UK",
        ranking: 22,
        category: "target",
        tuitionPerYear: 35000,
        acceptanceRate: 40,
        requiredGPA: 3.5,
        programs: ["Computer Science", "Data Science", "AI"],
        whyItFits: "Strong CS program, beautiful city, good balance of prestige and accessibility",
        risks: "Competitive, UK visa restrictions post-study"
    },

    // UK - Safe
    {
        id: "bristol",
        name: "University of Bristol",
        location: "Bristol",
        country: "UK",
        ranking: 55,
        category: "safe",
        tuitionPerYear: 30000,
        acceptanceRate: 60,
        requiredGPA: 3.2,
        programs: ["Computer Science", "Software Engineering"],
        whyItFits: "Solid CS program, growing tech hub, more accessible admission",
        risks: "Less prestigious than top UK universities"
    },

    // Canada - Dream
    {
        id: "toronto",
        name: "University of Toronto",
        location: "Toronto, ON",
        country: "Canada",
        ranking: 21,
        category: "dream",
        tuitionPerYear: 45000,
        acceptanceRate: 43,
        requiredGPA: 3.8,
        programs: ["Computer Science", "AI", "Machine Learning"],
        whyItFits: "Top AI research, excellent job market in Toronto, post-grad work permit",
        risks: "Very competitive CS program, high cost of living"
    },

    // Canada - Target
    {
        id: "waterloo",
        name: "University of Waterloo",
        location: "Waterloo, ON",
        country: "Canada",
        ranking: 149,
        category: "target",
        tuitionPerYear: 42000,
        acceptanceRate: 53,
        requiredGPA: 3.5,
        programs: ["Computer Science", "Software Engineering", "Data Science"],
        whyItFits: "Best co-op program, strong tech industry connections, good PR pathway",
        risks: "Harsh winters, competitive CS program"
    },

    // Canada - Safe
    {
        id: "mcmaster",
        name: "McMaster University",
        location: "Hamilton, ON",
        country: "Canada",
        ranking: 144,
        category: "safe",
        tuitionPerYear: 35000,
        acceptanceRate: 58,
        requiredGPA: 3.2,
        programs: ["Computer Science", "Software Engineering"],
        whyItFits: "Good CS program, affordable, close to Toronto, PR-friendly",
        risks: "Less prestigious, smaller tech scene"
    }
];
