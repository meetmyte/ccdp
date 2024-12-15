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
  ], // Exporting MongooseModule and UserRepository
})
export class SharedModule {}
