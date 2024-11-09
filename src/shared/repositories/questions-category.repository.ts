import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CategoryDocument,
  QuestionCategories,
} from '../schemas/question-categories.schema';
import { Model, Types } from 'mongoose';
import { Question } from '../schemas/questions.schema';

@Injectable()
export class QuestionsCategoryRepository {
  constructor(
    @InjectModel(QuestionCategories.name)
    private questionCategoriesModel: Model<CategoryDocument>,
  ) {}

  async findAllQuestions(): Promise<any> {
    return this.questionCategoriesModel
      .find()
      .populate({ path: 'questions', model: Question.name })
      .exec();
  }

  async findById(id: string): Promise<any> {
    return this.questionCategoriesModel
      .findOne({ _id: new Types.ObjectId(id) })
      .populate({ path: 'questions', model: Question.name })
      .exec();
  }
}
