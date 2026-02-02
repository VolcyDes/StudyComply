"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../src/prisma/prisma.service");
const prisma = new prisma_service_1.PrismaService();
async function main() {
    await prisma.$connect();
    await prisma.requirementRule.deleteMany({});
    await prisma.requirementRule.createMany({
        data: [
            {
                id: (0, crypto_1.randomUUID)(),
                passportCountry: 'FR',
                destinationCountry: 'DE',
                purpose: 'exchange',
                requiredType: 'insurance',
                title: 'Health insurance proof',
                notes: 'EHIC or local coverage depending on university.',
                minDays: 1,
            },
            {
                id: (0, crypto_1.randomUUID)(),
                passportCountry: 'FR',
                destinationCountry: 'DE',
                purpose: 'exchange',
                requiredType: 'other',
                title: 'Proof of enrollment',
                notes: 'University acceptance/enrollment certificate.',
                minDays: 1,
            },
            {
                id: (0, crypto_1.randomUUID)(),
                passportCountry: 'FR',
                destinationCountry: 'CY',
                purpose: 'exchange',
                requiredType: 'insurance',
                title: 'Health insurance proof',
                notes: 'Provide insurance required by host university.',
                minDays: 1,
            },
            {
                id: (0, crypto_1.randomUUID)(),
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
//# sourceMappingURL=seed.js.map