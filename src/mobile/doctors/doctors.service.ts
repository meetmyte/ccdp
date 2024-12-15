import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { AssignPatientDto } from './dto/assign-patient.dto';
import { ResponseDto } from 'src/helpers/dto/response.dto';
import { DoctorPatientAssignmentRepository } from 'src/shared/repositories/doctor-patients.repository';
import { PaginationFilterDto } from 'src/helpers/dto/paginationFilter.dto';
import { ConsultationRepository } from 'src/shared/repositories/consultation.repository';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { Types } from 'mongoose';
import { VisitsService } from '../patients/visits/visits.service';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly doctorPatientAssignmentRepository: DoctorPatientAssignmentRepository,
    private readonly userRepository: UserRepository,
    private readonly consultationRepository: ConsultationRepository,
    private readonly visitsService: VisitsService,
  ) {}

  async assignPatientToDoctor(
    assignPatientDto: AssignPatientDto,
    doctorId,
  ): Promise<ResponseDto> {
    const { patientId } = assignPatientDto;
    // Check if doctor exists
    const doctor = await this.userRepository.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Check if patient exists
    const patient = await this.userRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Check if already assigned
    const existingAssignment =
      await this.doctorPatientAssignmentRepository.findOne({
        doctorId: new Types.ObjectId(doctorId),
        patientId: new Types.ObjectId(patientId),
      });

    if (existingAssignment) {
      return ResponseDto.success(
        {
          ...existingAssignment.toJSON(),
          patient: {
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            mobile_no: patient.mobile_no,
            gender: patient.gender,
            medicare_code: patient.medicare_code,
          },
        },
        'Patient assigned to doctor successfully',
      );
    }

    // Create the assignment
    const assignment = await this.doctorPatientAssignmentRepository.create({
      doctorId: new Types.ObjectId(doctorId),
      patientId: new Types.ObjectId(patientId),
      assignedDate: new Date(),
    });

    return ResponseDto.success(
      {
        ...assignment,
        patient: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          mobile_no: patient.mobile_no,
          gender: patient.gender,
          medicare_code: patient.medicare_code,
        },
      },
      'Patient assigned to doctor successfully',
    );
  }

  async listAssignedPatients(
    doctorId: string,
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const { filters, page, limit, sortBy, sortOrder } = paginationFilterDto;

    let parsedFilters = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (error) {
        console.log('🚀 ~ DoctorsService ~ error:', error);
        throw new BadRequestException('Invalid filters format');
      }
    }

    const { patients, totalCount } =
      await this.doctorPatientAssignmentRepository.getAssignedPatientsWithPagination(
        doctorId,
        parsedFilters,
        page,
        limit,
        sortBy,
        sortOrder,
      );

    const pageInfo = {
      page: page || 1,
      limit: limit || 10,
      total: totalCount,
    };

    return ResponseDto.success(
      { patients, pageInfo },
      'Patients listed successfully',
    );
  }

  async addConsultation(
    createConsultationDto: CreateConsultationDto,
  ): Promise<ResponseDto> {
    const { patientId, doctorId, visitId, ...rest } = createConsultationDto;

    // Convert string IDs to ObjectId
    const consultationData = {
      ...rest,
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
      visitId: new Types.ObjectId(visitId),
    };

    const consultation =
      await this.consultationRepository.createConsultation(consultationData);
    return ResponseDto.success(consultation, 'Consultation added successfully');
  }

  async listConsultationsByDoctorId(
    doctorId: string,
    paginationFilterDto: PaginationFilterDto,
  ): Promise<ResponseDto> {
    const { consultations, totalCount } =
      await this.consultationRepository.findConsultationsByDoctorId(
        doctorId,
        paginationFilterDto,
      );

    const pageInfo = {
      page: paginationFilterDto.page || 1,
      limit: paginationFilterDto.limit || 10,
      total: totalCount,
    };

    return ResponseDto.success(
      { consultations, pageInfo },
      'Consultations retrieved successfully',
    );
  }

  async updateConsultation(
    consultationId: string,
    updateConsultationDto: UpdateConsultationDto,
  ): Promise<ResponseDto> {
    try {
      const { patientId, doctorId, visitId, ...rest } = updateConsultationDto;

      // Convert string IDs to ObjectId if provided
      const updateData = {
        ...rest,
        ...(patientId && { patientId: new Types.ObjectId(patientId) }),
        ...(doctorId && { doctorId: new Types.ObjectId(doctorId) }),
        ...(visitId && { visitId: new Types.ObjectId(visitId) }),
      };

      const updatedConsultation =
        await this.consultationRepository.updateConsultation(
          consultationId,
          updateData,
        );

      if (!updatedConsultation) {
        return ResponseDto.error('Consultation not found', 404);
      }

      return ResponseDto.success(
        updatedConsultation,
        'Consultation updated successfully',
      );
    } catch (error) {
      return ResponseDto.error(error.message, 500);
    }
  }

  async deleteConsultation(consultationId: string): Promise<ResponseDto> {
    const consultation =
      await this.consultationRepository.findConsultationById(consultationId);

    if (!consultation) {
      throw new NotFoundException('Consultation not found');
    }

    await this.consultationRepository.deleteConsultation(consultationId);
    return ResponseDto.success(null, 'Consultation deleted successfully');
  }

  async getVisitsByPatientId(
    doctorId: string,
    patientId: string,
  ): Promise<any> {
    try {
      const checkAssignment =
        await this.doctorPatientAssignmentRepository.findOne({
          doctorId: new Types.ObjectId(doctorId),
          patientId: new Types.ObjectId(patientId),
        });

      if (!checkAssignment) {
        return ResponseDto.error('Patient not assigned to doctor', 404);
      }

      const visits = await this.visitsService.allVistisOfPatient(patientId);
      return ResponseDto.success(visits, 'Visits retrived successfully.');
    } catch (error) {
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }

  async getDashboardMetrics(doctorId: string): Promise<ResponseDto> {
    try {
      // 1. Get the total number of consultations for the doctor
      const getTotalConsultations =
        await this.consultationRepository.getTotalCounts(doctorId);
      // 2. Get today's consultations for the doctor
      const todaysConsultations =
        await this.consultationRepository.getTodayTotalCounts(doctorId);

      // Return the response with resolved values
      return ResponseDto.success(
        {
          totalConsultations: getTotalConsultations,
          todaysConsultations: todaysConsultations,
        },
        'Success',
      );
    } catch (error) {
      // Handle any errors gracefully
      return ResponseDto.error(error.message || 'Something went wrong.', 500);
    }
  }
}
