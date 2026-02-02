"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const path_1 = require("path");
const client_s3_1 = require("@aws-sdk/client-s3");
let StorageService = class StorageService {
    bucket = process.env.S3_BUCKET || '';
    region = process.env.S3_REGION || 'eu-west-3';
    s3;
    constructor() {
        if (!this.bucket) {
            this.s3 = null;
            return;
        }
        this.s3 = new client_s3_1.S3Client({
            region: this.region,
            credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
                ? {
                    accessKeyId: process.env.S3_ACCESS_KEY_ID,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                }
                : undefined,
            endpoint: process.env.S3_ENDPOINT || undefined,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' ? true : undefined,
        });
    }
    isEnabled() {
        return !!this.s3;
    }
    buildKey(params) {
        const ext = (0, path_1.extname)(params.originalName || '.pdf') || '.pdf';
        const id = (0, crypto_1.randomUUID)();
        return `users/${params.userId}/documents/${params.docId}/${id}${ext}`;
    }
    async putPdf(params) {
        if (!this.s3)
            throw new Error('S3 not configured');
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: params.key,
            Body: params.buffer,
            ContentType: params.mime || 'application/pdf',
        }));
    }
    async getObjectStream(key) {
        if (!this.s3)
            throw new Error('S3 not configured');
        const out = await this.s3.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
        if (!out.Body)
            throw new Error('Empty S3 body');
        return out.Body;
    }
    async deleteObject(key) {
        if (!this.s3)
            throw new Error('S3 not configured');
        await this.s3.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map