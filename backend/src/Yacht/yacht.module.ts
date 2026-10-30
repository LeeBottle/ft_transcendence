import { Module } from '@nestjs/common';
import { YachtController } from './yacht.controller';
import { YachtService } from './yacht.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YachtController],
  providers: [YachtService],
  exports: [YachtService],
})
export class YachtModule {}
