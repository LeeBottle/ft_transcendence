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

  async updateTitle(authorization: string | undefined, title: string | null) {
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
    if (title !== null && title !== user.title) {
      throw new UnauthorizedException('보유하지 않은 칭호입니다.');
    }

    const { password, ...result } = await this.prisma.user.update({
      where: { id: user.id },
      data: { equippedTitle: title },
    });
    return { user: result };
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
