import { PrismaService } from '../prisma/prisma.service';
export declare class MeController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    me(req: any): Promise<{
        user: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    }>;
}
