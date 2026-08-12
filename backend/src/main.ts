import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // CORS 허용 (프론트엔드 통신용)
  app.enableCors();
  await app.listen(3000);
}
bootstrap();