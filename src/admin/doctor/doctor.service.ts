import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { USER_TYPE } from 'src/helpers/enums';
import { ConfigService } from '@nestjs/config';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { doctorAddTemplate } from 'src/helpers/emails/doctor-add-template';
import { EmailService } from 'src/helpers/services/email.service';
import { JwtService } from '@nestjs/jwt';
import { HelperService } from 'src/helpers/services/helper.service';

@Injectable()
export class DoctorService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private helperService: HelperService

  ) {}

  async addDoctor(payload: CreateDoctorDto): Promise<ResponseDto> {
    try {
      const existingDoctor = await (
        await this.userRepository.getTable()
      ).findOne({
        $or: [{ email: payload.email }, { mobile_no: payload.mobile }],
        role: USER_TYPE.DOCTOR,
      });

      if (existingDoctor) {
        return ResponseDto.success(
          null,
          'Doctor already exists with this email or mobile.',
          400,
        );
      }
      const hospital_code = await this.helperService.generateUniqueCode(false, true);
    
      const doctor = {
        email: payload.email,
        mobile_no: payload.mobile,
        date_of_birth: payload.date_of_birth,
        first_name: payload.first_name,
        last_name: payload.last_name,
        gender: payload.gender,
        is_mobile_verified: false,
        is_active: false,
        role: USER_TYPE.DOCTOR,
        is_invited: true,
        hospital_code
      };
      console.log('doctor',doctor)
      const savedDoctor: any = await this.userRepository.create(doctor);
      console.log('savedDoctor',savedDoctor)
      // Generate verification token
      const verificationToken = this.jwtService.sign(
        { email: savedDoctor.email, id: savedDoctor._id },
        { expiresIn: '4d' },
      );

      const verificationUrl = `${this.configService.get<string>(
        'BACKEND_URL',
      )}/doctor/verify?token=${verificationToken}`;

      // Send verification email
      const emailHtml = doctorAddTemplate(
        doctor.first_name,
        doctor.last_name,
        hospital_code,
      );
      
      await this.emailService.sendMail(
        savedDoctor.email,
        'Welcome to the Health-Connect Platform',
        emailHtml,
      );
      console.log("🚀 ~ DoctorService ~ addDoctor ~ verificationUrl:", verificationUrl)

      return ResponseDto.success(
        savedDoctor,
        'Doctor created successfully. Verification email sent.',
        201,
      );
    } catch (error) {
      return ResponseDto.error(error.message, 500);
    }
  }

  async verifyDoctor(token: string): Promise<ResponseDto> {
    try {
      // Decode and verify the token
      const decoded = this.jwtService.verify(token);

      const doctor: any = await this.userRepository.findById(decoded.id);
      if (!doctor) {
        return ResponseDto.error('Doctor not found', 404);
      }

      if (doctor.is_active) {
        return ResponseDto.success(null, 'Doctor is already verified.', 200);
      }

      // Update the doctor status
      doctor.is_active = true;
      doctor.is_mobile_verified = true;
      await this.userRepository.updateById(doctor._id, doctor);

      return ResponseDto.success(null, 'Doctor verified successfully', 200);
    } catch (error) {
      return ResponseDto.error('Invalid or expired verification link.', 400);
    }
  }

  async editDoctor(id: string, payload: CreateDoctorDto): Promise<ResponseDto> {
    try {
      const existingDoctor = await (
        await this.userRepository.getTable()
      ).findOne({
        _id: id,
        role: USER_TYPE.DOCTOR,
      });

      if (!existingDoctor) {
        return ResponseDto.success(null, 'doctor not found', 404);
      }

      const updatedDoctor = await (
        await this.userRepository.getTable()
      ).findByIdAndUpdate(
        id,
        {
          email: payload.email,
          mobile_no: payload.mobile,
          date_of_birth: payload.date_of_birth,
          first_name: payload.first_name,
          last_name: payload.last_name,
          gender: payload.gender,
        },
        { new: true },
      );

      return ResponseDto.success(
        updatedDoctor,
        'Doctor updated successfully',
        200,
      );
    } catch (error) {
      return ResponseDto.error(error.message, 500);
    }
  }

  async deleteDoctor(id: string): Promise<ResponseDto> {
    try {
      const existingDoctor = await (
        await this.userRepository.getTable()
      ).findOne({
        _id: id,
        role: USER_TYPE.DOCTOR,
      });

      if (!existingDoctor) {
        return ResponseDto.success(null, 'doctor not found', 404);
      }

      await (await this.userRepository.getTable()).findByIdAndDelete(id);

      return ResponseDto.success(null, 'Doctor deleted successfully', 200);
    } catch (error) {
      return ResponseDto.error(error.message, 500);
    }
  }

  async list(paginationFilterDto: PaginationFilterDto): Promise<ResponseDto> {
    const { filters, page, limit } = paginationFilterDto;

    // Parse filters only if they are provided
    let parsedFilters = {};
    if (filters) {
      parsedFilters = this.parseFilters(filters);
    }

    // Fetch patients with pagination and filters
    const doctors = await this.userRepository.findAll(
      { ...paginationFilterDto, parsedFilters },
      USER_TYPE.DOCTOR,
    );
    // Create pageInfo object
    const pageInfo = {
      page: page || 1, // default to 1 if not provided
      limit: limit || 10, // default to 10 if not provided
      total: doctors.totalCount,
    };

    // Return success response
    return ResponseDto.success(
      { users: doctors.users, pageInfo },
      'Patients listed successfully',
    );
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
