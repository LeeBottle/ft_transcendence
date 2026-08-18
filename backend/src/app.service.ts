import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class AppService {
	constructor(
	@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	// 1. 유저 목록 조회
	async getAllUsers(): Promise<User[]> {
		return await this.userRepository.find();
	}

	// 2. 유저 생성 (DB에 저장)
	async createUser(username: string, email: string): Promise<User> {
		const newUser = this.userRepository.create({ username, email });
		return await this.userRepository.save(newUser);
	}

	// 로그인 (없으면 자동 생성 후 반환)
	async login(username: string): Promise<User> {
		let user = await this.userRepository.findOne({ where: { username } });
		if (!user) {
			user = this.userRepository.create({
				username,
				email: `${username}@student.42.fr`,
			});
			await this.userRepository.save(user);
		}
		return user;
	}
}