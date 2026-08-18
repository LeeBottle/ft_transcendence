import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './user.entity';

@Controller('users')
export class AppController {
	constructor(private readonly appService: AppService) {}

	// GET http://localhost:3000/users -> 전체 유저 조회
	@Get()
	async getUsers(): Promise<User[]> {
		return await this.appService.getAllUsers();
	}

	// POST http://localhost:3000/users -> 유저 생성
	@Post()
	async createUser(
		@Body('username') username: string,
		@Body('email') email: string,
	): Promise<User> {
		return await this.appService.createUser(username, email);
	}

	// 3. 간이 로그인
	@Post('login')
	async login(@Body('username') username: string): Promise<User> {
		return await this.appService.login(username);
	}
}