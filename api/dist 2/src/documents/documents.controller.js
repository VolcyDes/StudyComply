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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const storage_service_1 = require("../storage/storage.service");
function safeFileName(original) {
    return original.replace(/[^a-zA-Z0-9._-]/g, '_');
}
let DocumentsController = class DocumentsController {
    docs;
    storage;
    constructor(docs, storage) {
        this.docs = docs;
        this.storage = storage;
    }
    findAll(req) {
        return this.docs.findAll(req.user.sub);
    }
    create(req, body) {
        return this.docs.create(req.user.sub, body);
    }
    async update(req, id, body) {
        const updated = await this.docs.update(req.user.sub, id, body);
        if (!updated)
            throw new common_1.NotFoundException('Document not found');
        return updated;
    }
    async remove(req, id) {
        const count = await this.docs.delete(req.user.sub, id);
        if (count === 0)
            throw new common_1.NotFoundException('Document not found');
        return { deleted: true };
    }
    async uploadPdf(req, id) {
        const file = req.file;
        if (!file)
            throw new common_1.NotFoundException('No file uploaded');
        const isPdf = file.mimetype === 'application/pdf' ||
            file.originalname.toLowerCase().endsWith('.pdf');
        if (!isPdf)
            throw new common_1.UnsupportedMediaTypeException('Only PDF files are allowed');
        if (this.storage.isEnabled()) {
            const buf = file.buffer;
            if (!buf)
                throw new common_1.NotFoundException('File buffer missing (S3 mode)');
            const key = this.storage.buildKey({
                userId: req.user.sub,
                docId: id,
                originalName: file.originalname,
            });
            await this.storage.putPdf({
                key,
                buffer: buf,
                mime: file.mimetype || 'application/pdf',
            });
            const updated = await this.docs.attachFile(req.user.sub, id, {
                path: key,
                originalname: safeFileName(file.originalname),
                mimetype: file.mimetype || 'application/pdf',
                size: file.size,
            });
            if (!updated)
                throw new common_1.NotFoundException('Document not found');
            return updated;
        }
        const updated = await this.docs.attachFile(req.user.sub, id, {
            path: file.path,
            originalname: safeFileName(file.originalname),
            mimetype: file.mimetype,
            size: file.size,
        });
        if (!updated)
            throw new common_1.NotFoundException('Document not found');
        return updated;
    }
    async removePdf(req, id) {
        if (this.storage.isEnabled()) {
            const meta = await this.docs.getFileMeta(req.user.sub, id);
            if (!meta)
                throw new common_1.NotFoundException('Document not found');
            if (meta.filePath) {
                try {
                    await this.storage.deleteObject(meta.filePath);
                }
                catch {
                }
            }
        }
        const updated = await this.docs.removeFile(req.user.sub, id);
        if (!updated)
            throw new common_1.NotFoundException('Document not found');
        return updated;
    }
    async downloadPdf(req, id, res) {
        const meta = await this.docs.getFileMeta(req.user.sub, id);
        if (!meta)
            throw new common_1.NotFoundException('Document not found');
        if (!meta.filePath || !meta.fileName)
            throw new common_1.NotFoundException('No file attached');
        res.setHeader('Content-Type', meta.fileMime || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${meta.fileName}"`);
        if (this.storage.isEnabled()) {
            const stream = await this.storage.getObjectStream(meta.filePath);
            stream.pipe(res);
            return;
        }
        if (!(0, fs_1.existsSync)(meta.filePath))
            throw new common_1.NotFoundException('File missing on server');
        const stream = (0, fs_1.createReadStream)(meta.filePath);
        stream.pipe(res);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: process.env.S3_BUCKET
            ? (0, multer_1.memoryStorage)()
            : (0, multer_1.diskStorage)({
                destination: (0, path_1.join)(process.cwd(), 'uploads'),
                filename: (_req, file, cb) => {
                    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                    const ext = (0, path_1.extname)(file.originalname || '.pdf') || '.pdf';
                    cb(null, `${unique}${ext}`);
                },
            }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "uploadPdf", null);
__decorate([
    (0, common_1.Delete)(':id/file'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "removePdf", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], DocumentsController.prototype, "downloadPdf", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('api/v1/documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService,
        storage_service_1.StorageService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map