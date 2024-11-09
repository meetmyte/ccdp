// src/seeder/main-seeder.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedsService } from './seeds.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seederService = app.get(SeedsService);

  try {
    await seederService.run();
  } catch (error) {
    console.error('Error in seeding', error);
  } finally {
    await app.close();
  }
}

bootstrap();
