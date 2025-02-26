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
import { OpenAiService } from './service/openai.service';
import { DoctorPatientAssignmentRepository } from './repositories/doctor-patients.repository';
import {
  DoctorPatientAssignment,
  DoctorPatientAssignmentSchema,
} from './schemas/doctor-patients-assignments.schema';
import {
  Consultation,
  ConsultationSchema,
} from './schemas/consultations.schema';
import { ConsultationRepository } from './repositories/consultation.repository';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { FeedbackRepository } from './repositories/feedback.repository';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { ChatRepository } from './repositories/chat.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: QuestionCategories.name, schema: CategorySchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Visit.name, schema: VisitsSchema },
      { name: Answer.name, schema: AnswerSchema },
      {
        name: DoctorPatientAssignment.name,
        schema: DoctorPatientAssignmentSchema,
      },
      {
        name: Consultation.name,
        schema: ConsultationSchema,
      },
      {
        name: Feedback.name,
        schema: FeedbackSchema,
      },
      {
        name: Chat.name,
        schema: ChatSchema,
      },
    ]),
  ],
  providers: [
    UserRepository,
    QuestionsCategoryRepository,
    VisitsRepository,
    AnswersRepository,
    OpenAiService,
    DoctorPatientAssignmentRepository,
    ConsultationRepository,
    FeedbackRepository,
    ChatRepository,
  ],
  exports: [
    MongooseModule,
    UserRepository,
    QuestionsCategoryRepository,
    VisitsRepository,
    AnswersRepository,
    OpenAiService,
    DoctorPatientAssignmentRepository,
    ConsultationRepository,
    FeedbackRepository,
    ChatRepository,
  ], // Exporting MongooseModule and UserRepository
})
export class SharedModule {}
