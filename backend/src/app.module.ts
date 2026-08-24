import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DrawingGateway } from './drawing.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [DrawingGateway],
})
export class AppModule {}
