import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { HelperService } from 'src/helpers/helper.service';
import { USER_TYPE } from 'src/helpers/enums';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { EmailService } from 'src/helpers/email.service';
import { medicareCodeTemplate } from 'src/helpers/emails/medicare-code-template';

@Injectable()
export class PatientsService {
  constructor(
    private readonly userRepository: UserRepository,
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
    if (isPatientExists) {
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
    };

    // Return success response
    return ResponseDto.success(
      { patients, pageInfo },
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
}
