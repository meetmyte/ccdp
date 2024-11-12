// src/repositories/answer.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Answer, AnswerDocument } from '../schemas/answers.schema';

@Injectable()
export class AnswersRepository {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  async createOrUpdateAnswer(
    visitId: string,
    categoryId: string,
    questionId: string,
    answer: any,
  ): Promise<Answer> {
    return this.answerModel
      .findOneAndUpdate(
        {
          visitId,
          categoryId: new Types.ObjectId(categoryId),
          questionId: new Types.ObjectId(questionId),
        },
        { answer, answeredAt: new Date() },
        { new: true, upsert: true },
      )
      .exec();
  }

  // async getAnswersByVisitId(visitId: string): Promise<any> {
  //   return this.answerModel
  //     .find({ visitId: new Types.ObjectId(visitId) }) // Convert to ObjectId
  //     .populate({
  //       path: 'categoryId', // Populates the category information from QuestionCategories
  //       model: 'QuestionCategories',
  //     })
  //     .populate({
  //       path: 'questionId', // Populates the question details from Question schema
  //       model: 'Question',
  //     })
  //     .exec();
  // }

  async getAnswersByVisitId(visitId: string): Promise<any> {
    const answers = await this.answerModel
      .find({ visitId: new Types.ObjectId(visitId) }) // Ensure ObjectId type
      .populate({
        path: 'categoryId',
        model: 'QuestionCategories',
        select: '_id name', // Select only necessary fields for `categoryId`
      })
      .populate({
        path: 'questionId',
        model: 'Question',
        select: '_id text type subQuestions scale', // Select fields for `questionId`
      })
      .exec();

    console.log('Populated Answers:', answers);
    return answers;
  }
}

// populate({ path: 'questions', model: Question.name });
