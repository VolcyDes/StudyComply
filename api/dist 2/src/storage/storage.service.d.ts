export declare class StorageService {
    private readonly bucket;
    private readonly region;
    private readonly s3;
    constructor();
    isEnabled(): boolean;
    buildKey(params: {
        userId: string;
        docId: string;
        originalName: string;
    }): string;
    putPdf(params: {
        key: string;
        buffer: Buffer;
        mime: string;
    }): Promise<void>;
    getObjectStream(key: string): Promise<any>;
    deleteObject(key: string): Promise<void>;
}
