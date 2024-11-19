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

  async getVisitsByPatientId(patientId: string): Promise<any[]> {
    const visits = await this.visitRepository.findVisitByUserId(patientId); // Use .lean() for plain objects
    if (!visits || visits.length === 0) {
      throw new NotFoundException('No visits found for this patient');
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

    return enhancedVisits;
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
        userResponse > distressMapping.thresold
      ) {
        distressSignal = true;
      }
    });

    return { g8Score, sarcFScore, distressSignal };
  }
}
