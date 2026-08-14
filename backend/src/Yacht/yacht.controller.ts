import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { YachtService } from './yacht.service';
import { CategoryKey } from './yacht.score';

@Controller('yacht')
export class YachtController {
  constructor(private readonly yachtService: YachtService) {}

  @Post('rooms')
  async createRoom(
    @Body()
    body: {
      title: string;
      hostNickname: string;
      password?: string | null;
      isPublic: boolean;
      slots: {
        p2: 'NONE' | 'HUMAN' | 'AI';
        p3: 'NONE' | 'HUMAN' | 'AI';
        p4: 'NONE' | 'HUMAN' | 'AI';
      };
    },
  ) {
    return await this.yachtService.createRoom(body);
  }

  @Get('rooms')
  async getRooms() {
    return await this.yachtService.getRooms();
  }

  @Get('rooms/:id')
  async getRoomById(@Param('id') id: string) {
    return await this.yachtService.getRoomById(id);
  }

  @Post('rooms/:id/join')
  async joinRoom(
    @Param('id') id: string,
    @Body() body: { nickname: string },
  ) {
    return await this.yachtService.joinRoom(id, body.nickname);
  }

  @Post('rooms/:id/leave')
  async leaveRoom(
    @Param('id') id: string,
    @Body() body: { nickname: string },
  ) {
    return await this.yachtService.leaveRoom(id, body.nickname);
  }

  @Post('rooms/:id/ready')
  async toggleReady(
    @Param('id') id: string,
    @Body() body: { nickname: string },
  ) {
    return await this.yachtService.toggleReady(id, body.nickname);
  }

  // ==========================================
  // 🎮 GAME PLAY ENDPOINTS
  // ==========================================

  @Get('rooms/:id/game')
  async getGameState(@Param('id') id: string) {
    return await this.yachtService.getGameState(id);
  }

  @Post('rooms/:id/game/start')
  async startGame(@Param('id') id: string) {
    return await this.yachtService.initGame(id);
  }

  @Post('rooms/:id/game/roll')
  async rollDice(
    @Param('id') id: string,
    @Body() body: { nickname: string; held: boolean[] },
  ) {
    return await this.yachtService.rollDice(id, body.nickname, body.held);
  }

  @Post('rooms/:id/game/score')
  async selectScoreCategory(
    @Param('id') id: string,
    @Body() body: { nickname: string; category: CategoryKey },
  ) {
    return await this.yachtService.selectScoreCategory(
      id,
      body.nickname,
      body.category,
    );
  }
}
