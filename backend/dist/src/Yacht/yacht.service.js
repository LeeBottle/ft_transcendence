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
exports.YachtService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const yacht_score_1 = require("./yacht.score");
let YachtService = class YachtService {
    constructor(prisma) {
        this.prisma = prisma;
        this.games = new Map();
    }
    async createRoom(data) {
        const maxPlayers = 1 +
            (data.slots.p2 !== 'NONE' ? 1 : 0) +
            (data.slots.p3 !== 'NONE' ? 1 : 0) +
            (data.slots.p4 !== 'NONE' ? 1 : 0);
        const currentPlayers = 1 +
            (data.slots.p2 === 'AI' ? 1 : 0) +
            (data.slots.p3 === 'AI' ? 1 : 0) +
            (data.slots.p4 === 'AI' ? 1 : 0);
        return await this.prisma.room.create({
            data: {
                title: data.title,
                hostNickname: data.hostNickname,
                password: data.password || null,
                isPublic: data.isPublic,
                maxPlayers,
                currentPlayers,
                slot1Ready: false,
                slot2Open: data.slots.p2 !== 'NONE',
                slot2IsAi: data.slots.p2 === 'AI',
                slot2Nick: data.slots.p2 === 'AI' ? '🤖 AI Bot 1' : null,
                slot2Ready: data.slots.p2 === 'AI',
                slot3Open: data.slots.p3 !== 'NONE',
                slot3IsAi: data.slots.p3 === 'AI',
                slot3Nick: data.slots.p3 === 'AI' ? '🤖 AI Bot 2' : null,
                slot3Ready: data.slots.p3 === 'AI',
                slot4Open: data.slots.p4 !== 'NONE',
                slot4IsAi: data.slots.p4 === 'AI',
                slot4Nick: data.slots.p4 === 'AI' ? '🤖 AI Bot 3' : null,
                slot4Ready: data.slots.p4 === 'AI',
            },
        });
    }
    async getRoomById(id) {
        return await this.prisma.room.findUnique({
            where: { id },
        });
    }
    async joinRoom(roomId, nickname) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room)
            throw new Error('방이 존재하지 않습니다.');
        if (room.hostNickname === nickname) {
            return room;
        }
        if (room.slot2Nick === nickname ||
            room.slot3Nick === nickname ||
            room.slot4Nick === nickname) {
            return room;
        }
        const updateData = {};
        if (room.slot2Open && !room.slot2IsAi && !room.slot2Nick) {
            updateData.slot2Nick = nickname;
            updateData.slot2Ready = false;
        }
        else if (room.slot3Open && !room.slot3IsAi && !room.slot3Nick) {
            updateData.slot3Nick = nickname;
            updateData.slot3Ready = false;
        }
        else if (room.slot4Open && !room.slot4IsAi && !room.slot4Nick) {
            updateData.slot4Nick = nickname;
            updateData.slot4Ready = false;
        }
        else {
            throw new Error('참여 가능한 빈 슬롯이 없습니다.');
        }
        const slot2Occupied = (updateData.slot2Nick || room.slot2Nick) ? 1 : 0;
        const slot3Occupied = (updateData.slot3Nick || room.slot3Nick) ? 1 : 0;
        const slot4Occupied = (updateData.slot4Nick || room.slot4Nick) ? 1 : 0;
        updateData.currentPlayers = 1 + slot2Occupied + slot3Occupied + slot4Occupied;
        return await this.prisma.room.update({
            where: { id: roomId },
            data: updateData,
        });
    }
    async leaveRoom(roomId, nickname) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room)
            return null;
        if (room.hostNickname === nickname) {
            this.games.delete(roomId);
            return await this.prisma.room.delete({ where: { id: roomId } });
        }
        const updateData = {};
        if (room.slot2Nick === nickname) {
            updateData.slot2Nick = null;
            updateData.slot2Ready = false;
        }
        if (room.slot3Nick === nickname) {
            updateData.slot3Nick = null;
            updateData.slot3Ready = false;
        }
        if (room.slot4Nick === nickname) {
            updateData.slot4Nick = null;
            updateData.slot4Ready = false;
        }
        if (Object.keys(updateData).length > 0) {
            const slot2Occupied = (updateData.slot2Nick !== undefined ? updateData.slot2Nick : room.slot2Nick) ? 1 : 0;
            const slot3Occupied = (updateData.slot3Nick !== undefined ? updateData.slot3Nick : room.slot3Nick) ? 1 : 0;
            const slot4Occupied = (updateData.slot4Nick !== undefined ? updateData.slot4Nick : room.slot4Nick) ? 1 : 0;
            updateData.currentPlayers = 1 + slot2Occupied + slot3Occupied + slot4Occupied;
            return await this.prisma.room.update({
                where: { id: roomId },
                data: updateData,
            });
        }
        return room;
    }
    async toggleReady(roomId, nickname) {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room)
            throw new Error('방이 존재하지 않습니다.');
        const updateData = {};
        if (room.hostNickname === nickname) {
            updateData.slot1Ready = !room.slot1Ready;
        }
        else if (room.slot2Nick === nickname) {
            updateData.slot2Ready = !room.slot2Ready;
        }
        else if (room.slot3Nick === nickname) {
            updateData.slot3Ready = !room.slot3Ready;
        }
        else if (room.slot4Nick === nickname) {
            updateData.slot4Ready = !room.slot4Ready;
        }
        else {
            throw new Error('방에 참가 중인 플레이어가 아닙니다.');
        }
        return await this.prisma.room.update({
            where: { id: roomId },
            data: updateData,
        });
    }
    async getRooms() {
        return await this.prisma.room.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async initGame(roomId) {
        const room = await this.getRoomById(roomId);
        if (!room)
            throw new Error('방을 찾을 수 없습니다.');
        const players = [];
        players.push({
            slotNum: 1,
            nickname: `${room.hostNickname} (방장)`,
            isAi: false,
            scores: {},
        });
        if (room.slot2Open && room.slot2Nick) {
            players.push({
                slotNum: 2,
                nickname: room.slot2Nick,
                isAi: room.slot2IsAi,
                scores: {},
            });
        }
        if (room.slot3Open && room.slot3Nick) {
            players.push({
                slotNum: 3,
                nickname: room.slot3Nick,
                isAi: room.slot3IsAi,
                scores: {},
            });
        }
        if (room.slot4Open && room.slot4Nick) {
            players.push({
                slotNum: 4,
                nickname: room.slot4Nick,
                isAi: room.slot4IsAi,
                scores: {},
            });
        }
        const initialDice = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
        ];
        const gameState = {
            roomId,
            round: 1,
            currentTurnIndex: 0,
            players,
            dice: initialDice,
            held: [false, false, false, false, false],
            rollsLeft: 3,
            isFinished: false,
            winner: null,
        };
        this.games.set(roomId, gameState);
        await this.checkAndExecuteAiTurn(gameState);
        return gameState;
    }
    async getGameState(roomId) {
        let game = this.games.get(roomId);
        if (!game) {
            game = await this.initGame(roomId);
        }
        else {
            await this.checkAndExecuteAiTurn(game);
        }
        return game;
    }
    async rollDice(roomId, nickname, held) {
        const game = this.games.get(roomId);
        if (!game)
            throw new Error('진행 중인 게임이 없습니다.');
        if (game.isFinished)
            throw new Error('이미 종료된 게임입니다.');
        const currentPlayer = game.players[game.currentTurnIndex];
        const cleanPlayerNick = currentPlayer.nickname.replace(/ \(방장\)$/, '');
        if (cleanPlayerNick !== nickname) {
            throw new Error('현재 본인의 턴이 아닙니다.');
        }
        if (game.rollsLeft <= 0) {
            throw new Error('주사위를 더 이상 굴릴 수 없습니다. 점수를 선택하세요.');
        }
        game.held = held;
        for (let i = 0; i < 5; i++) {
            if (!game.held[i]) {
                game.dice[i] = Math.floor(Math.random() * 6) + 1;
            }
        }
        game.rollsLeft -= 1;
        return game;
    }
    async selectScoreCategory(roomId, nickname, category) {
        const game = this.games.get(roomId);
        if (!game)
            throw new Error('진행 중인 게임이 없습니다.');
        if (game.isFinished)
            throw new Error('이미 종료된 게임입니다.');
        const currentPlayer = game.players[game.currentTurnIndex];
        const cleanPlayerNick = currentPlayer.nickname.replace(/ \(방장\)$/, '');
        if (cleanPlayerNick !== nickname) {
            throw new Error('현재 본인의 턴이 아닙니다.');
        }
        if (currentPlayer.scores[category] !== undefined && currentPlayer.scores[category] !== null) {
            throw new Error('이미 점수를 기록한 카테고리입니다.');
        }
        const score = (0, yacht_score_1.calculateScore)(category, game.dice);
        currentPlayer.scores[category] = score;
        this.advanceTurn(game);
        await this.checkAndExecuteAiTurn(game);
        return game;
    }
    advanceTurn(game) {
        game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
        if (game.currentTurnIndex === 0) {
            game.round += 1;
        }
        if (game.round > 12) {
            game.isFinished = true;
            let maxScore = -1;
            let winnerName = '';
            for (const p of game.players) {
                const { total } = (0, yacht_score_1.calculateTotalScore)(p.scores);
                if (total > maxScore) {
                    maxScore = total;
                    winnerName = p.nickname;
                }
            }
            game.winner = `${winnerName} (${maxScore}점)`;
            return;
        }
        game.held = [false, false, false, false, false];
        game.dice = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
        ];
        game.rollsLeft = 3;
    }
    async checkAndExecuteAiTurn(game) {
        return;
    }
};
exports.YachtService = YachtService;
exports.YachtService = YachtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], YachtService);
//# sourceMappingURL=yacht.service.js.map