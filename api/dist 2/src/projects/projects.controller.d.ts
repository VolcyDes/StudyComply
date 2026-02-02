import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    active(req: any): import("@prisma/client").Prisma.Prisma__MobilityProjectClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        destinationCountry: string;
        purpose: string;
        startDate: Date;
        endDate: Date;
        isActive: boolean;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    createActive(req: any, body?: {
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
    }> | {
        message: string;
    };
    clear(req: any): Promise<{
        cleared: boolean;
    }>;
}
