// src/seeds/seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { QuestionsSeeder } from './questions.seed';

@Injectable()
export class SeedsService {
  private readonly logger = new Logger(SeedsService.name);

  constructor(private readonly QuestionsSeeder: QuestionsSeeder) {}

  async run() {
    this.logger.log('Starting the seeding process...');
    await this.QuestionsSeeder.seed();
    this.logger.log('Seeding process completed.');
  }
}
