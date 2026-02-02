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
exports.PassportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PassportsService = class PassportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(userId) {
        return this.prisma.passport.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: { id: true, countryCode: true, createdAt: true },
        });
    }
    async create(userId, countryCodeRaw) {
        const countryCode = (countryCodeRaw || '').trim().toUpperCase();
        if (!countryCode || countryCode.length !== 2) {
            throw new Error('Invalid countryCode (expected ISO2 like "FR")');
        }
        const existing = await this.prisma.passport.findUnique({
            where: {
                userId_countryCode: { userId, countryCode },
            },
            select: { id: true },
        });
        if (existing)
            return null;
        return this.prisma.passport.create({
            data: { userId, countryCode },
            select: { id: true, countryCode: true, createdAt: true },
        });
    }
    async remove(userId, countryCodeRaw) {
        const raw = (countryCodeRaw || "").trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);
        const where = isUuid
            ? { id: raw, userId }
            : { userId, countryCode: raw.toUpperCase() };
        const r = await this.prisma.passport.deleteMany({ where });
        return r.count;
    }
};
exports.PassportsService = PassportsService;
exports.PassportsService = PassportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PassportsService);
//# sourceMappingURL=passports.service.js.map