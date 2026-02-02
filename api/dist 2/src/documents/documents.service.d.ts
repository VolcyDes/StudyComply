import { PrismaService } from '../prisma/prisma.service';
export declare class DocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private readonly publicSelect;
    create(userId: string, body: {
        title: string;
        type: string;
        expiresAt: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        expiresAt: Date;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        expiresAt: Date;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
        userId: string;
    }[]>;
    update(userId: string, id: string, body: {
        title?: string;
        type?: string;
        expiresAt?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        expiresAt: Date;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
        userId: string;
    } | null>;
    delete(userId: string, id: string): Promise<1 | 0>;
    attachFile(userId: string, id: string, file: {
        path: string;
        originalname: string;
        mimetype: string;
        size: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        expiresAt: Date;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
        userId: string;
    } | null>;
    getFileMeta(userId: string, id: string): Promise<{
        id: string;
        filePath: string | null;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
    } | null>;
    removeFile(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        expiresAt: Date;
        fileName: string | null;
        fileMime: string | null;
        fileSize: number | null;
        userId: string;
    } | null>;
}
