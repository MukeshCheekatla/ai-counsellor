import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const universities = [
    // US - DREAM UNIVERSITIES
    {
        name: "Massachusetts Institute of Technology (MIT)",
        country: "USA",
        city: "Cambridge",
        ranking: 1,
        tuitionFee: 55000,
        acceptanceRate: 4.0,
        category: "dream",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.8,
            gre: 325,
            toefl: 100,
            ielts: 7.5,
            workExp: "Preferred",
            lor: 3,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Stanford University",
        country: "USA",
        city: "Stanford",
        ranking: 2,
        tuitionFee: 54000,
        acceptanceRate: 3.9,
        category: "dream",
        programName: "Data Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.8,
            gre: 325,
            toefl: 100,
            ielts: 7.5,
            workExp: "Preferred",
            lor: 3,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Harvard University",
        country: "USA",
        city: "Cambridge",
        ranking: 3,
        tuitionFee: 52000,
        acceptanceRate: 4.5,
        category: "dream",
        programName: "Business Analytics MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.7,
            gre: 320,
            toefl: 100,
            ielts: 7.5,
            workExp: "Required",
            lor: 3,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Carnegie Mellon University",
        country: "USA",
        city: "Pittsburgh",
        ranking: 5,
        tuitionFee: 50000,
        acceptanceRate: 6.0,
        category: "dream",
        programName: "Machine Learning MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.7,
            gre: 322,
            toefl: 100,
            ielts: 7.5,
            workExp: "Preferred",
            lor: 3,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of California, Berkeley",
        country: "USA",
        city: "Berkeley",
        ranking: 4,
        tuitionFee: 48000,
        acceptanceRate: 7.0,
        category: "dream",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.6,
            gre: 320,
            toefl: 90,
            ielts: 7.0,
            workExp: "Optional",
            lor: 3,
            sop: "Required"
        }),
        scholarships: true
    },

    // US - TARGET UNIVERSITIES
    {
        name: "University of Michigan - Ann Arbor",
        country: "USA",
        city: "Ann Arbor",
        ranking: 15,
        tuitionFee: 45000,
        acceptanceRate: 15.0,
        category: "target",
        programName: "Information Systems MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.4,
            gre: 315,
            toefl: 90,
            ielts: 7.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Texas at Austin",
        country: "USA",
        city: "Austin",
        ranking: 18,
        tuitionFee: 42000,
        acceptanceRate: 18.0,
        category: "target",
        programName: "Data Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.3,
            gre: 312,
            toefl: 85,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Washington",
        country: "USA",
        city: "Seattle",
        ranking: 20,
        tuitionFee: 40000,
        acceptanceRate: 20.0,
        category: "target",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.3,
            gre: 310,
            toefl: 85,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Georgia Institute of Technology",
        country: "USA",
        city: "Atlanta",
        ranking: 22,
        tuitionFee: 38000,
        acceptanceRate: 22.0,
        category: "target",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: 310,
            toefl: 85,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Southern California",
        country: "USA",
        city: "Los Angeles",
        ranking: 25,
        tuitionFee: 45000,
        acceptanceRate: 25.0,
        category: "target",
        programName: "Business Analytics MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: 308,
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // US - SAFE UNIVERSITIES
    {
        name: "Arizona State University",
        country: "USA",
        city: "Tempe",
        ranking: 35,
        tuitionFee: 32000,
        acceptanceRate: 35.0,
        category: "safe",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: 300,
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Illinois Chicago",
        country: "USA",
        city: "Chicago",
        ranking: 40,
        tuitionFee: 35000,
        acceptanceRate: 40.0,
        category: "safe",
        programName: "Data Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: 300,
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Northeastern University",
        country: "USA",
        city: "Boston",
        ranking: 45,
        tuitionFee: 38000,
        acceptanceRate: 45.0,
        category: "safe",
        programName: "Information Systems MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.9,
            gre: 298,
            toefl: 75,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Florida",
        country: "USA",
        city: "Gainesville",
        ranking: 50,
        tuitionFee: 30000,
        acceptanceRate: 50.0,
        category: "safe",
        programName: "Computer Engineering MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.9,
            gre: 295,
            toefl: 75,
            ielts: 6.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Stevens Institute of Technology",
        country: "USA",
        city: "Hoboken",
        ranking: 55,
        tuitionFee: 36000,
        acceptanceRate: 55.0,
        category: "safe",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.8,
            gre: 295,
            toefl: 75,
            ielts: 6.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },

    // UK - DREAM UNIVERSITIES
    {
        name: "University of Oxford",
        country: "UK",
        city: "Oxford",
        ranking: 6,
        tuitionFee: 38000,
        acceptanceRate: 8.0,
        category: "dream",
        programName: "Computer Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.7,
            gre: "Not Required",
            toefl: 100,
            ielts: 7.5,
            workExp: "Preferred",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Cambridge",
        country: "UK",
        city: "Cambridge",
        ranking: 7,
        tuitionFee: 40000,
        acceptanceRate: 8.5,
        category: "dream",
        programName: "Machine Learning MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.7,
            gre: "Not Required",
            toefl: 100,
            ielts: 7.5,
            workExp: "Preferred",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "Imperial College London",
        country: "UK",
        city: "London",
        ranking: 9,
        tuitionFee: 36000,
        acceptanceRate: 10.0,
        category: "dream",
        programName: "Artificial Intelligence MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.6,
            gre: "Not Required",
            toefl: 92,
            ielts: 7.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // UK - TARGET UNIVERSITIES
    {
        name: "University College London (UCL)",
        country: "UK",
        city: "London",
        ranking: 12,
        tuitionFee: 32000,
        acceptanceRate: 15.0,
        category: "target",
        programName: "Data Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.4,
            gre: "Not Required",
            toefl: 92,
            ielts: 7.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Edinburgh",
        country: "UK",
        city: "Edinburgh",
        ranking: 16,
        tuitionFee: 28000,
        acceptanceRate: 18.0,
        category: "target",
        programName: "Computer Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.3,
            gre: "Not Required",
            toefl: 90,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "King's College London",
        country: "UK",
        city: "London",
        ranking: 24,
        tuitionFee: 30000,
        acceptanceRate: 22.0,
        category: "target",
        programName: "Advanced Computing MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: "Not Required",
            toefl: 85,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // UK - SAFE UNIVERSITIES
    {
        name: "University of Manchester",
        country: "UK",
        city: "Manchester",
        ranking: 30,
        tuitionFee: 26000,
        acceptanceRate: 30.0,
        category: "safe",
        programName: "Computer Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: "Not Required",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Bristol",
        country: "UK",
        city: "Bristol",
        ranking: 32,
        tuitionFee: 25000,
        acceptanceRate: 35.0,
        category: "safe",
        programName: "Data Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: "Not Required",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },

    // CANADA - DREAM UNIVERSITIES
    {
        name: "University of Toronto",
        country: "Canada",
        city: "Toronto",
        ranking: 11,
        tuitionFee: 35000,
        acceptanceRate: 10.0,
        category: "dream",
        programName: "Computer Science MScAc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.6,
            gre: 315,
            toefl: 93,
            ielts: 7.0,
            workExp: "Preferred",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of British Columbia",
        country: "Canada",
        city: "Vancouver",
        ranking: 14,
        tuitionFee: 32000,
        acceptanceRate: 12.0,
        category: "dream",
        programName: "Data Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.5,
            gre: 310,
            toefl: 90,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // CANADA - TARGET UNIVERSITIES
    {
        name: "McGill University",
        country: "Canada",
        city: "Montreal",
        ranking: 19,
        tuitionFee: 28000,
        acceptanceRate: 20.0,
        category: "target",
        programName: "Computer Science MEng",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.3,
            gre: 305,
            toefl: 86,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Waterloo",
        country: "Canada",
        city: "Waterloo",
        ranking: 21,
        tuitionFee: 30000,
        acceptanceRate: 22.0,
        category: "target",
        programName: "Computer Science MMath",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: 308,
            toefl: 90,
            ielts: 7.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // CANADA - SAFE UNIVERSITIES
    {
        name: "Simon Fraser University",
        country: "Canada",
        city: "Burnaby",
        ranking: 35,
        tuitionFee: 24000,
        acceptanceRate: 35.0,
        category: "safe",
        programName: "Computing Science MSc",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: "Optional",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Ottawa",
        country: "Canada",
        city: "Ottawa",
        ranking: 40,
        tuitionFee: 22000,
        acceptanceRate: 40.0,
        category: "safe",
        programName: "Computer Science MCS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.9,
            gre: "Optional",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // AUSTRALIA - TARGET UNIVERSITIES
    {
        name: "Australian National University",
        country: "Australia",
        city: "Canberra",
        ranking: 17,
        tuitionFee: 30000,
        acceptanceRate: 25.0,
        category: "target",
        programName: "Computing - Advanced",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: "Not Required",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },
    {
        name: "University of Melbourne",
        country: "Australia",
        city: "Melbourne",
        ranking: 23,
        tuitionFee: 32000,
        acceptanceRate: 28.0,
        category: "target",
        programName: "Computer Science",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.1,
            gre: "Not Required",
            toefl: 79,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: true
    },

    // AUSTRALIA - SAFE UNIVERSITIES
    {
        name: "University of Sydney",
        country: "Australia",
        city: "Sydney",
        ranking: 30,
        tuitionFee: 28000,
        acceptanceRate: 32.0,
        category: "safe",
        programName: "Information Technology",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: "Not Required",
            toefl: 75,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Optional"
        }),
        scholarships: true
    },
    {
        name: "Monash University",
        country: "Australia",
        city: "Melbourne",
        ranking: 36,
        tuitionFee: 26000,
        acceptanceRate: 38.0,
        category: "safe",
        programName: "Information Technology",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.9,
            gre: "Not Required",
            toefl: 75,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Optional"
        }),
        scholarships: false
    },

    // GERMANY - TARGET UNIVERSITIES (Affordable)
    {
        name: "Technical University of Munich",
        country: "Germany",
        city: "Munich",
        ranking: 26,
        tuitionFee: 3000,
        acceptanceRate: 20.0,
        category: "target",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.3,
            gre: "Not Required",
            toefl: 88,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },
    {
        name: "RWTH Aachen University",
        country: "Germany",
        city: "Aachen",
        ranking: 28,
        tuitionFee: 2500,
        acceptanceRate: 25.0,
        category: "target",
        programName: "Data Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.2,
            gre: "Not Required",
            toefl: 80,
            ielts: 6.5,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },

    // GERMANY - SAFE UNIVERSITIES
    {
        name: "University of Stuttgart",
        country: "Germany",
        city: "Stuttgart",
        ranking: 38,
        tuitionFee: 3000,
        acceptanceRate: 35.0,
        category: "safe",
        programName: "Computer Science MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 3.0,
            gre: "Not Required",
            toefl: 75,
            ielts: 6.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },
    {
        name: "Karlsruhe Institute of Technology",
        country: "Germany",
        city: "Karlsruhe",
        ranking: 42,
        tuitionFee: 2800,
        acceptanceRate: 40.0,
        category: "safe",
        programName: "Informatics MS",
        programType: "master",
        requirements: JSON.stringify({
            gpa: 2.9,
            gre: "Not Required",
            toefl: 75,
            ielts: 6.0,
            workExp: "Optional",
            lor: 2,
            sop: "Required"
        }),
        scholarships: false
    },
];

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing universities
    console.log('🗑️  Clearing existing universities...');
    await prisma.university.deleteMany({});

    // Seed universities
    console.log('🎓 Seeding universities...');
    let dreamCount = 0;
    let targetCount = 0;
    let safeCount = 0;

    for (const university of universities) {
        await prisma.university.create({
            data: university,
        });

        if (university.category === 'dream') dreamCount++;
        if (university.category === 'target') targetCount++;
        if (university.category === 'safe') safeCount++;
    }

    console.log('\n✅ Database seeding completed!\n');
    console.log('📊 Summary:');
    console.log(`   Total Universities: ${universities.length}`);
    console.log(`   🌟 Dream: ${dreamCount}`);
    console.log(`   🎯 Target: ${targetCount}`);
    console.log(`   ✅ Safe: ${safeCount}`);
    console.log('\nCountries covered: USA, UK, Canada, Australia, Germany');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
