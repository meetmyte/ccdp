import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import {
  CategorySchema,
  QuestionCategories,
} from './schemas/question-categories.schema';
import { Question, QuestionSchema } from './schemas/questions.schema';
import { QuestionsCategoryRepository } from './repositories/questions-category.repository';
import { VisitsRepository } from './repositories/visits.repository';
import { AnswersRepository } from './repositories/answers.repository';
import { Visit, VisitsSchema } from './schemas/visits.schema';
import { Answer, AnswerSchema } from './schemas/answers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuestionCategories.name, schema: CategorySchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Visit.name, schema: VisitsSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
  ],
  providers: [
    UserRepository,
    QuestionsCategoryRepository,
    VisitsRepository,
    AnswersRepository,
  ],
  exports: [
    MongooseModule,
    UserRepository,
    QuestionsCategoryRepository,
    VisitsRepository,
    AnswersRepository,
  ], // Exporting MongooseModule and UserRepository
})
export class SharedModule {}
