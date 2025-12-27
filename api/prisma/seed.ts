import 'dotenv/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  await prisma.$connect();

  // Reset MVP
  await prisma.requirementRule.deleteMany({});

  await prisma.requirementRule.createMany({
    data: [
      // FR -> DE exchange
      {
        id: randomUUID(),
        passportCountry: 'FR',
        destinationCountry: 'DE',
        purpose: 'exchange',
        requiredType: 'insurance',
        title: 'Health insurance proof',
        notes: 'EHIC or local coverage depending on university.',
        minDays: 1,
      },
      {
        id: randomUUID(),
        passportCountry: 'FR',
        destinationCountry: 'DE',
        purpose: 'exchange',
        requiredType: 'other',
        title: 'Proof of enrollment',
        notes: 'University acceptance/enrollment certificate.',
        minDays: 1,
      },

      // FR -> CY exchange
      {
        id: randomUUID(),
        passportCountry: 'FR',
        destinationCountry: 'CY',
        purpose: 'exchange',
        requiredType: 'insurance',
        title: 'Health insurance proof',
        notes: 'Provide insurance required by host university.',
        minDays: 1,
      },

      // FR -> US internship
      {
        id: randomUUID(),
        passportCountry: 'FR',
        destinationCountry: 'US',
        purpose: 'internship',
        requiredType: 'visa',
        title: 'Appropriate visa required',
        notes: 'Depends on sponsor/program.',
        minDays: 1,
      },
    ],
  });

  console.log('✅ Seeded RequirementRule');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
