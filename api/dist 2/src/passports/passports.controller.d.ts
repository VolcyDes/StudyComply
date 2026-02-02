import { PassportsService } from './passports.service';
export declare class PassportsController {
    private readonly passports;
    constructor(passports: PassportsService);
    list(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        countryCode: string;
    }[]>;
    create(req: any, body: {
        countryCode: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        countryCode: string;
    }>;
    remove(req: any, countryCode: string): Promise<{
        deleted: boolean;
    }>;
}
