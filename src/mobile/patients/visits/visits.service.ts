// src/visits/visits.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { AnswersRepository } from 'src/shared/repositories/answers.repository';
import { QuestionsCategoryRepository } from 'src/shared/repositories/questions-category.repository';
import { VisitsRepository } from 'src/shared/repositories/visits.repository';

@Injectable()
export class VisitsService {
  private readonly logger = new Logger(VisitsService.name);

  constructor(
    private readonly questionsCategoryRepository: QuestionsCategoryRepository,
    private readonly visitRepository: VisitsRepository,
    private readonly answerRepository: AnswersRepository,
  ) {}

  async getAllQuestions(): Promise<ResponseDto> {
    try {
      const questions =
        await this.questionsCategoryRepository.findAllQuestions();
      return ResponseDto.success(questions, 'Questions retrieved successfully');
    } catch (error) {
      this.logger.error(
        `Failed to retrieve questions: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Unable to retrieve questions');
    }
  }

  async createVisit(patientId: string): Promise<ResponseDto> {
    try {
      if (!patientId) {
        throw new BadRequestException('Patient ID is required');
      }

      const visit = await this.visitRepository.createVisit(patientId);
      return ResponseDto.success({ visit }, 'Visit created');
    } catch (error) {
      this.logger.error(
        `Failed to create visit for patientId: ${patientId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Unable to create visit');
    }
  }

  // async storeAnswer(
  //   visitId: string,
  //   categoryId: string,
  //   questionId: string,
  //   answer: any,
  // ): Promise<ResponseDto> {
  //   // Check if the visit exists
  //   const visit: any = await this.visitRepository.findVisitById(visitId);
  //   if (!visit) throw new NotFoundException('Visit not found');

  //   // Check if the category exists
  //   const category =
  //     await this.questionsCategoryRepository.findById(categoryId);
  //   if (!category) throw new NotFoundException('Category not found');

  //   // Check if the question exists within the specified category
  //   const questionExists = category.questions.some(
  //     (question) => question._id.toString() === questionId,
  //   );
  //   if (!questionExists) {
  //     throw new NotFoundException(
  //       'Question not found in the specified category',
  //     );
  //   }

  //   // Proceed to store or update the answer
  //   await this.answerRepository.createOrUpdateAnswer(
  //     visit._id,
  //     categoryId,
  //     questionId,
  //     answer,
  //   );

  //   return ResponseDto.success(null, 'Answer stored/updated successfully');
  // }

  async storeAnswer(
    visitId: string,
    categoryId: string,
    questionId: string,
    answer: any,
  ): Promise<ResponseDto> {
    // Check if the visit, category, and question exist
    const visit: any = await this.visitRepository.findVisitById(visitId);
    if (!visit) throw new NotFoundException('Visit not found');

    const category =
      await this.questionsCategoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');

    const question = category.questions.find(
      (q) => q._id.toString() === questionId,
    );
    if (!question)
      throw new NotFoundException(
        'Question not found in the specified category',
      );

    // Format answer based on question type
    let formattedAnswer;
    switch (question.type) {
      case 'text':
      case 'scale':
      case 'boolean':
        formattedAnswer = [{ text: question.text, answer }];
        break;
      case 'multiple':
        formattedAnswer = answer.map((ans) => ({
          text: ans.text,
          answer: ans.answer,
        }));
        break;
      case 'interactive_image':
        formattedAnswer = [{ text: question.text, answer }];
        break;
      default:
        throw new BadRequestException('Invalid question type');
    }

    // Save or update the answer
    await this.answerRepository.createOrUpdateAnswer(
      visit._id,
      categoryId,
      questionId,
      formattedAnswer,
    );

    return ResponseDto.success(null, 'Answer stored successfully');
  }

  async getAnswersByVisitId(visitId: string): Promise<ResponseDto> {
    try {
      const questions = await this.questionsCategoryRepository.findAllQuestions();
      const answers = await this.answerRepository.getAnswersByVisitId(visitId);
  
      // Create a map to store answers by questionId for easy access
      const answerMap = new Map();
      answers.forEach((answer) => {
        answerMap.set(answer.questionId.id, answer.answer);
      });
  
      // Map each question to its answer if available
      const groupedQuestions = questions.map((category) => ({
        _id: category._id,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        questions: category.questions.map((question) => {
          const answerData = answerMap.get(question._id.toString()) || [];
  
          // Extract main question answer if it exists
          const mainAnswer = answerData.find(a => a.text === question.text)?.answer || null;
  
          // Map sub-questions with their answers
          const subQuestionsWithAnswers = question.subQuestions?.map((subQ) => {
            const subAnswer = answerData.find(a => a.text === subQ.text)?.answer || null;
            return { ...subQ, answer: subAnswer };
          }) || [];
  
          // Return the question with main answer and updated sub-questions
          return {
            ...question.toJSON(),
            answer: mainAnswer,
            subQuestions: subQuestionsWithAnswers,
          };
        }),
      }));
  
      return ResponseDto.success(groupedQuestions, 'Answers retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve answers for visitId: ${visitId}`, error.stack);
      throw new InternalServerErrorException('Unable to retrieve answers');
    }
  }

  async allVistisOfPatient(userId: string) {
    try {
      const visits = await this.visitRepository.findVisitByUserId(userId);
      return ResponseDto.success(visits, 'Visits retrived successfully.');
    } catch (error) {
      this.logger.error(
        `Failed to retrieve answers for patientId: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Unable to retrieve visits');
    }
  }
}
