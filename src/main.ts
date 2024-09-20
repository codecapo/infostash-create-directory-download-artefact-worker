import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DependenciesScanner } from "@nestjs/core/scanner";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
