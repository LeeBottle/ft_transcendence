import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const existingNickname = await this.prisma.user.findUnique({
      where: { nickname: dto.nickname },
    });
    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
        title: '초급 슬라이더',
        isTitleSeen: false,
      },
    });

    const { password, ...result } = user;
    return {
      message: '회원가입이 완료되었습니다.',
      user: result,
    };
  }

  async updateTitle(authorization: string | undefined, title: string | null, nickname?: string) {
    let user: any = null;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      } catch {}
    }

    if (!user && nickname) {
      const cleanNick = nickname.replace(/ \(방장\)$/, '');
      user = await this.prisma.user.findUnique({ where: { nickname: cleanNick } });
    }

    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    // 🎯 콤마로 구분된 보유 칭호 목록에서 확인 (NFC 유니코드 정규화 적용)
    const normalizedTarget = title ? title.normalize('NFC').trim() : null;
    const unlockedList = (user.unlockedTitles || '초급 슬라이더')
      .split(',')
      .map((t: string) => t.normalize('NFC').trim());

    if (
      normalizedTarget !== null &&
      !unlockedList.includes(normalizedTarget) &&
      normalizedTarget !== '초급 슬라이더'
    ) {
      throw new UnauthorizedException('보유하지 않은 칭호입니다.');
    }

    const { password, ...result } = await this.prisma.user.update({
      where: { id: user.id },
      data: { equippedTitle: normalizedTarget },
    });
    return { user: result };
  }

  // 👤 7-2 현재 로그인 유저의 최신 정보 조회 (칭호 목록 최신화)
  async getMe(authorization: string | undefined) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) throw new UnauthorizedException('로그인이 필요합니다.');

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    const { password, ...result } = user;
    return { user: result };
  }

  // 닉네임 기준 유저 정보 조회 (더미 유저 및 타 유저 칭호 확인용)
  async getUserByNickname(nickname: string) {
    const cleanNick = nickname.replace(/ \(방장\)$/, '');
    const user = await this.prisma.user.findUnique({ where: { nickname: cleanNick } });
    if (!user) return null;
    const { password, ...result } = user;
    return { user: result };
  }

  // 🏆 클라이언트 업적 기반 칭호 해금 (스피드 러너, 거리의 화가 등)
  async claimTitle(authorization: string | undefined, titleName: string, nickname?: string) {
    let user: any = null;
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      } catch {}
    }

    if (!user && nickname) {
      const cleanNick = nickname.replace(/ \(방장\)$/, '');
      user = await this.prisma.user.findUnique({ where: { nickname: cleanNick } });
    }

    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    const currentTitles = (user.unlockedTitles || '초급 슬라이더').split(',').map((t: string) => t.trim());
    let isNew = false;
    if (!currentTitles.includes(titleName)) {
      currentTitles.push(titleName);
      isNew = true;
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: { unlockedTitles: currentTitles.join(',') },
      });
      console.log(`🎉 칭호 획득: [${user.nickname}] 님이 '${titleName}' 칭호를 달성했습니다!`);
      const { password, ...result } = updated;
      return { isNew, user: result, message: `새로운 칭호 [${titleName}]을(를) 획득했습니다!` };
    }

    const { password, ...result } = user;
    return { isNew: false, user: result, message: '이미 보유 중인 칭호입니다.' };
  }
  async updateProfile(
    authorization: string | undefined,
    dto: { nickname?: string; avatar?: string; currentPassword?: string; newPassword?: string },
  ) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) throw new UnauthorizedException('로그인이 필요합니다.');

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('유효하지 않은 로그인입니다.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    const updateData: any = {};

    // 1. 닉네임 변경
    if (dto.nickname && dto.nickname.trim() !== user.nickname) {
      const existing = await this.prisma.user.findUnique({ where: { nickname: dto.nickname.trim() } });
      if (existing) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
      updateData.nickname = dto.nickname.trim();
    }

    // 2. 아바타 변경
    if (dto.avatar !== undefined) {
      updateData.avatar = dto.avatar;
    }

    // 3. 비밀번호 변경
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new UnauthorizedException('현재 비밀번호를 입력해야 변경할 수 있습니다.');
      }
      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
      }
      updateData.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const newPayload = { sub: updatedUser.id, email: updatedUser.email, nickname: updatedUser.nickname };
    const newAccessToken = this.jwtService.sign(newPayload);

    const { password, ...result } = updatedUser;
    return {
      message: '프로필이 성공적으로 업데이트되었습니다.',
      accessToken: newAccessToken,
      user: result,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isNewTitle = !user.isTitleSeen;

    if (isNewTitle) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isTitleSeen: true },
      });
    }

    const payload = { sub: user.id, email: user.email, nickname: user.nickname };
    const accessToken = this.jwtService.sign(payload);

    const { password, ...result } = user;
    return {
      message: '로그인에 성공했습니다.',
      accessToken,
      isNewTitle,
      user: {
        ...result,
        isTitleSeen: true,
      },
    };
  }
}
