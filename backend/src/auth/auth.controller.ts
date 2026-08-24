import { Body, Controller, Headers, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateTitleDto } from './dto/update-title.dto';

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

  @Patch('title')
  async updateTitle(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: UpdateTitleDto,
  ) {
    return this.authService.updateTitle(authorization, dto.title ?? null);
  }
}
