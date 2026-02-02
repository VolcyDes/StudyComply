import { DocumentsService } from './documents.service';
import type { Response } from 'express';
import { StorageService } from '../storage/storage.service';
export declare class DocumentsController {
    private readonly docs;
    private readonly storage;
    constructor(docs: DocumentsService, storage: StorageService);
    findAll(req: any): Promise<{
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
    create(req: any, body: {
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
    update(req: any, id: string, body: {
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
    }>;
    remove(req: any, id: string): Promise<{
        deleted: boolean;
    }>;
    uploadPdf(req: any, id: string): Promise<{
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
    removePdf(req: any, id: string): Promise<{
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
    downloadPdf(req: any, id: string, res: Response): Promise<void>;
}
