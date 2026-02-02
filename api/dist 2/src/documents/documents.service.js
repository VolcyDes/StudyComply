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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    publicSelect = {
        id: true,
        title: true,
        type: true,
        expiresAt: true,
        createdAt: true,
        userId: true,
        fileName: true,
        fileMime: true,
        fileSize: true,
    };
    async create(userId, body) {
        return this.prisma.document.create({
            data: {
                title: body.title,
                type: body.type,
                expiresAt: new Date(body.expiresAt),
                userId,
            },
            select: this.publicSelect,
        });
    }
    async findAll(userId) {
        return this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: this.publicSelect,
        });
    }
    async update(userId, id, body) {
        const existing = await this.prisma.document.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!existing)
            return null;
        return this.prisma.document.update({
            where: { id },
            data: {
                ...(body.title !== undefined ? { title: body.title } : {}),
                ...(body.type !== undefined ? { type: body.type } : {}),
                ...(body.expiresAt !== undefined ? { expiresAt: new Date(body.expiresAt) } : {}),
            },
            select: this.publicSelect,
        });
    }
    async delete(userId, id) {
        const existing = await this.prisma.document.findFirst({
            where: { id, userId },
            select: { id: true, filePath: true },
        });
        if (!existing)
            return 0;
        if (existing.filePath && (0, fs_1.existsSync)(existing.filePath)) {
            try {
                await (0, promises_1.unlink)(existing.filePath);
            }
            catch {
            }
        }
        await this.prisma.document.delete({ where: { id } });
        return 1;
    }
    async attachFile(userId, id, file) {
        const existing = await this.prisma.document.findFirst({
            where: { id, userId },
            select: { id: true, filePath: true },
        });
        if (!existing)
            return null;
        if (existing.filePath && (0, fs_1.existsSync)(existing.filePath)) {
            try {
                await (0, promises_1.unlink)(existing.filePath);
            }
            catch {
            }
        }
        return this.prisma.document.update({
            where: { id },
            data: {
                filePath: file.path,
                fileName: file.originalname,
                fileMime: file.mimetype,
                fileSize: file.size,
            },
            select: this.publicSelect,
        });
    }
    async getFileMeta(userId, id) {
        return this.prisma.document.findFirst({
            where: { id, userId },
            select: {
                id: true,
                filePath: true,
                fileName: true,
                fileMime: true,
                fileSize: true,
            },
        });
    }
    async removeFile(userId, id) {
        const existing = await this.prisma.document.findFirst({
            where: { id, userId },
            select: { id: true, filePath: true },
        });
        if (!existing)
            return null;
        if (existing.filePath && (0, fs_1.existsSync)(existing.filePath)) {
            try {
                await (0, promises_1.unlink)(existing.filePath);
            }
            catch {
            }
        }
        return this.prisma.document.update({
            where: { id },
            data: {
                filePath: null,
                fileName: null,
                fileMime: null,
                fileSize: null,
            },
            select: this.publicSelect,
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map