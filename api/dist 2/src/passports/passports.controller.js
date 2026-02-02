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
exports.PassportsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const passports_service_1 = require("./passports.service");
let PassportsController = class PassportsController {
    passports;
    constructor(passports) {
        this.passports = passports;
    }
    list(req) {
        return this.passports.findAll(req.user.sub);
    }
    async create(req, body) {
        const created = await this.passports.create(req.user.sub, body.countryCode);
        if (!created)
            throw new common_1.ConflictException('Passport already exists');
        return created;
    }
    async remove(req, countryCode) {
        const count = await this.passports.remove(req.user.sub, countryCode);
        return { deleted: count > 0 };
    }
};
exports.PassportsController = PassportsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PassportsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PassportsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':countryCode'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PassportsController.prototype, "remove", null);
exports.PassportsController = PassportsController = __decorate([
    (0, common_1.Controller)('api/v1/passports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [passports_service_1.PassportsService])
], PassportsController);
//# sourceMappingURL=passports.controller.js.map