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
}