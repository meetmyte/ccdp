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
    // Check if the visit exists
    const visit: any = await this.visitRepository.findVisitById(visitId);
    if (!visit) throw new NotFoundException('Visit not found');

    // Check if the category exists
    const category =
      await this.questionsCategoryRepository.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');

    // Check if the question exists within the specified category and retrieve it
    const question = category.questions.find(
      (q) => q._id.toString() === questionId,
    );
    if (!question) {
      throw new NotFoundException(
        'Question not found in the specified category',
      );
    }

    // Validate the answer based on question type
    switch (question.type) {
      case 'text':
        if (typeof answer !== 'string') {
          throw new BadRequestException(
            'Answer must be a string for text questions',
          );
        }
        break;

      case 'scale':
        if (
          typeof answer !== 'number' ||
          answer < question.scale.min ||
          answer > question.scale.max
        ) {
          throw new BadRequestException(
            `Answer must be a number between ${question.scale.min} and ${question.scale.max}`,
          );
        }
        break;

      case 'boolean':
        if (typeof answer !== 'boolean') {
          throw new BadRequestException('Answer must be a boolean');
        }
        break;

      case 'interactive_image':
        if (typeof answer !== 'object' || !answer.coordinates) {
          throw new BadRequestException(
            'Answer must include coordinates for interactive image',
          );
        }
        break;

      case 'multiple':
        if (!Array.isArray(answer)) {
          throw new BadRequestException(
            'Answer must be an array of strings or booleans for multiple questions',
          );
        }
        break;

      default:
        throw new BadRequestException('Unknown question type');
    }

    // Proceed to store or update the answer
    await this.answerRepository.createOrUpdateAnswer(
      visit._id,
      categoryId,
      questionId,
      answer,
    );

    return ResponseDto.success(null, 'Answer stored/updated successfully');
  }

  // async getAnswersByVisitId(visitId: string): Promise<ResponseDto> {
  //   try {
  //     const answers: any =
  //       await this.answerRepository.getAnswersByVisitId(visitId);

  //     if (!answers.length) {
  //       this.logger.warn(`No answers found for visitId: ${visitId}`);
  //       throw new NotFoundException('No answers found for this visit');
  //     }

  //     // Transform the answers to group by categories and include answer data in each question
  //     const groupedAnswers: any = answers.reduce((acc, answer) => {
  //       const categoryId = answer.categoryId._id.toString();
  //       const question = {
  //         ...answer.questionId.toJSON(),
  //         answer: answer.answer,
  //       };

  //       // Check if the category is already in the accumulator
  //       const existingCategory = acc.find((cat) => cat._id === categoryId);
  //       if (existingCategory) {
  //         existingCategory.questions.push(question);
  //       } else {
  //         acc.push({
  //           _id: categoryId,
  //           name: answer.categoryId.name,
  //           createdAt: answer.categoryId.createdAt,
  //           updatedAt: answer.categoryId.updatedAt,
  //           questions: [question],
  //         });
  //       }

  //       return acc;
  //     }, []);

  //     return ResponseDto.success(
  //       groupedAnswers,
  //       'Answers retrieved successfully',
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to retrieve answers for visitId: ${visitId}`,
  //       error.stack,
  //     );
  //     throw new InternalServerErrorException('Unable to retrieve answers');
  //   }
  // }

  async getAnswersByVisitId(visitId: string): Promise<ResponseDto> {
    try {
      const answers: any =
        await this.answerRepository.getAnswersByVisitId(visitId);

      if (!answers.length) {
        this.logger.warn(`No answers found for visitId: ${visitId}`);
        throw new NotFoundException('No answers found for this visit');
      }

      const groupedAnswers = answers.reduce((acc, answer) => {
        const categoryId = answer.categoryId._id.toString();

        // If the question is of type 'multiple', merge answers into subQuestions
        const questionWithAnswer = {
          ...answer.questionId.toJSON(),
          subQuestions:
            answer.questionId.subQuestions?.map((subQ) => {
              const foundAnswer = answer.answer?.find(
                (ans) => ans.text === subQ.text,
              );

              return {
                ...subQ,
                answer: foundAnswer !== undefined ? foundAnswer.answer : null, // Ensure `false` values are not converted to null
              };
            }) || [],
        };

        let category = acc.find((cat) => cat._id === categoryId);
        if (!category) {
          category = {
            _id: categoryId,
            name: answer.categoryId.name,
            createdAt: answer.categoryId.createdAt,
            updatedAt: answer.categoryId.updatedAt,
            questions: [],
          };
          acc.push(category);
        }

        category.questions.push(questionWithAnswer);
        return acc;
      }, []);

      return ResponseDto.success(
        groupedAnswers,
        'Answers retrieved successfully',
      );
    } catch (error) {
      this.logger.error(
        `Failed to retrieve answers for visitId: ${visitId}`,
        error.stack,
      );
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
