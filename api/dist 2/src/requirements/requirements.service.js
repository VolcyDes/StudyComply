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
exports.RequirementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RequirementsService = class RequirementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async compute(userId) {
        const passports = await this.prisma.passport.findMany({
            where: { userId },
            select: { countryCode: true },
        });
        const project = await this.prisma.mobilityProject.findFirst({
            where: { userId, isActive: true },
            orderBy: { createdAt: 'desc' },
            select: { destinationCountry: true, purpose: true, startDate: true, endDate: true },
        });
        if (!project) {
            return {
                passports: passports.map(p => p.countryCode),
                project: null,
                required: [],
                missing: [],
                note: 'No active project yet',
            };
        }
        const passportCountries = passports.map(p => p.countryCode);
        const durationDays = Math.max(0, Math.ceil((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const rules = await this.prisma.requirementRule.findMany({
            where: {
                passportCountry: { in: passportCountries.length ? passportCountries : ['__NONE__'] },
                destinationCountry: project.destinationCountry,
                purpose: project.purpose,
            },
            select: {
                id: true,
                requiredType: true,
                title: true,
                notes: true,
                minDays: true,
                maxDays: true,
                passportCountry: true,
            },
            orderBy: { title: 'asc' },
        });
        const applicable = rules.filter(r => {
            if (r.minDays != null && durationDays < r.minDays)
                return false;
            if (r.maxDays != null && durationDays > r.maxDays)
                return false;
            return true;
        });
        const requiredTypes = Array.from(new Set(applicable.map(r => r.requiredType)));
        const existingDocs = await this.prisma.document.findMany({
            where: { userId },
            select: { id: true, type: true, title: true },
        });
        const existingTypes = new Set(existingDocs.map(d => d.type));
        const missingTypes = requiredTypes.filter(t => !existingTypes.has(t));
        const missing = applicable.filter(r => missingTypes.includes(r.requiredType));
        return {
            passports: passportCountries,
            project: {
                destinationCountry: project.destinationCountry,
                purpose: project.purpose,
                startDate: project.startDate,
                endDate: project.endDate,
                durationDays,
            },
            required: applicable,
            missing,
        };
    }
};
exports.RequirementsService = RequirementsService;
exports.RequirementsService = RequirementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequirementsService);
//# sourceMappingURL=requirements.service.js.map