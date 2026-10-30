import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CategoryKey,
  ScoreSheet,
  calculateScore,
  calculateTotalScore,
} from './yacht.score';
import { YachtAiEngine, AiDifficulty } from './yacht.ai';

export interface PlayerGameState {
  slotNum: number;
  nickname: string;
  isAi: boolean;
  aiDifficulty?: AiDifficulty;
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
  endReason?: 'NORMAL' | 'OPPONENT_LEFT' | null;
  leftPlayers?: string[];
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
    aiLevels?: {
      p2?: AiDifficulty;
      p3?: AiDifficulty;
      p4?: AiDifficulty;
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

    const p2Level = data.aiLevels?.p2 || 'NOVICE';
    const p3Level = data.aiLevels?.p3 || 'NOVICE';
    const p4Level = data.aiLevels?.p4 || 'NOVICE';

    const getLevelTag = (lvl: AiDifficulty) => (lvl === 'NOVICE' ? '초급' : lvl === 'INTERMEDIATE' ? '중급' : '고급');

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
        slot2AiLevel: p2Level,
        slot2Nick: data.slots.p2 === 'AI' ? `🤖 AI Bot 1 [${getLevelTag(p2Level)}]` : null,
        slot2Ready: data.slots.p2 === 'AI',

        // Slot 3
        slot3Open: data.slots.p3 !== 'NONE',
        slot3IsAi: data.slots.p3 === 'AI',
        slot3AiLevel: p3Level,
        slot3Nick: data.slots.p3 === 'AI' ? `🤖 AI Bot 2 [${getLevelTag(p3Level)}]` : null,
        slot3Ready: data.slots.p3 === 'AI',

        // Slot 4
        slot4Open: data.slots.p4 !== 'NONE',
        slot4IsAi: data.slots.p4 === 'AI',
        slot4AiLevel: p4Level,
        slot4Nick: data.slots.p4 === 'AI' ? `🤖 AI Bot 3 [${getLevelTag(p4Level)}]` : null,
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

  // 🚪 방 퇴장 및 인게임 탈주(기권)/부전승 처리
  async leaveRoom(roomId: string, nickname: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return null;

    const cleanNick = nickname.replace(/ \(방장\)$/, '');
    const game = this.games.get(roomId);

    // 🎯 게임 진행 도중 퇴장한 경우 (자동 기권 및 패배 처리)
    if (game && !game.isFinished) {
      if (!game.leftPlayers) game.leftPlayers = [];
      if (!game.leftPlayers.includes(cleanNick)) {
        game.leftPlayers.push(cleanNick);
      }

      // 남아있는 플레이어 목록 확인
      const remainingPlayers = game.players.filter(
        (p) => !game.leftPlayers?.includes(p.nickname.replace(/ \(방장\)$/, ''))
      );

      // 마지막 1명만 남은 경우 ➔ '게임을 진행할 수 없습니다' 부전승 승리 처리!
      if (remainingPlayers.length <= 1) {
        game.isFinished = true;
        game.endReason = 'OPPONENT_LEFT';

        const lastSurvivor = remainingPlayers[0] || game.players.find(p => p.nickname.replace(/ \(방장\)$/, '') !== cleanNick);
        if (lastSurvivor) {
          game.winner = `${lastSurvivor.nickname} (상대방 퇴장으로 인한 부전승)`;
        }

        // DB에 생존자 1위 승리 및 탈주자 패배 기록 아카이빙
        await this.archiveGameWithForfeit(game, cleanNick);
        return room;
      }

      // 3인 이상 게임에서 1명만 나간 경우: 만약 나간 플레이어의 턴이었다면 다음 턴으로 넘김
      const currentTurnNick = game.players[game.currentTurnIndex]?.nickname.replace(/ \(방장\)$/, '');
      if (currentTurnNick === cleanNick) {
        await this.advanceTurn(game);
      }
    }

    // 대기실에서 방장이 나간 경우 방 삭제
    if (room.hostNickname === cleanNick && (!game || game.isFinished)) {
      this.games.delete(roomId);
      return await this.prisma.room.delete({ where: { id: roomId } }).catch(() => null);
    }

    // 슬롯 비우기
    const updateData: any = {};
    if (room.slot2Nick === cleanNick) {
      updateData.slot2Nick = null;
      updateData.slot2Ready = false;
    }
    if (room.slot3Nick === cleanNick) {
      updateData.slot3Nick = null;
      updateData.slot3Ready = false;
    }
    if (room.slot4Nick === cleanNick) {
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

  // 🏆 탈주/기권으로 인한 부전승 매치 아카이빙 저장
  private async archiveGameWithForfeit(game: GameState, forfeitNick: string) {
    try {
      const remainingPlayers = game.players.filter(
        (p) => !game.leftPlayers?.includes(p.nickname.replace(/ \(방장\)$/, ''))
      );
      const survivor = remainingPlayers[0] || game.players[0];
      const survivorCleanNick = survivor.nickname.replace(/ \(방장\)$/, '');

      const room = await this.prisma.room.findUnique({ where: { id: game.roomId } });

      await this.prisma.matchHistory.create({
        data: {
          roomId: game.roomId,
          roomTitle: room?.title || '요트 다이스 게임',
          gameType: room?.isPublic ? 'MULTI' : 'SINGLE_AI',
          totalRounds: game.round,
          winnerNickname: survivorCleanNick,
          winnerScore: calculateTotalScore(survivor.scores).total,
          participants: {
            create: game.players.map((p) => {
              const cleanP = p.nickname.replace(/ \(방장\)$/, '');
              const isSurvivor = cleanP === survivorCleanNick;
              return {
                nickname: cleanP,
                isAi: p.isAi,
                rank: isSurvivor ? 1 : game.players.length, // 생존자는 1위, 기권자는 꼴찌 패배
                totalScore: calculateTotalScore(p.scores).total,
                scoresSheet: p.scores as any,
              };
            }),
          },
        },
      });

      console.log(`🏆 [부전승 처리 완료] 상대방(${forfeitNick}) 퇴장 ➔ [${survivorCleanNick}] 님 1위 승리!`);

      if (!survivor.isAi) {
        await this.grantTitleToUser(survivorCleanNick, '첫 승리의 주역');
      }
    } catch (err) {
      console.error('Failed to archive forfeit match:', err);
    }
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

  // 공개 방 목록 조회 (비공개방 및 개인전은 목록에서 제외)
  async getRooms() {
    return await this.prisma.room.findMany({
      where: { isPublic: true },
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
        aiDifficulty: (room.slot2AiLevel as AiDifficulty) || 'NOVICE',
        scores: {},
      });
    }
    if (room.slot3Open && room.slot3Nick) {
      players.push({
        slotNum: 3,
        nickname: room.slot3Nick,
        isAi: room.slot3IsAi,
        aiDifficulty: (room.slot3AiLevel as AiDifficulty) || 'NOVICE',
        scores: {},
      });
    }
    if (room.slot4Open && room.slot4Nick) {
      players.push({
        slotNum: 4,
        nickname: room.slot4Nick,
        isAi: room.slot4IsAi,
        aiDifficulty: (room.slot4AiLevel as AiDifficulty) || 'NOVICE',
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

  async updateHeld(roomId: string, nickname: string, held: boolean[]): Promise<GameState> {
    const game = this.games.get(roomId);
    if (!game) throw new Error('진행 중인 게임이 없습니다.');
    if (game.isFinished) throw new Error('이미 종료된 게임입니다.');

    const currentPlayer = game.players[game.currentTurnIndex];
    const cleanPlayerNick = currentPlayer.nickname.replace(/ \(방장\)$/, '');
    if (cleanPlayerNick !== nickname) {
      throw new Error('현재 본인의 턴이 아닙니다.');
    }

    // 굴리기가 1회 이상 진행된 경우(rollsLeft < 3, rollsLeft > 0)에만 KEEP 반영
    if (game.rollsLeft < 3 && game.rollsLeft > 0) {
      game.held = held;
    }

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
    await this.advanceTurn(game);

    // 다음 턴이 AI일 경우 자동 처리
    await this.checkAndExecuteAiTurn(game);

    return game;
  }

  private async advanceTurn(game: GameState) {
    game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

    // 모든 유저가 한 바퀴 돈 경우 라운드 증가
    if (game.currentTurnIndex === 0) {
      game.round += 1;
    }

    // 12라운드 초과 시 게임 종료
    if (game.round > 12) {
      game.isFinished = true;
      await this.archiveGame(game);
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

  // 🎮 7-3 게임 종료 시 DB에 경기 결과 및 족보 스냅샷 영구 저장
  private async archiveGame(game: GameState) {
    try {
      const playerResults = game.players.map((p) => {
        const { total } = calculateTotalScore(p.scores);
        return {
          nickname: p.nickname,
          cleanNick: p.nickname.replace(/ \(방장\)$/, ''),
          isAi: p.isAi,
          scores: p.scores,
          total,
        };
      });

      // 점수 내림차순 정렬하여 순위 부여
      playerResults.sort((a, b) => b.total - a.total);
      const winner = playerResults[0];
      game.winner = `${winner.nickname} (${winner.total}점)`;

      const room = await this.prisma.room.findUnique({ where: { id: game.roomId } });

      const match = await this.prisma.matchHistory.create({
        data: {
          roomId: game.roomId,
          roomTitle: room?.title || '요트 다이스 게임',
          gameType: room?.isPublic ? 'MULTI' : 'SINGLE_AI',
          totalRounds: 12,
          winnerNickname: winner.cleanNick,
          winnerScore: winner.total,
          participants: {
            create: playerResults.map((p, idx) => ({
              nickname: p.cleanNick,
              isAi: p.isAi,
              rank: idx + 1,
              totalScore: p.total,
              scoresSheet: p.scores as any,
            })),
          },
        },
      });

      console.log(`✅ [전적 저장 완료] 매치 ID: ${match.id}, 승자: ${winner.cleanNick} (${winner.total}점)`);

      // 🏆 7-2 칭호 자동 해금 트리거
      // 1) 1위 승자에게 '첫 승리의 주역' 부여
      if (!winner.isAi) {
        await this.grantTitleToUser(winner.cleanNick, '첫 승리의 주역');
      }

      // 2) Yacht(50점)를 달성한 유저에게 '요트 마스터' 부여
      for (const p of playerResults) {
        const yachtScore = (p.scores as any)['yacht'] ?? (p.scores as any)['Yacht'];
        if (!p.isAi && yachtScore === 50) {
          await this.grantTitleToUser(p.cleanNick, '요트 마스터');
        }
      }

      // 3) AI가 포함된 방에서 인간이 1위를 한 경우 'AI 브레이커' 부여
      const hasAi = playerResults.some((p) => p.isAi);
      if (hasAi && !winner.isAi) {
        await this.grantTitleToUser(winner.cleanNick, 'AI 브레이커');
      }

      // 4) 연속 3승 달성 시 '불꽃 연승' 부여
      if (!winner.isAi) {
        const recentWins = await this.prisma.matchParticipant.findMany({
          where: { nickname: winner.cleanNick },
          orderBy: { match: { playedAt: 'desc' } },
          take: 3,
        });
        if (recentWins.length === 3 && recentWins.every((m) => m.rank === 1)) {
          await this.grantTitleToUser(winner.cleanNick, '불꽃 연승');
        }
      }
    } catch (err) {
      console.error('Failed to archive game match history:', err);
    }
  }

  // 칭호 자동 해금 유틸리티
  private async grantTitleToUser(cleanNickname: string, titleToUnlock: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { nickname: cleanNickname } });
      if (!user) return;

      const currentTitles = (user.unlockedTitles || '초급 슬라이더').split(',').map((t) => t.trim());
      if (!currentTitles.includes(titleToUnlock)) {
        currentTitles.push(titleToUnlock);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { unlockedTitles: currentTitles.join(',') },
        });
        console.log(`🎉 칭호 획득: [${cleanNickname}] 님이 '${titleToUnlock}' 칭호를 달성했습니다!`);
      }
    } catch (err) {
      console.error('Title grant error:', err);
    }
  }

  // 📊 특정 유저의 전적 통계 및 최근 경기 목록 조회
  async getUserMatchStats(nickname: string) {
    const cleanNick = nickname.replace(/ \(방장\)$/, '');

    const participants = await this.prisma.matchParticipant.findMany({
      where: { nickname: cleanNick },
      include: { match: true },
      orderBy: { match: { playedAt: 'desc' } },
    });

    const totalMatches = participants.length;
    const wins = participants.filter((p) => p.rank === 1).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) + '%' : '0.0%';
    const maxScore = totalMatches > 0 ? Math.max(...participants.map((p) => p.totalScore)) : 0;
    const avgScore =
      totalMatches > 0
        ? Math.round(participants.reduce((acc, cur) => acc + cur.totalScore, 0) / totalMatches)
        : 0;

    const recentMatches = participants.map((p) => ({
      matchId: p.match.id,
      roomTitle: p.match.roomTitle,
      gameType: p.match.gameType,
      playedAt: p.match.playedAt,
      rank: p.rank,
      myScore: p.totalScore,
      isWin: p.rank === 1,
      winnerNickname: p.match.winnerNickname,
      winnerScore: p.match.winnerScore,
      myScoresSheet: p.scoresSheet,
    }));

    return {
      nickname: cleanNick,
      stats: {
        totalMatches,
        wins,
        losses,
        winRate,
        maxScore,
        avgScore,
      },
      recentMatches,
    };
  }

  // 📋 특정 매치의 전체 참가자 스코어보드 상세 조회 (다시보기 모달용)
  async getMatchDetail(matchId: string) {
    const match = await this.prisma.matchHistory.findUnique({
      where: { id: matchId },
      include: {
        participants: {
          orderBy: { rank: 'asc' },
        },
      },
    });

    if (!match) throw new Error('경기 기록을 찾을 수 없습니다.');
    return match;
  }

  // 🏆 실시간 명예의 전당 랭킹 순위표 집계
  async getLeaderboardRanking() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        avatar: true,
        equippedTitle: true,
      },
    });

