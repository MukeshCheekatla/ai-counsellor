const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const universities = [
    // DREAM - USA
    { name: "Stanford University", country: "USA", city: "Stanford", ranking: 3, tuitionFee: 56169, acceptanceRate: 3.9, category: "dream", programType: "master", scholarships: true },
    { name: "MIT", country: "USA", city: "Cambridge", ranking: 1, tuitionFee: 53790, acceptanceRate: 4.1, category: "dream", programType: "master", scholarships: true },
    { name: "Harvard University", country: "USA", city: "Cambridge", ranking: 5, tuitionFee: 54269, acceptanceRate: 3.4, category: "dream", programType: "master", scholarships: true },

    // TARGET - USA
    { name: "University of Texas at Austin", country: "USA", city: "Austin", ranking: 38, tuitionFee: 39322, acceptanceRate: 31, category: "target", programType: "master", scholarships: true },
    { name: "University of Washington", country: "USA", city: "Seattle", ranking: 59, tuitionFee: 36898, acceptanceRate: 48, category: "target", programType: "master", scholarships: true },
    { name: "Georgia Institute of Technology", country: "USA", city: "Atlanta", ranking: 44, tuitionFee: 33794, acceptanceRate: 21, category: "target", programType: "master", scholarships: false },

    // SAFE - USA
    { name: "Arizona State University", country: "USA", city: "Tempe", ranking: 179, tuitionFee: 31200, acceptanceRate: 88, category: "safe", programType: "master", scholarships: true },
    { name: "University of Illinois Chicago", country: "USA", city: "Chicago", ranking: 217, tuitionFee: 28800, acceptanceRate: 79, category: "safe", programType: "master", scholarships: false },

    // DREAM - Canada
    { name: "University of Toronto", country: "Canada", city: "Toronto", ranking: 21, tuitionFee: 45690, acceptanceRate: 43, category: "dream", programType: "master", scholarships: true },
    { name: "UBC", country: "Canada", city: "Vancouver", ranking: 47, tuitionFee: 38000, acceptanceRate: 52, category: "dream", programType: "master", scholarships: true },

    // TARGET - Canada  
    { name: "McMaster University", country: "Canada", city: "Hamilton", ranking: 144, tuitionFee: 25000, acceptanceRate: 59, category: "target", programType: "master", scholarships: true },
    { name: "University of Alberta", country: "Canada", city: "Edmonton", ranking: 111, tuitionFee: 21000, acceptanceRate: 58, category: "target", programType: "master", scholarships: true },

    // SAFE - Canada
    { name: "University of Saskatchewan", country: "Canada", city: "Saskatoon", ranking: 451, tuitionFee: 18000, acceptanceRate: 63, category: "safe", programType: "master", scholarships: true },

    // DREAM - UK
    { name: "Oxford University", country: "UK", city: "Oxford", ranking: 4, tuitionFee: 29000, acceptanceRate: 17.5, category: "dream", programType: "master", scholarships: true },
    { name: "Cambridge University", country: "UK", city: "Cambridge", ranking: 2, tuitionFee: 28000, acceptanceRate: 21, category: "dream", programType: "master", scholarships: true },

    // TARGET - UK
    { name: "University of Edinburgh", country: "UK", city: "Edinburgh", ranking: 22, tuitionFee: 26500, acceptanceRate: 40, category: "target", programType: "master", scholarships: true },
    { name: "University of Manchester", country: "UK", city: "Manchester", ranking: 54, tuitionFee: 24000, acceptanceRate: 56, category: "target", programType: "master", scholarships: false },

    // SAFE - UK
    { name: "University of Birmingham", country: "UK", city: "Birmingham", ranking: 91, tuitionFee: 22000, acceptanceRate: 61, category: "safe", programType: "master", scholarships: true },
    { name: "Newcastle University", country: "UK", city: "Newcastle", ranking: 139, tuitionFee: 20500, acceptanceRate: 87, category: "safe", programType: "master", scholarships: false },

    // Germany - mostly safe/target due to low fees
    { name: "Technical University of Munich", country: "Germany", city: "Munich", ranking: 37, tuitionFee: 3000, acceptanceRate: 8, category: "dream", programType: "master", scholarships: false },
    { name: "University of Heidelberg", country: "Germany", city: "Heidelberg", ranking: 64, tuitionFee: 2000, acceptanceRate: 19, category: "target", programType: "master", scholarships: false },
    { name: "RWTH Aachen University", country: "Germany", city: "Aachen", ranking: 106, tuitionFee: 1500, acceptanceRate: 10, category: "target", programType: "master", scholarships: false },
];

async function main() {
    console.log('🌱 Seeding universities...');

    // Clear existing universities
    await prisma.university.deleteMany({});

    // Insert universities
    for (const uni of universities) {
        await prisma.university.create({
            data: uni
        });
    }

    console.log(`✅ Seeded ${universities.length} universities`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
