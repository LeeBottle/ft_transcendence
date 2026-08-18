import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CategoryKey,
  ScoreSheet,
  calculateScore,
  calculateTotalScore,
} from './yacht.score';

export interface PlayerGameState {
  slotNum: number;
  nickname: string;
  isAi: boolean;
  scores: ScoreSheet;
}

export interface GameState {
  roomId: string;
  round: number; // 1 ~ 12
  currentTurnIndex: number;
  players: PlayerGameState[];
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  isFinished: boolean;
  winner: string | null;
}

@Injectable()
export class YachtService {
  // In-memory game state store indexed by roomId
  private games: Map<string, GameState> = new Map();

  constructor(private prisma: PrismaService) {}

  async createRoom(data: {
    title: string;
    hostNickname: string;
    password?: string | null;
    isPublic: boolean;
    slots: {
      p2: 'NONE' | 'HUMAN' | 'AI';
      p3: 'NONE' | 'HUMAN' | 'AI';
      p4: 'NONE' | 'HUMAN' | 'AI';
    };
  }) {
    const maxPlayers =
      1 +
      (data.slots.p2 !== 'NONE' ? 1 : 0) +
      (data.slots.p3 !== 'NONE' ? 1 : 0) +
      (data.slots.p4 !== 'NONE' ? 1 : 0);

    const currentPlayers =
      1 +
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

        // Slot 1
        slot1Ready: false,

        // Slot 2
        slot2Open: data.slots.p2 !== 'NONE',
        slot2IsAi: data.slots.p2 === 'AI',
        slot2Nick: data.slots.p2 === 'AI' ? '🤖 AI Bot 1' : null,
        slot2Ready: data.slots.p2 === 'AI',

        // Slot 3
        slot3Open: data.slots.p3 !== 'NONE',
        slot3IsAi: data.slots.p3 === 'AI',
        slot3Nick: data.slots.p3 === 'AI' ? '🤖 AI Bot 2' : null,
        slot3Ready: data.slots.p3 === 'AI',

        // Slot 4
        slot4Open: data.slots.p4 !== 'NONE',
        slot4IsAi: data.slots.p4 === 'AI',
        slot4Nick: data.slots.p4 === 'AI' ? '🤖 AI Bot 3' : null,
        slot4Ready: data.slots.p4 === 'AI',
      },
    });
  }

  // 특정 방 조회 메서드
  async getRoomById(id: string) {
    return await this.prisma.room.findUnique({
      where: { id },
    });
  }

  // 방 입장
  async joinRoom(roomId: string, nickname: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('방이 존재하지 않습니다.');

    if (room.hostNickname === nickname) {
      return room;
    }

    if (
      room.slot2Nick === nickname ||
      room.slot3Nick === nickname ||
      room.slot4Nick === nickname
    ) {
      return room;
    }

    const updateData: any = {};
    if (room.slot2Open && !room.slot2IsAi && !room.slot2Nick) {
      updateData.slot2Nick = nickname;
      updateData.slot2Ready = false;
    } else if (room.slot3Open && !room.slot3IsAi && !room.slot3Nick) {
      updateData.slot3Nick = nickname;
      updateData.slot3Ready = false;
    } else if (room.slot4Open && !room.slot4IsAi && !room.slot4Nick) {
      updateData.slot4Nick = nickname;
      updateData.slot4Ready = false;
    } else {
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

  // 방 퇴장
  async leaveRoom(roomId: string, nickname: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return null;

    if (room.hostNickname === nickname) {
      this.games.delete(roomId);
      return await this.prisma.room.delete({ where: { id: roomId } });
    }

    const updateData: any = {};
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

  // 준비 상태 토글
  async toggleReady(roomId: string, nickname: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new Error('방이 존재하지 않습니다.');

    const updateData: any = {};
    if (room.hostNickname === nickname) {
      updateData.slot1Ready = !room.slot1Ready;
    } else if (room.slot2Nick === nickname) {
      updateData.slot2Ready = !room.slot2Ready;
    } else if (room.slot3Nick === nickname) {
      updateData.slot3Ready = !room.slot3Ready;
    } else if (room.slot4Nick === nickname) {
      updateData.slot4Ready = !room.slot4Ready;
    } else {
      throw new Error('방에 참가 중인 플레이어가 아닙니다.');
    }

    return await this.prisma.room.update({
      where: { id: roomId },
      data: updateData,
    });
  }

  // 전체 방 목록 조회
  async getRooms() {
    return await this.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // 🎮 GAME LOGIC SYSTEM (Step 3 Core)
  // ==========================================

  async initGame(roomId: string): Promise<GameState> {
    const room = await this.getRoomById(roomId);
    if (!room) throw new Error('방을 찾을 수 없습니다.');

    const players: PlayerGameState[] = [];
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

    const gameState: GameState = {
      roomId,
      round: 1,
      currentTurnIndex: 0,
      players,
      dice: initialDice,
      held: [false, false, false, false, false],
      rollsLeft: 3, // 첫 턴 시작 시 남은 횟수 3번 (수동으로 굴리기 시작)
      isFinished: false,
      winner: null,
    };

    this.games.set(roomId, gameState);
    await this.checkAndExecuteAiTurn(gameState);
    return gameState;
  }

  async getGameState(roomId: string): Promise<GameState> {
    let game = this.games.get(roomId);
    if (!game) {
      game = await this.initGame(roomId);
    } else {
      await this.checkAndExecuteAiTurn(game);
    }
    return game;
  }

  async rollDice(roomId: string, nickname: string, held: boolean[]): Promise<GameState> {
    const game = this.games.get(roomId);
    if (!game) throw new Error('진행 중인 게임이 없습니다.');
    if (game.isFinished) throw new Error('이미 종료된 게임입니다.');

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

  async selectScoreCategory(
    roomId: string,
    nickname: string,
    category: CategoryKey,
  ): Promise<GameState> {
    const game = this.games.get(roomId);
    if (!game) throw new Error('진행 중인 게임이 없습니다.');
    if (game.isFinished) throw new Error('이미 종료된 게임입니다.');

    const currentPlayer = game.players[game.currentTurnIndex];
    const cleanPlayerNick = currentPlayer.nickname.replace(/ \(방장\)$/, '');
    if (cleanPlayerNick !== nickname) {
      throw new Error('현재 본인의 턴이 아닙니다.');
    }

    if (currentPlayer.scores[category] !== undefined && currentPlayer.scores[category] !== null) {
      throw new Error('이미 점수를 기록한 카테고리입니다.');
    }

    // 점수 기록
    const score = calculateScore(category, game.dice);
    currentPlayer.scores[category] = score;

    // 턴 교대 준비
    this.advanceTurn(game);

    // 다음 턴이 AI일 경우 자동 처리
    await this.checkAndExecuteAiTurn(game);

    return game;
  }

  private advanceTurn(game: GameState) {
    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

    // 모든 유저가 한 바퀴 돈 경우 라운드 증가
    if (game.currentTurnIndex === 0) {
      game.round += 1;
    }

    // 12라운드 초과 시 게임 종료
    if (game.round > 12) {
      game.isFinished = true;
      let maxScore = -1;
      let winnerName = '';

      for (const p of game.players) {
        const { total } = calculateTotalScore(p.scores);
        if (total > maxScore) {
          maxScore = total;
          winnerName = p.nickname;
        }
      }
      game.winner = `${winnerName} (${maxScore}점)`;
      return;
    }

    // 새 턴 주사위 초기화 (남은 횟수 3번)
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

  // 🤖 AI 턴 자동 수행 로직 (실제 AI 자동 진행 로직 비활성화)
  private async checkAndExecuteAiTurn(game: GameState) {
    // 실제 AI 자동 턴 진행 로직을 제거하여 AI 턴일 때 더 이상 자동으로 주사위를 굴리거나 점수를 기록하지 않습니다.
    return;
  }
}
