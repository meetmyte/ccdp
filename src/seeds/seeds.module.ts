// src/seeds/seeds.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // or other DB provider
import {
  QuestionCategories,
  CategorySchema,
} from '../shared/schemas/question-categories.schema';
import { Question, QuestionSchema } from '../shared/schemas/questions.schema';
import { SeedsService } from './seeds.service';
import { QuestionsSeeder } from './questions.seed';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionCategories.name, schema: CategorySchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [SeedsService, QuestionsSeeder],
  exports: [SeedsService], // Ensure it’s exported for external usage
})
export class SeedsModule {}
