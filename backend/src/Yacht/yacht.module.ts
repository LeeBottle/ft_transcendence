import { Module } from '@nestjs/common';
import { YachtController } from './yacht.controller';
import { YachtService } from './yacht.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [YachtController],
  providers: [YachtService, PrismaService],
  exports: [YachtService],
})
export class YachtModule {}