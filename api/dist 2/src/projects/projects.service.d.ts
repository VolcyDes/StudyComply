import { PrismaService } from '../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    getActive(userId: string): import("@prisma/client").Prisma.Prisma__MobilityProjectClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        destinationCountry: string;
        purpose: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createActive(userId: string, input: {
        destinationCountry: string;
        purpose: string;
        startDate: string;
        endDate: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        destinationCountry: string;
        purpose: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    }>;
    clearActive(userId: string): Promise<{
        cleared: boolean;
    }>;
}
