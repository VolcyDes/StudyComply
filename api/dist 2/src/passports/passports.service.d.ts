import { PrismaService } from '../prisma/prisma.service';
export declare class PassportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        countryCode: string;
    }[]>;
    create(userId: string, countryCodeRaw: string): Promise<{
        id: string;
        createdAt: Date;
        countryCode: string;
    } | null>;
    remove(userId: string, countryCodeRaw: string): Promise<number>;
}
