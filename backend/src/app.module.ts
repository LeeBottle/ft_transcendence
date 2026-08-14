import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { YachtModule } from './Yacht/yacht.module';

@Module({
  imports: [YachtModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}