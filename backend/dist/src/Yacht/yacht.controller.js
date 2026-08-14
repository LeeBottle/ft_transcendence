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
exports.YachtController = void 0;
const common_1 = require("@nestjs/common");
const yacht_service_1 = require("./yacht.service");
let YachtController = class YachtController {
    constructor(yachtService) {
        this.yachtService = yachtService;
    }
    async createRoom(body) {
        return await this.yachtService.createRoom(body);
    }
    async getRooms() {
        return await this.yachtService.getRooms();
    }
    async getRoomById(id) {
        return await this.yachtService.getRoomById(id);
    }
    async joinRoom(id, body) {
        return await this.yachtService.joinRoom(id, body.nickname);
    }
    async leaveRoom(id, body) {
        return await this.yachtService.leaveRoom(id, body.nickname);
    }
    async toggleReady(id, body) {
        return await this.yachtService.toggleReady(id, body.nickname);
    }
    async getGameState(id) {
        return await this.yachtService.getGameState(id);
    }
    async startGame(id) {
        return await this.yachtService.initGame(id);
    }
    async rollDice(id, body) {
        return await this.yachtService.rollDice(id, body.nickname, body.held);
    }
    async selectScoreCategory(id, body) {
        return await this.yachtService.selectScoreCategory(id, body.nickname, body.category);
    }
};
exports.YachtController = YachtController;
__decorate([
    (0, common_1.Post)('rooms'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Get)('rooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "getRooms", null);
__decorate([
    (0, common_1.Get)('rooms/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "getRoomById", null);
__decorate([
    (0, common_1.Post)('rooms/:id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Post)('rooms/:id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "leaveRoom", null);
__decorate([
    (0, common_1.Post)('rooms/:id/ready'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "toggleReady", null);
__decorate([
    (0, common_1.Get)('rooms/:id/game'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "getGameState", null);
__decorate([
    (0, common_1.Post)('rooms/:id/game/start'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "startGame", null);
__decorate([
    (0, common_1.Post)('rooms/:id/game/roll'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "rollDice", null);
__decorate([
    (0, common_1.Post)('rooms/:id/game/score'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YachtController.prototype, "selectScoreCategory", null);
exports.YachtController = YachtController = __decorate([
    (0, common_1.Controller)('yacht'),
    __metadata("design:paramtypes", [yacht_service_1.YachtService])
], YachtController);
//# sourceMappingURL=yacht.controller.js.map