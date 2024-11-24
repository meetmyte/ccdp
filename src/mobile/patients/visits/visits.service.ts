// src/visits/visits.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { HelperService } from 'src/helpers/services/helper.service';
import { AnswersRepository } from 'src/shared/repositories/answers.repository';
import { QuestionsCategoryRepository } from 'src/shared/repositories/questions-category.repository';
import { VisitsRepository } from 'src/shared/repositories/visits.repository';
import { OpenAiService } from 'src/shared/service/openai.service';

@Injectable()
export class VisitsService {
  private readonly logger = new Logger(VisitsService.name);

  constructor(
    private readonly questionsCategoryRepository: QuestionsCategoryRepository,
    private readonly visitRepository: VisitsRepository,
    private readonly answerRepository: AnswersRepository,
    private readonly helperService: HelperService,
    private openAiService: OpenAiService,
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

  async storeInteractiveAnswer(
    visitId: string,
    categoryId: string,
    questionId: string,
    frontImage: any,
    backImage: any,
  ): Promise<ResponseDto> {
    const frontImageUrl = await this.helperService.uploadFile(
      frontImage,
      'front-body',
    );
    const backImageUrl = await this.helperService.uploadFile(
      backImage,
      'back-body',
    );

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

    // Format the answer with file URLs
    const formattedAnswer = [
      {
        text: question.text,
        answer: {
          frontImage: frontImageUrl,
          backImage: backImageUrl,
        },
      },
    ];

    // Save or update the answer
    await this.answerRepository.createOrUpdateAnswer(
      visit._id,
      categoryId,
      questionId,
      formattedAnswer,
    );

    return ResponseDto.success(null, 'Answer stored successfully');
  }

  // async getAnswersByVisitId(visitId: string): Promise<ResponseDto> {
  //   try {
  //     const questions =
  //       await this.questionsCategoryRepository.findAllQuestions();
  //     const answers = await this.answerRepository.getAnswersByVisitId(visitId);

  //     // Create a map to store answers by questionId for easy access
  //     const answerMap = new Map();
  //     answers.forEach((answer) => {
  //       answerMap.set(answer.questionId.id, answer.answer);
  //     });

  //     // Map each question to its answer if available
  //     const groupedQuestions = questions.map((category) => ({
  //       _id: category._id,
  //       name: category.name,
  //       createdAt: category.createdAt,
  //       updatedAt: category.updatedAt,
  //       questions: category.questions.map((question) => {
  //         const answerData = answerMap.get(question._id.toString()) || [];

  //         // Extract main question answer if it exists
  //         const mainAnswer =
  //           answerData.find((a) => a.text === question.text)?.answer || null;

  //         // Map sub-questions with their answers
  //         const subQuestionsWithAnswers =
  //           question.subQuestions?.map((subQ) => {
  //             const subAnswer =
  //               answerData.find((a) => a.text === subQ.text)?.answer || null;
  //             return { ...subQ, answer: subAnswer };
  //           }) || [];

  //         // Return the question with main answer and updated sub-questions
  //         return {
  //           ...question.toJSON(),
  //           answer: mainAnswer,
  //           subQuestions: subQuestionsWithAnswers,
  //         };
  //       }),
  //     }));

  //     return ResponseDto.success(
  //       groupedQuestions,
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
      const questions =
        await this.questionsCategoryRepository.findAllQuestions();
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
          let mainAnswer = null;
          if (question.type === 'interactive_image') {
            // mainAnswer = {
            //   frontImage:
            //     answerData.find((a) => a.text === question.text)?.answer
            //       ?.frontImage || null,
            //   backImage:
            //     answerData.find((a) => a.text === question.text)?.answer
            //       ?.backImage || null,
            // };
            mainAnswer =
              answerData.find((a) => a.text === question.text)?.answer || null;
          } else {
            mainAnswer =
              answerData.find((a) => a.text === question.text)?.answer || null;
          }

          // Map sub-questions with their answers
          const subQuestionsWithAnswers =
            question.subQuestions?.map((subQ) => {
              const subAnswer =
                answerData.find((a) => a.text === subQ.text)?.answer || null;
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

      return ResponseDto.success(
        groupedQuestions,
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

  async generatePatientProfile(visitId: string): Promise<any> {
    try {
      // Step 1: Retrieve answers for the given visitId
      const answers: any =
        await this.answerRepository.getAnswersByVisitId(visitId);

      if (!answers.length) {
        return ResponseDto.badRequest(null, 'Visit id not found');
      }

      // Step 2: Group answers by categories
      const groupedAnswers: any = answers.reduce((acc, answer) => {
        const categoryId = answer.categoryId._id.toString();
        const question = {
          ...answer.questionId.toJSON(),
          answer: answer.answer,
        };

        const existingCategory = acc.find((cat) => cat._id === categoryId);
        if (existingCategory) {
          existingCategory.questions.push(question);
        } else {
          acc.push({
            _id: categoryId,
            name: answer.categoryId.name,
            createdAt: answer.categoryId.createdAt,
            updatedAt: answer.categoryId.updatedAt,
            questions: [question],
          });
        }

        return acc;
      }, []);

      const profile = await this.generatePatientProfileUsingAi(groupedAnswers);

      // Step 3: Use the AI service to generate a profile based on grouped answers
      // const aiProfile = await this.aiService.generateProfile(groupedAnswers);

      return ResponseDto.success(profile, 'Profile retrieved successfully'); // Return the generated profile
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to generate patient profile',
      );
    }
  }

  // async generatePatientProfileUsingAi(patientData) {
  //   try {
  //     const openai = this.openAiService.getClient(); // Get the OpenAI client

  //     const promptTemplate = `
  //     You are an advanced medical assistant AI. Based on the following patient responses, generate a detailed, coherent, and descriptive health profile suitable for both doctors and patients. The profile should be structured in a natural, narrative format, with a minimum length of 1000 characters. Use medical terminology and phrasing that a doctor would find insightful and professionally appropriate. The language should clearly outline the patient's health status and observations, facilitating diagnosis and treatment planning.

  //     Highlight each health category in detail, ensuring:
  //     1. A well-articulated summary that interprets the patient's condition in medical terms, integrating relevant clinical insights.
  //     2. Observations that specify patient-reported data or symptoms and their potential clinical implications.
  //     3. A section on critical insights that identifies areas requiring immediate medical attention or further diagnostic workup.

  //     Additionally, provide the profile in a structured JSON format suitable for frontend rendering. The JSON should include:
  //     1. A \`categories\` array, where each category contains:
  //        - \`categoryName\`: The name of the category (e.g., "Reason for Visit").
  //        - \`summary\`: A detailed narrative summary in doctor-appropriate language.
  //        - \`observations\`: A list of key points or findings from the patient's responses.
  //        - \`criticalInsights\`: A list of important notes or actionable insights requiring attention.

  //     2. An \`overallInsights\` field, which provides a high-level, medically descriptive summary of the patient’s condition, highlighting critical concerns and actionable recommendations for diagnosis or treatment.

  //     Patient Data:
  //     ${JSON.stringify(patientData, null, 2)}
  //     `;

  //     const assistantContext =
  //       'Please write a detailed patient health profile in a structured JSON format, organizing the content by health categories with descriptive text. Ensure each category is clearly labeled and includes relevant responses.';

  //     const response = await openai.chat.completions.create({
  //       model: 'gpt-4o',
  //       messages: [
  //         { role: 'system', content: assistantContext },
  //         { role: 'user', content: promptTemplate },
  //       ],
  //     });

  //     const profileText = response.choices[0].message.content;
  //     console.log('profileText', profileText);
  //     try {
  //       return ResponseDto.success(JSON.parse(profileText), 'success');
  //     } catch (error) {
  //       console.log(
  //         '🚀 ~ VisitsService ~ generatePatientProfileUsingAi ~ error:',
  //         error,
  //       );
  //       return {
  //         error: 'Response could not be formatted as JSON',
  //         content: profileText,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error generating patient profile:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to generate patient profile',
  //     );
  //   }
  // }

  async generatePatientProfileUsingAi(patientData) {
    try {
      const openai = this.openAiService.getClient(); // Get the OpenAI client

      const promptTemplate = `
      You are an advanced medical assistant AI. Based on the following patient responses, generate a detailed, coherent, and descriptive health profile suitable for both doctors and patients. The profile should be structured in a natural, narrative format, with a minimum length of 1000 characters. Use medical terminology and phrasing that a doctor would find insightful and professionally appropriate. The language should clearly outline the patient's health status and observations, facilitating diagnosis and treatment planning.
      
      Highlight each health category in detail, ensuring:
      1. A well-articulated summary that interprets the patient's condition in medical terms, integrating relevant clinical insights.
      2. Observations that specify patient-reported data or symptoms and their potential clinical implications.
      3. A section on critical insights that identifies areas requiring immediate medical attention or further diagnostic workup.
      
      Additionally, provide the profile in a structured JSON format suitable for frontend rendering. The JSON should include:
      1. A \`categories\` array, where each category contains:
         - \`categoryName\`: The name of the category (e.g., "Reason for Visit").
         - \`summary\`: A detailed narrative summary in doctor-appropriate language.
         - \`observations\`: A list of key points or findings from the patient's responses.
         - \`criticalInsights\`: A list of important notes or actionable insights requiring attention.
      
      2. An \`overallInsights\` field, which provides a high-level, medically descriptive summary of the patient’s condition, highlighting critical concerns and actionable recommendations for diagnosis or treatment.
      
      Patient Data:
      ${JSON.stringify(patientData, null, 2)}
      `;

      const assistantContext =
        'Please write a detailed patient health profile in a structured JSON format, organizing the content by health categories with descriptive text. Ensure each category is clearly labeled and includes relevant responses.';

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: assistantContext },
          { role: 'user', content: promptTemplate },
        ],
      });

      // Extract raw content from response
      const profileText = response.choices[0].message.content;

      console.log('Raw profileText:', profileText);

      // Clean the response to remove code fences and extra formatting
      const cleanedProfileText = profileText
        .replace(/```json\n|```/g, '')
        .trim();

      console.log('Cleaned profileText:', cleanedProfileText);

      // Try parsing the cleaned response as JSON
      try {
        const parsedJson = JSON.parse(cleanedProfileText);
        return parsedJson;
      } catch (error) {
        console.error('JSON Parsing Error:', error);
        return {
          error: 'Response could not be formatted as JSON',
          content: cleanedProfileText,
        };
      }
    } catch (error) {
      console.error('Error generating patient profile:', error);
      throw new InternalServerErrorException(
        'Failed to generate patient profile',
      );
    }
  }
}
