import { PrismaService } from '../prisma/prisma.service';
export declare class RequirementsService {
    private prisma;
    constructor(prisma: PrismaService);
    compute(userId: string): Promise<{
        passports: string[];
        project: null;
        required: never[];
        missing: never[];
        note: string;
    } | {
        passports: string[];
        project: {
            destinationCountry: string;
            purpose: string;
            startDate: Date;
            endDate: Date;
            durationDays: number;
        };
        required: {
            id: string;
            title: string;
            passportCountry: string;
            requiredType: string;
            notes: string | null;
            minDays: number | null;
            maxDays: number | null;
        }[];
        missing: {
            id: string;
            title: string;
            passportCountry: string;
            requiredType: string;
            notes: string | null;
            minDays: number | null;
            maxDays: number | null;
        }[];
        note?: undefined;
    }>;
}
