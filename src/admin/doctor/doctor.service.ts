import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { USER_TYPE } from 'src/helpers/enums';
import { User } from 'src/shared/schemas/user.schema';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
@Injectable()
export class DoctorService {
  constructor(private userRepository: UserRepository) {}

  async addDoctor(payload: CreateDoctorDto): Promise<ResponseDto> {
    try {
      const checkExistingDr = await (
        await this.userRepository.getTable()
      ).findOne({
        $or: [{ email: payload.email }, { mobile_no: payload.mobile }],
        role: USER_TYPE.DOCTOR,
      });

      if (checkExistingDr) {
        return ResponseDto.success(
          null,
          'Doctor already exists with this email or mobile.',
          400,
        );
      }

      const doctor = new User();
      doctor.email = payload.email;
      doctor.mobile_no = payload.mobile;
      doctor.date_of_birth = payload.date_of_birth;
      doctor.first_name = payload.first_name;
      doctor.last_name = payload.last_name;
      doctor.gender = payload.gender;
      doctor.is_mobile_verified = true;
      doctor.is_active = true;
      doctor.role = USER_TYPE.DOCTOR;
      const saveDoctor = await this.userRepository.create(doctor);

      return ResponseDto.success(
        saveDoctor,
        'Doctor created successfully',
        201,
      );
    } catch (error) {
      return ResponseDto.error(error.message, 500);
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
