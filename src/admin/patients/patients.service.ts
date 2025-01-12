import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { HelperService } from 'src/helpers/services/helper.service';
import { USER_TYPE } from 'src/helpers/enums';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { EmailService } from 'src/helpers/services/email.service';
import { medicareCodeTemplate } from 'src/helpers/emails/medicare-code-template';
import { VisitsRepository } from 'src/shared/repositories/visits.repository';
import { VisitsService } from 'src/mobile/patients/visits/visits.service';
import {
  distressMapping,
  g8ScoreMapping,
  sarcFScoreMapping,
} from 'src/helpers/signal-scoring';
import { AnswersRepository } from 'src/shared/repositories/answers.repository';

@Injectable()
export class PatientsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly visitRepository: VisitsRepository,
    private readonly answerRepository: AnswersRepository,
    private readonly visitsService: VisitsService,
    private helperService: HelperService,
    private emailService: EmailService,
  ) {}

  async onboardPatient(
    createPatientDto: CreatePatientDto,
  ): Promise<ResponseDto> {
    // Check if patient already exists
    const isPatientExists = await this.userRepository.findByEmail(
      createPatientDto.email,
    );

    const isPatientMobileExists = await this.userRepository.findInactiveMobile(
      createPatientDto.mobile,
    );
    if (isPatientExists || isPatientMobileExists) {
      return ResponseDto.badRequest(null, 'Patient record already exists');
    }

    // Generate unique code for the patient (for example: medicare code)
    const hospital_code = await this.helperService.generateUniqueCode();

    // Create a new patient and save to the database
    const newPatient = await this.userRepository.create({
      first_name: createPatientDto.first_name,
      last_name: createPatientDto.last_name,
      email: createPatientDto.email,
      hospital_code,
      mobile_no: createPatientDto.mobile,
      gender: createPatientDto.gender,
      date_of_birth: createPatientDto.date_of_birth,
      medicare_code: createPatientDto.medicare_code,
      role: USER_TYPE.PATIENT,
      is_invited: true,
    });

    // Send email to patient
    const emailHtml = medicareCodeTemplate(
      newPatient.first_name,
      hospital_code,
    );
    await this.emailService.sendMail(
      createPatientDto.email,
      hospital_code,
      emailHtml,
    );

    // Return success response
    return ResponseDto.success(
      newPatient,
      'Patient successfully onboarded',
      201,
    );
  }

  async getPatients(
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const { filters, page, limit } = paginationFilterDto;

    // Parse filters only if they are provided
    let parsedFilters = {};
    if (filters) {
      parsedFilters = this.parseFilters(filters);
    }

    // Fetch patients with pagination and filters
    const patients = await this.userRepository.findAll({
      ...paginationFilterDto,
      filters: parsedFilters,
    });

    // Create pageInfo object
    const pageInfo = {
      page: page || 1, // default to 1 if not provided
      limit: limit || 10, // default to 10 if not provided
      total: patients.totalCount,
    };

    // Return success response
    return ResponseDto.success(
      { users: patients.users, pageInfo },
      'Patients listed successfully',
    );
  }

  async updatePatient(
    patientId: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<ResponseDto> {
    const patient = await this.userRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException(ResponseDto.error('Patient not found', 404));
    }

    const updatedPatient = await this.userRepository.updateById(
      patientId,
      updatePatientDto,
    );

    return ResponseDto.success(updatedPatient, 'Patient updated successfully');
  }

  async getAnswersByVisitId(visitId: string): Promise<any> {
    return await this.visitsService.getAnswersByVisitId(visitId);
  }

  async getVisitsByPatientId(patientId: string): Promise<any> {
    const visits = await this.visitRepository.findVisitByUserId(patientId); // Use .lean() for plain objects
    if (!visits || visits.length === 0) {
      return ResponseDto.badRequest(null, 'No visits found');
    }

    const enhancedVisits = await Promise.all(
      visits.map(async (visit: any) => {
        const answers = await this.answerRepository.getAnswersByVisitId(
          visit._id,
        );

        // Calculate scores and signals
        const { g8Score, sarcFScore, distressSignal } =
          this.calculateScoresAndSignals(answers);

        return {
          _id: visit._id,
          patientId: visit.patientId,
          visitId: visit.visitId,
          date: visit.date,
          createdAt: visit.createdAt,
          updatedAt: visit.updatedAt,
          scores: {
            g8Score,
            sarcFScore,
          },
          signals: {
            g8Signal: g8Score < g8ScoreMapping.thresold,
            sarcFSignal: sarcFScore >= sarcFScoreMapping.thresold,
            distressSignal,
          },
        };
      }),
    );

    return ResponseDto.success(enhancedVisits, 'Visits fetched successfully');
  }
  // Delete a patient
  async deletePatient(patientId: string): Promise<ResponseDto> {
    const patient = await this.userRepository.findById(patientId);

    if (!patient) {
      throw new NotFoundException(ResponseDto.error('Patient not found', 404));
    }

    await this.userRepository.deleteById(patientId);

    return ResponseDto.success(null, 'Patient deleted successfully');
  }

  async getAllVisitsWithPagination(
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    try {
      const {
        filters,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'asc',
      } = paginationFilterDto;

      // Fetch paginated visits with total count
      const { visits, totalCount } =
        await this.visitRepository.getAllVisitsWithPagination(
          paginationFilterDto,
        );

      if (!visits || visits.length === 0) {
        return ResponseDto.success(
          { visits: [], pageInfo: { page, limit, totalCount } },
          'No visits found',
        );
      }

      // Enhance visits with scores and signals
      const enhancedVisits = await Promise.all(
        visits.map(async (visit: any) => {
          const answers = await this.answerRepository.getAnswersByVisitId(
            visit._id,
          );

          // Calculate scores and signals
          const { g8Score, sarcFScore, distressSignal } =
            this.calculateScoresAndSignals(answers);

          // Prepare visit data with scores and signals
          const visitData: any = {
            _id: visit._id,
            patientId: visit.patientId,
            visitId: visit.visitId,
            date: visit.date,
            createdAt: visit.createdAt,
            updatedAt: visit.updatedAt,
            summary: visit.summary,
            scores: {
              g8Score,
              sarcFScore,
            },
          };

          const signals = {
            g8Signal: g8Score < g8ScoreMapping.thresold,
            sarcFSignal: sarcFScore >= sarcFScoreMapping.thresold,
            distressSignal,
          };

          // Only include signals if any of them is true
          if (Object.values(signals).some((signal) => signal)) {
            visitData.signals = signals;
          }

          return visitData;
        }),
      );

      // Filter out visits with no valid signals
      const filteredVisits = enhancedVisits.filter((visit) => visit.signals);

      // Create pageInfo object
      const pageInfo = {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      };

      // Return success response
      return ResponseDto.success(
        { visits: filteredVisits, pageInfo },
        'Visits fetched successfully',
      );
    } catch (error) {
      console.error('Error fetching visits:', error);
      return ResponseDto.error(error.message || 'Failed to fetch visits', 500);
    }
  }

  // Helper method to parse filters
  private parseFilters(filters: string): any {
    try {
      return JSON.parse(filters);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        ResponseDto.error(
          'Invalid filters format, must be a valid JSON string',
          400,
        ),
      );
    }
  }

  private calculateScoresAndSignals(answers: any[]): {
    g8Score: number;
    sarcFScore: number;
    distressSignal: boolean;
  } {
    let g8Score = 0;
    let sarcFScore = 0;
    let distressSignal = false;

    answers.forEach((answer) => {
      const questionText = answer.questionId?.text || '';
      const userResponse = answer.answer?.[0]?.answer || '';

      // Debugging logs for troubleshooting
      console.log('Processing Question:', questionText);
      console.log('User Response:', userResponse);

      // G8 Scoring
      if (g8ScoreMapping[questionText]) {
        const score = g8ScoreMapping[questionText][userResponse] ?? 0;
        g8Score += score;
      } else {
        console.log(`Unmapped G8 Question: ${questionText}`);
      }

      // Sarc-F Scoring
      if (sarcFScoreMapping[questionText]) {
        const score = sarcFScoreMapping[questionText][userResponse] ?? 0;
        sarcFScore += score;
      } else {
        console.log(`Unmapped Sarc-F Question: ${questionText}`);
      }

      // Distress Signal
      if (
        answer.questionId?.type === 'scale' &&
        typeof userResponse === 'number' &&
        userResponse > distressMapping.thresold &&
        answer.categoryId.name === 'Distress Screening'
      ) {
        distressSignal = true;
      }
    });

    return { g8Score, sarcFScore, distressSignal };
  }

  // async getSignalDataForYear(year: number): Promise<ResponseDto> {
  //   try {
  //     // Start and end dates for the given year
  //     const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  //     const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  //     // Aggregate signals month-wise
  //     const monthlyData = await (
  //       await this.visitRepository.getTable()
  //     )
  //       .aggregate([
  //         {
  //           $match: {
  //             createdAt: { $gte: startDate, $lte: endDate },
  //           },
  //         },
  //         {
  //           $lookup: {
  //             from: 'answers',
  //             localField: '_id',
  //             foreignField: 'visitId',
  //             as: 'answers',
  //           },
  //         },
  //         {
  //           $addFields: {
  //             g8Score: {
  //               $reduce: {
  //                 input: {
  //                   $map: {
  //                     input: '$answers',
  //                     as: 'answer',
  //                     in: {
  //                       $cond: [
  //                         {
  //                           $in: ['$$answer.text', Object.keys(g8ScoreMapping)],
  //                         },
  //                         {
  //                           $arrayElemAt: [g8ScoreMapping['$$answer.text'], 0],
  //                         },
  //                         0,
  //                       ],
  //                     },
  //                   },
  //                 },
  //                 initialValue: 0,
  //                 in: { $add: ['$$value', '$$this'] },
  //               },
  //             },
  //             sarcFScore: {
  //               $reduce: {
  //                 input: {
  //                   $map: {
  //                     input: '$answers',
  //                     as: 'answer',
  //                     in: {
  //                       $cond: [
  //                         {
  //                           $in: [
  //                             '$$answer.text',
  //                             Object.keys(sarcFScoreMapping),
  //                           ],
  //                         },
  //                         {
  //                           $arrayElemAt: [
  //                             sarcFScoreMapping['$$answer.text'],
  //                             0,
  //                           ],
  //                         },
  //                         0,
  //                       ],
  //                     },
  //                   },
  //                 },
  //                 initialValue: 0,
  //                 in: { $add: ['$$value', '$$this'] },
  //               },
  //             },
  //             distressSignal: {
  //               $anyElementTrue: {
  //                 $map: {
  //                   input: '$answers',
  //                   as: 'answer',
  //                   in: {
  //                     $cond: [
  //                       {
  //                         $and: [
  //                           { $eq: ['$$answer.type', 'scale'] },
  //                           {
  //                             $gt: [
  //                               '$$answer.answer',
  //                               distressMapping.thresold,
  //                             ],
  //                           },
  //                           {
  //                             $eq: [
  //                               '$$answer.categoryId.name',
  //                               'Distress Screening',
  //                             ],
  //                           },
  //                         ],
  //                       },
  //                       true,
  //                       false,
  //                     ],
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: { $month: '$createdAt' },
  //             distressCount: { $sum: { $cond: ['$distressSignal', 1, 0] } },
  //             sarcFCount: {
  //               $sum: {
  //                 $cond: [
  //                   { $gte: ['$sarcFScore', sarcFScoreMapping.thresold] },
  //                   1,
  //                   0,
  //                 ],
  //               },
  //             },
  //             g8Count: {
  //               $sum: {
  //                 $cond: [{ $lt: ['$g8Score', g8ScoreMapping.thresold] }, 1, 0],
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $sort: { _id: 1 }, // Sort by month
  //         },
  //         {
  //           $project: {
  //             month: '$_id',
  //             distressCount: 1,
  //             sarcFCount: 1,
  //             g8Count: 1,
  //             _id: 0,
  //           },
  //         },
  //       ])
  //       .exec();

  //     // Map data to include months without data
  //     const chartData = Array.from({ length: 12 }, (_, i) => ({
  //       month: i + 1,
  //       distressCount: 0,
  //       sarcFCount: 0,
  //       g8Count: 0,
  //     }));

  //     monthlyData.forEach((data) => {
  //       const index = data.month - 1;
  //       chartData[index] = { ...chartData[index], ...data };
  //     });

  //     return ResponseDto.success(
  //       chartData,
  //       'Signal data retrieved successfully',
  //     );
  //   } catch (error) {
  //     console.error('Error fetching signal data:', error);
  //     return ResponseDto.error(
  //       error.message || 'Failed to retrieve signal data',
  //       500,
  //     );
  //   }
  // }

  async getSignalDataForYear(year: number): Promise<ResponseDto> {
    try {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

      // Fetch all visits within the year
      const visits: any = await this.visitRepository.getVisitsByMonth(
        startDate,
        endDate,
      );

      // Initialize monthly signal counts
      const monthlySignals = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        distressCount: 0,
        sarcFCount: 0,
        g8Count: 0,
      }));

      // Calculate scores and signals for each visit
      visits.forEach((visit) => {
        const { g8Score, sarcFScore, distressSignal } =
          this.calculateScoresAndSignals(visit.answers || []);

        const month = new Date(visit.createdAt).getMonth(); // Get month (0-11)

        // Update monthly signal counts
        if (distressSignal) monthlySignals[month].distressCount += 1;
        if (g8Score < g8ScoreMapping.thresold)
          monthlySignals[month].g8Count += 1;
        if (sarcFScore >= sarcFScoreMapping.thresold)
          monthlySignals[month].sarcFCount += 1;
      });

      // Return success response
      return ResponseDto.success(
        monthlySignals,
        'Signal data retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching signal data:', error);
      return ResponseDto.error(
        error.message || 'Failed to retrieve signal data',
        500,
      );
    }
  }
}
