import { PrismaService } from '../prisma/prisma.service';
export declare class MetaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    countries(): Promise<{
        name: string;
        code: string;
    }[]>;
    purposes(): Promise<{
        key: string;
        label: string;
    }[]>;
}
