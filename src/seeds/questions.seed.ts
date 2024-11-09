// src/seeder/category.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QuestionCategories,
  CategoryDocument,
} from '../shared/schemas/question-categories.schema';
import { Question, QuestionDocument } from '../shared/schemas/questions.schema';
import categoriesAndQuestions from './data/categoriesAndQuestions.data';

@Injectable()
export class QuestionsSeeder {
  private readonly logger = new Logger(QuestionsSeeder.name);

  constructor(
    @InjectModel(QuestionCategories.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async seed() {
    try {
      // Clear existing collections (optional)
      await this.categoryModel.deleteMany({});
      await this.questionModel.deleteMany({});

      // Insert categories and questions
      for (const category of categoriesAndQuestions) {
        const questionIds = [];

        for (const questionData of category.questions) {
          const question = await this.questionModel.create(questionData);
          questionIds.push(question._id);
        }

        // Save each category with associated questions' IDs
        await this.categoryModel.create({
          name: category.name,
          questions: questionIds,
        });
      }

      this.logger.log('Category and Questions seeding completed successfully');
    } catch (error) {
      this.logger.error('Error during category seeding', error);
    }
  }
}