    const allParticipants = await this.prisma.matchParticipant.findMany({
      where: { isAi: false },
    });

    const leaderboard = users.map((u) => {
      const userMatches = allParticipants.filter((p) => p.nickname === u.nickname);
      const totalMatches = userMatches.length;
      const wins = userMatches.filter((p) => p.rank === 1).length;
      const losses = totalMatches - wins;
      const winRateNum = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      const winRate = winRateNum.toFixed(1) + '%';
      const maxScore = totalMatches > 0 ? Math.max(...userMatches.map((p) => p.totalScore)) : 0;

      return {
        id: u.id,
        nickname: u.nickname,
        avatar: u.avatar || '🤖',
        equippedTitle: u.equippedTitle || '초급 슬라이더',
        totalMatches,
        wins,
        losses,
        winRateNum,
        winRate,
        maxScore,
      };
    });

    // 승리수 1순위, 최고 점수 2순위, 승률 3순위 내림차순 정렬
    leaderboard.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
      return b.winRateNum - a.winRateNum;
    });

    return leaderboard.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));
  }

  // AI 생각 및 진행 중인 방 관리 Set (중복 턴 스케줄링 방지)
  private aiThinkingRooms: Set<string> = new Set();

  // 🤖 7-4 지능형 AI 턴 자동 수행 로직 (인간처럼 단계별로 주사위를 굴리고 3D 애니메이션 시간 제공)
  private async checkAndExecuteAiTurn(game: GameState) {
    if (game.isFinished) return;

    const currentPlayer = game.players[game.currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isAi) return;

    // 이미 이 방의 AI가 생각하고 단계별 실행 중이면 중복 방지
    if (this.aiThinkingRooms.has(game.roomId)) return;
    this.aiThinkingRooms.add(game.roomId);

    this.scheduleNextAiAction(game);
  }

  // ⏱️ AI의 1회 굴림 ➔ 대기 ➔ KEEP 판단 ➔ 다음 굴림 ➔ 슬롯 선택 시차 스케줄러
  private scheduleNextAiAction(game: GameState) {
    setTimeout(async () => {
      try {
        if (game.isFinished) {
          this.aiThinkingRooms.delete(game.roomId);
          return;
        }

        const currentPlayer = game.players[game.currentTurnIndex];
        if (!currentPlayer || !currentPlayer.isAi) {
          this.aiThinkingRooms.delete(game.roomId);
          return;
        }

        const difficulty = currentPlayer.aiDifficulty || 'NOVICE';

        // 🎲 경우 1: 아직 주사위를 굴릴 수 있는 경우 (rollsLeft > 0)
        if (game.rollsLeft > 0) {
          // 1-1) 1차 굴림 이후(rollsLeft < 3)라면, 먼저 지능형 KEEP 결정
          if (game.rollsLeft < 3) {
            const nextHeld = YachtAiEngine.decideKeep(
              difficulty,
              game.dice,
              game.rollsLeft,
              currentPlayer.scores,
            );
            game.held = nextHeld;
          }

          // 1-2) 주사위 롤링 수행! (클라이언트에 3D 굴림 애니메이션 트리거)
          for (let i = 0; i < 5; i++) {
            if (!game.held[i]) {
              game.dice[i] = Math.floor(Math.random() * 6) + 1;
            }
          }
          game.rollsLeft -= 1;

          // 다음 액션을 1.8초 뒤로 스케줄링하여 플레이어가 3D 굴림 및 결과를 감상할 시간을 줌!
          this.scheduleNextAiAction(game);
          return;
        }

        // 📊 경우 2: 3회 굴림 소진 시 (rollsLeft === 0) ➔ 최적 점수 슬롯 선택 및 기록!
        const chosenCategory = YachtAiEngine.decideScoreCategory(
          difficulty,
          game.dice,
          currentPlayer.scores,
          game.round,
        );

        const score = calculateScore(chosenCategory, game.dice);
        currentPlayer.scores[chosenCategory] = score;

        // 턴 교대
        await this.advanceTurn(game);

        this.aiThinkingRooms.delete(game.roomId);

        // 다음 턴도 AI라면 연쇄 수행
        if (!game.isFinished && game.players[game.currentTurnIndex]?.isAi) {
          this.checkAndExecuteAiTurn(game);
        }
      } catch (err) {
        console.error('AI step execution error:', err);
        this.aiThinkingRooms.delete(game.roomId);
      }
    }, 1800); // 1.8초 템포로 사람이 직접 굴리는 듯한 자연스러운 인터랙션 제공
  }
}
