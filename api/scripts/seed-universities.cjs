const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Upsert UCSD
  const uni = await prisma.university.upsert({
    where: { slug: "ucsd" },
    update: {
      name: "University of California, San Diego",
      countryCode: "US",
      city: "San Diego",
      websiteUrl: "https://www.ucsd.edu/",
    },
    create: {
      slug: "ucsd",
      name: "University of California, San Diego",
      countryCode: "US",
      city: "San Diego",
      websiteUrl: "https://www.ucsd.edu/",
    },
    select: { id: true, slug: true, name: true },
  });

  // Clean existing requirements for deterministic seed
  await prisma.universityRequirement.deleteMany({ where: { universityId: uni.id } });

  // Create requirements
  await prisma.universityRequirement.createMany({
    data: [
      {
        universityId: uni.id,
        title: "Upload proof of health insurance",
        description: "Provide evidence of coverage that meets university requirements.",
        kind: "REQUIRED",
        priority: "HIGH",
        stayMode: "ANY",
        dueDaysBefore: 14,
        ctaLabel: "Insurance portal",
        ctaUrl: "https://www.ucsd.edu/",
      },
      {
        universityId: uni.id,
        title: "Attend international student check-in",
        description: "Mandatory check-in session after arrival (date communicated by the university).",
        kind: "INFO",
        priority: "MEDIUM",
        stayMode: "ANY",
        dueDaysBefore: 3,
      },
    ],
  });

  console.log("✅ Seed done:", uni);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
