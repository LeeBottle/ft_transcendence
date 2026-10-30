import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { ClaimTitleDto } from './dto/claim-title.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  async getMe(@Headers('authorization') authorization: string | undefined) {
    return this.authService.getMe(authorization);
  }

  @Get('user/:nickname')
  async getUserByNickname(@Param('nickname') nickname: string) {
    return this.authService.getUserByNickname(nickname);
  }

  @Post('claim-title')
  async claimTitle(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: ClaimTitleDto,
  ) {
    return this.authService.claimTitle(authorization, dto.title, dto.nickname);
  }

  @Patch('title')
  async updateTitle(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateTitleDto,
  ) {
    return this.authService.updateTitle(authorization, dto.title ?? null, dto.nickname);
  }

  @Patch('profile')
  async updateProfile(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: { nickname?: string; avatar?: string; currentPassword?: string; newPassword?: string },
  ) {
    return this.authService.updateProfile(authorization, dto);
  }
}
